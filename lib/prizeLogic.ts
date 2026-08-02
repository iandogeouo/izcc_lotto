import type { PrizeConfig, PrizeTier } from "./types";

export interface MatchResult {
  matchedCount: number;
  matchedSpecial: boolean;
  tier: PrizeTier;
}

export function matchBet(
  betNumbers: number[],
  winningNumbers: number[],
  specialNumber: number
): MatchResult {
  const winningSet = new Set(winningNumbers);
  const matchedCount = betNumbers.filter((n) => winningSet.has(n)).length;
  const matchedSpecial = betNumbers.includes(specialNumber);
  const tier = determineTier(matchedCount, matchedSpecial);
  return { matchedCount, matchedSpecial, tier };
}

export function determineTier(
  matchedCount: number,
  matchedSpecial: boolean
): PrizeTier {
  if (matchedCount === 6) return "頭獎";
  if (matchedCount === 5 && matchedSpecial) return "貳獎";
  if (matchedCount === 5) return "參獎";
  if (matchedCount === 4) return "肆獎";
  if (matchedCount === 3) return "伍獎";
  if (matchedCount === 2 && matchedSpecial) return "陸獎";
  if (matchedCount === 0 && matchedSpecial) return "普獎";
  return null;
}

export function calculatePrizeAmount(
  tier: PrizeTier,
  pool: number,
  firstPrizeWinnerCount: number,
  config: PrizeConfig
): number {
  switch (tier) {
    case "頭獎":
      if (firstPrizeWinnerCount <= 0) return 0;
      return Math.floor(pool / firstPrizeWinnerCount);
    case "貳獎":
      return config.prize2Amount;
    case "參獎":
      return config.prize3Amount;
    case "肆獎":
      return config.prize4Amount;
    case "伍獎":
      return config.prize5Amount;
    case "陸獎":
      return config.prize6Amount;
    case "普獎":
      return config.prize7Amount;
    default:
      return 0;
  }
}
