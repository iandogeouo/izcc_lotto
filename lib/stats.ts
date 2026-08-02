export interface BetStatsResult {
  totalBets: number;
  histogram: Record<number, number>;
}

// 計算本期下注統計：總注數 + 1–49 每個號碼被下注的次數
export function computeNumberHistogram(betsNumbers: number[][]): BetStatsResult {
  const histogram: Record<number, number> = {};
  for (let n = 1; n <= 49; n++) histogram[n] = 0;
  for (const numbers of betsNumbers) {
    for (const n of numbers) {
      histogram[n] = (histogram[n] ?? 0) + 1;
    }
  }
  return { totalBets: betsNumbers.length, histogram };
}
