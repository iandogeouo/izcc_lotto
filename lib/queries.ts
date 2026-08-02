import { prisma } from "./prisma";
import { computeNumberHistogram } from "./stats";
import type { SettingsConfig } from "./types";

const DEFAULT_SETTINGS: Omit<SettingsConfig, never> = {
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

export async function getPlayers() {
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
  const bets = await prisma.bet.findMany({
    where: { drawId },
    select: { numbers: true },
  });
  return computeNumberHistogram(bets.map((b) => toNumberArray(b.numbers)));
}

export async function computePoolAmount(drawId: number, basePoolAmount: number) {
  const settings = await getSettings();
  const betCount = await prisma.bet.count({ where: { drawId } });
  return basePoolAmount + betCount * settings.betPrice;
}

export async function getBetsByDrawAndPlayer(drawId: number, playerId?: number) {
  return prisma.bet.findMany({
    where: { drawId, ...(playerId ? { playerId } : {}) },
    include: { player: true },
    orderBy: { id: "asc" },
  });
}
