import { LOTTO_MIN_NUMBER } from "./types";

export interface DrawNumbers {
  numbers: number[];
  specialNumber: number;
}

// 從 min–max（含）中隨機取 count 個不重複的整數，依大小排序
export function pickUniqueRandomNumbers(
  count: number,
  min: number,
  max: number,
  rng: () => number = Math.random
): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

// 開出 6 個一般號碼（1–maxNumber）+ 1 個特別號（從剩下的號碼中抽出，不會與 6 碼重複）
export function generateDrawNumbers(
  maxNumber: number,
  rng: () => number = Math.random
): DrawNumbers {
  const numbers = pickUniqueRandomNumbers(6, LOTTO_MIN_NUMBER, maxNumber, rng);
  const remaining = Array.from(
    { length: maxNumber - LOTTO_MIN_NUMBER + 1 },
    (_, i) => i + LOTTO_MIN_NUMBER
  ).filter((n) => !numbers.includes(n));
  const specialIndex = Math.floor(rng() * remaining.length);
  const specialNumber = remaining[specialIndex];
  return { numbers, specialNumber };
}

// 下一期開獎時間：以現在時間為基準，15 分鐘後
export function getNextDrawTime(from: Date = new Date()): Date {
  return new Date(from.getTime() + 15 * 60 * 1000);
}
