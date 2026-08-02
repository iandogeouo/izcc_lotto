import { prisma } from "./prisma";
import { DEFAULT_NUMBER_POOL_SIZE, type SettingsConfig } from "./types";

const DEFAULT_SETTINGS: Omit<SettingsConfig, never> = {
  numberPoolSize: DEFAULT_NUMBER_POOL_SIZE,
  betPrice: 50,
  baseJackpotAmount: 5_000_000,
  prize2Amount: 3_000_000,
  prize3Amount: 200_000,
  prize4Amount: 20_000,
  prize5Amount: 2_000,
  prize6Amount: 400,
  prize7Amount: 400,
};

export function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value as number[];
}

export async function getSettings(): Promise<SettingsConfig> {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SETTINGS },
  });
  return settings;
}

const FIXED_PLAYER_NAMES = ["零小", "一小", "二小", "三小", "四小"];

// 固定玩家名單是已知常數資料；若資料表被清空（例如 migrate reset 忘記重新 seed），
// 下次讀取時自動補回，行為與 getSettings() 的自我修復一致
export async function getPlayers() {
  const existing = await prisma.player.findMany({ orderBy: { id: "asc" } });
  if (existing.length > 0) return existing;

  try {
    await prisma.player.createMany({
      data: FIXED_PLAYER_NAMES.map((name) => ({ name })),
    });
  } catch {
    // 罕見的並發情況：另一個請求已經同時補回玩家名單，忽略唯一性衝突即可
  }
  return prisma.player.findMany({ orderBy: { id: "asc" } });
}

export async function getCurrentDraw() {
  return prisma.draw.findFirst({
    where: { status: "PENDING" },
    orderBy: { id: "asc" },
  });
}

export async function getDrawById(id: number) {
  return prisma.draw.findUnique({ where: { id } });
}

export async function getDrawHistory() {
  return prisma.draw.findMany({
    where: { status: "DRAWN" },
    orderBy: { id: "desc" },
  });
}

export async function getDrawStats(drawId: number) {
  const totalBets = await prisma.bet.count({ where: { drawId } });
  return { totalBets };
}

export async function computePoolAmount(drawId: number, basePoolAmount: number) {
  const settings = await getSettings();
  const betCount = await prisma.bet.count({ where: { drawId } });
  return basePoolAmount + betCount * settings.betPrice;
}

// 該期下注明細，依獎金高到低排序並限制筆數（避免下注數上萬筆時整頁被撐爆）
export async function getDrawBetsCapped(drawId: number, limit: number) {
  const [items, totalCount] = await Promise.all([
    prisma.bet.findMany({
      where: { drawId },
      include: { player: true },
      orderBy: [{ prizeAmount: "desc" }, { id: "asc" }],
      take: limit,
    }),
    prisma.bet.count({ where: { drawId } }),
  ]);
  return { items, totalCount };
}

export interface LeaderboardEntry {
  playerId: number;
  name: string;
  totalWinnings: number;
  winCount: number;
}

// 依玩家歷史累積中獎金額排名（跨所有已開獎期別）
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [players, wins] = await Promise.all([
    getPlayers(),
    prisma.bet.groupBy({
      by: ["playerId"],
      where: { prizeTier: { not: null } },
      _sum: { prizeAmount: true },
      _count: { _all: true },
    }),
  ]);

  const winsByPlayer = new Map(wins.map((w) => [w.playerId, w]));
  return players
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      totalWinnings: winsByPlayer.get(p.id)?._sum.prizeAmount ?? 0,
      winCount: winsByPlayer.get(p.id)?._count._all ?? 0,
    }))
    .sort((a, b) => b.totalWinnings - a.totalWinnings);
}

// 最新一期（已開獎）的中獎名單，依獎金高到低排序
export async function getRecentWinners(drawId: number) {
  return prisma.bet.findMany({
    where: { drawId, prizeTier: { not: null } },
    include: { player: true },
    orderBy: { prizeAmount: "desc" },
  });
}

export interface RoundWinnerSummary {
  playerId: number;
  name: string;
  totalAmount: number;
  winCount: number;
  claimedCount: number;
  allClaimed: boolean;
}

// 該期每個玩家（小隊）的中獎金額加總與領獎進度，用於「一鍵領獎」功能
export async function getRoundWinnerSummary(drawId: number): Promise<RoundWinnerSummary[]> {
  const bets = await prisma.bet.findMany({
    where: { drawId, prizeTier: { not: null } },
    include: { player: true },
  });

  const byPlayer = new Map<number, RoundWinnerSummary>();
  for (const bet of bets) {
    const entry = byPlayer.get(bet.playerId) ?? {
      playerId: bet.playerId,
      name: bet.player.name,
      totalAmount: 0,
      winCount: 0,
      claimedCount: 0,
      allClaimed: true,
    };
    entry.totalAmount += bet.prizeAmount ?? 0;
    entry.winCount += 1;
    if (bet.claimed) entry.claimedCount += 1;
    byPlayer.set(bet.playerId, entry);
  }

  return Array.from(byPlayer.values())
    .map((e) => ({ ...e, allClaimed: e.claimedCount === e.winCount }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}
