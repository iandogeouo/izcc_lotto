export type DrawStatusValue = "PENDING" | "DRAWN";

export type PrizeTier =
  | "頭獎"
  | "貳獎"
  | "參獎"
  | "肆獎"
  | "伍獎"
  | "陸獎"
  | "普獎"
  | null;

export interface PrizeConfig {
  prize2Amount: number;
  prize3Amount: number;
  prize4Amount: number;
  prize5Amount: number;
  prize6Amount: number;
  prize7Amount: number;
}

export interface SettingsConfig extends PrizeConfig {
  betPrice: number;
  baseJackpotAmount: number;
}

// 對獎結果對應的固定金額（頭獎另外計算，不在此表中）
export const PRIZE_TIER_LABELS: Exclude<PrizeTier, null>[] = [
  "頭獎",
  "貳獎",
  "參獎",
  "肆獎",
  "伍獎",
  "陸獎",
  "普獎",
];
