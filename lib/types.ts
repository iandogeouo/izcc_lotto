export type DrawStatusValue = "PENDING" | "DRAWN";

// 選號範圍固定從 1 開始，上限（numberPoolSize）可在 Settings 調整
export const LOTTO_MIN_NUMBER = 1;
export const DEFAULT_NUMBER_POOL_SIZE = 20;

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
  numberPoolSize: number;
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
