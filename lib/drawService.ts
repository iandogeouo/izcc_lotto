import { prisma } from "./prisma";
import { calculatePrizeAmount, matchBet } from "./prizeLogic";
import { generateDrawNumbers, getNextDrawTime } from "./draw";
import { getSettings, toNumberArray } from "./queries";
import { PRIZE_TIER_LABELS, type PrizeTier } from "./types";

export class DrawNotPendingError extends Error {
  constructor(drawId: number) {
    super(`Draw ${drawId} is not in PENDING status`);
    this.name = "DrawNotPendingError";
  }
}

export interface DrawExecutionSummary {
  drawId: number;
  numbers: number[];
  specialNumber: number;
  pool: number;
  totalBets: number;
  nextDrawId: number;
  tierSummary: { tier: Exclude<PrizeTier, null>; winnerCount: number; amountPerWinner: number }[];
}

// SQLite 對單一陳述式的參數數量有上限，id IN (...) 一次不要塞太多，分批處理
const UPDATE_CHUNK_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

// 開獎兩階段流程：Pass 1 對獎統計頭獎人數 → Pass 2 依頭獎人數計算獎金分配
// overrideNumbers 僅供 seed script 用來製造「保證中頭獎」的示範情境，正常流程一律隨機開獎
export async function executeDrawForRound(
  drawId: number,
  overrideNumbers?: { numbers: number[]; specialNumber: number }
): Promise<DrawExecutionSummary> {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) throw new Error(`Draw ${drawId} not found`);
  if (draw.status !== "PENDING") throw new DrawNotPendingError(drawId);

  // 原子性「認領」：用 WHERE status=PENDING 的 updateMany 卡住 race condition，
  // 避免兩個管理員在同一瞬間各自按下開獎時，兩邊都通過上面的檢查、各自算出不同的開獎號碼並重複結算
  const claim = await prisma.draw.updateMany({
    where: { id: drawId, status: "PENDING" },
    data: { status: "DRAWN" },
  });
  if (claim.count === 0) throw new DrawNotPendingError(drawId);

  const settings = await getSettings();
  const { numbers, specialNumber } = overrideNumbers ?? generateDrawNumbers(settings.numberPoolSize);

  const bets = await prisma.bet.findMany({ where: { drawId } });

  // Pass 1: 對獎並統計頭獎人數
  const matchResults = bets.map((bet) => ({
    bet,
    result: matchBet(toNumberArray(bet.numbers), numbers, specialNumber),
  }));
  const firstPrizeWinnerCount = matchResults.filter(
    (m) => m.result.tier === "頭獎"
  ).length;

  const pool = draw.basePoolAmount + bets.length * settings.betPrice;

  // Pass 2: 依 pool 與頭獎人數計算每注獎金
  const settled = matchResults.map(({ bet, result }) => ({
    betId: bet.id,
    matchedCount: result.matchedCount,
    matchedSpecial: result.matchedSpecial,
    prizeTier: result.tier,
    prizeAmount: calculatePrizeAmount(result.tier, pool, firstPrizeWinnerCount, settings),
  }));

  // 結算結果的組合數其實有限（matchedCount 0~6 × matchedSpecial 2 種），把 id 相同結果的下注
  // 分組後用 updateMany 一次處理一整組，避免注數一多（例如上萬筆）就要對資料庫下上萬次個別
  // UPDATE，造成請求long-running、記憶體暴增甚至看起來像當機
  const groups = new Map<string, { data: Omit<(typeof settled)[number], "betId">; betIds: number[] }>();
  for (const s of settled) {
    const key = `${s.matchedCount}|${s.matchedSpecial}|${s.prizeTier}|${s.prizeAmount}`;
    const existing = groups.get(key);
    if (existing) {
      existing.betIds.push(s.betId);
    } else {
      groups.set(key, {
        data: {
          matchedCount: s.matchedCount,
          matchedSpecial: s.matchedSpecial,
          prizeTier: s.prizeTier,
          prizeAmount: s.prizeAmount,
        },
        betIds: [s.betId],
      });
    }
  }

  const betUpdateOps = Array.from(groups.values()).flatMap((group) =>
    chunk(group.betIds, UPDATE_CHUNK_SIZE).map((betIds) =>
      prisma.bet.updateMany({
        where: { id: { in: betIds } },
        data: group.data,
      })
    )
  );

  const nextBasePoolAmount = firstPrizeWinnerCount > 0 ? settings.baseJackpotAmount : pool;
  const drawnAt = new Date();

  const [, nextDraw] = await prisma.$transaction([
    prisma.draw.update({
      where: { id: drawId },
      data: {
        status: "DRAWN",
        numbers,
        specialNumber,
        drawnAt,
      },
    }),
    prisma.draw.create({
      data: {
        status: "PENDING",
        drawTime: getNextDrawTime(drawnAt),
        basePoolAmount: nextBasePoolAmount,
      },
    }),
    ...betUpdateOps,
  ]);

  const tierSummary = PRIZE_TIER_LABELS.map((tier) => {
    const winners = settled.filter((s) => s.prizeTier === tier);
    return {
      tier,
      winnerCount: winners.length,
      amountPerWinner: winners[0]?.prizeAmount ?? 0,
    };
  });

  return {
    drawId,
    numbers,
    specialNumber,
    pool,
    totalBets: bets.length,
    nextDrawId: nextDraw.id,
    tierSummary,
  };
}
