import { describe, expect, it } from "vitest";
import { calculatePrizeAmount, determineTier, matchBet } from "../lib/prizeLogic";
import type { PrizeConfig } from "../lib/types";

const WINNING = [1, 2, 3, 4, 5, 6];
const SPECIAL = 7;

const CONFIG: PrizeConfig = {
  prize2Amount: 3_000_000,
  prize3Amount: 200_000,
  prize4Amount: 20_000,
  prize5Amount: 2_000,
  prize6Amount: 400,
  prize7Amount: 400,
};

describe("determineTier", () => {
  it("6 中 → 頭獎", () => {
    expect(determineTier(6, false)).toBe("頭獎");
  });

  it("5 中 + 特別號 → 貳獎", () => {
    expect(determineTier(5, true)).toBe("貳獎");
  });

  it("5 中，無特別號 → 參獎", () => {
    expect(determineTier(5, false)).toBe("參獎");
  });

  it("4 中 + 特別號 → 肆獎", () => {
    expect(determineTier(4, true)).toBe("肆獎");
  });

  it("4 中，無特別號 → 肆獎（特別號無關）", () => {
    expect(determineTier(4, false)).toBe("肆獎");
  });

  it("3 中 → 伍獎", () => {
    expect(determineTier(3, false)).toBe("伍獎");
  });

  it("2 中 + 特別號 → 陸獎", () => {
    expect(determineTier(2, true)).toBe("陸獎");
  });

  it("2 中，無特別號 → 不中獎", () => {
    expect(determineTier(2, false)).toBeNull();
  });

  it("0 中 + 特別號 → 普獎", () => {
    expect(determineTier(0, true)).toBe("普獎");
  });

  it("0 中，無特別號 → 不中獎", () => {
    expect(determineTier(0, false)).toBeNull();
  });

  it("1 中（有無特別號皆不中獎）", () => {
    expect(determineTier(1, true)).toBeNull();
    expect(determineTier(1, false)).toBeNull();
  });
});

describe("matchBet", () => {
  it("正確計算完全命中頭獎", () => {
    const result = matchBet([1, 2, 3, 4, 5, 6], WINNING, SPECIAL);
    expect(result).toEqual({ matchedCount: 6, matchedSpecial: false, tier: "頭獎" });
  });

  it("命中 5 個號碼 + 特別號 → 貳獎", () => {
    const result = matchBet([1, 2, 3, 4, 5, SPECIAL], WINNING, SPECIAL);
    expect(result.matchedCount).toBe(5);
    expect(result.matchedSpecial).toBe(true);
    expect(result.tier).toBe("貳獎");
  });

  it("號碼順序不影響結果", () => {
    const a = matchBet([6, 5, 4, 3, 2, 1], WINNING, SPECIAL);
    const b = matchBet([1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1], SPECIAL);
    expect(a.matchedCount).toBe(6);
    expect(b.matchedCount).toBe(6);
  });

  it("完全沒中，也沒中特別號", () => {
    const result = matchBet([40, 41, 42, 43, 44, 45], WINNING, SPECIAL);
    expect(result).toEqual({ matchedCount: 0, matchedSpecial: false, tier: null });
  });
});

describe("calculatePrizeAmount", () => {
  it("tier=null → 0", () => {
    expect(calculatePrizeAmount(null, 8_000_000, 0, CONFIG)).toBe(0);
  });

  it("頭獎：pool 均分給得獎人數", () => {
    expect(calculatePrizeAmount("頭獎", 8_000_000, 2, CONFIG)).toBe(4_000_000);
  });

  it("頭獎：除不盡時無條件捨去餘數", () => {
    expect(calculatePrizeAmount("頭獎", 7_000_001, 2, CONFIG)).toBe(3_500_000);
  });

  it("頭獎：得獎人數為 0 時回傳 0（防止除以 0）", () => {
    expect(calculatePrizeAmount("頭獎", 5_000_000, 0, CONFIG)).toBe(0);
  });

  it.each([
    ["貳獎", 3_000_000],
    ["參獎", 200_000],
    ["肆獎", 20_000],
    ["伍獎", 2_000],
    ["陸獎", 400],
    ["普獎", 400],
  ] as const)("%s → 固定金額 %i，與 pool/winnerCount 無關", (tier, amount) => {
    expect(calculatePrizeAmount(tier, 999, 999, CONFIG)).toBe(amount);
    expect(calculatePrizeAmount(tier, 1, 1, CONFIG)).toBe(amount);
  });
});
