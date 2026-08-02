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

// 開獎兩階段流程：Pass 1 對獎統計頭獎人數 → Pass 2 依頭獎人數計算獎金分配
// overrideNumbers 僅供 seed script 用來製造「保證中頭獎」的示範情境，正常流程一律隨機開獎
export async function executeDrawForRound(
  drawId: number,
  overrideNumbers?: { numbers: number[]; specialNumber: number }
): Promise<DrawExecutionSummary> {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) throw new Error(`Draw ${drawId} not found`);
  if (draw.status !== "PENDING") throw new DrawNotPendingError(drawId);

  const settings = await getSettings();
  const { numbers, specialNumber } = overrideNumbers ?? generateDrawNumbers();

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
    ...settled.map((s) =>
      prisma.bet.update({
        where: { id: s.betId },
        data: {
          matchedCount: s.matchedCount,
          matchedSpecial: s.matchedSpecial,
          prizeTier: s.prizeTier,
          prizeAmount: s.prizeAmount,
        },
      })
    ),
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
