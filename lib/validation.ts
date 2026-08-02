import { z } from "zod";
import { LOTTO_MIN_NUMBER } from "./types";

// 上限（numberPoolSize）是可調整的，這裡只做結構性檢查；實際上限需在 API route
// 讀到目前的 Settings 後另外用 validateNumbersWithinPool() 檢查
export const betNumbersSchema = z
  .array(z.number().int().min(LOTTO_MIN_NUMBER))
  .length(6)
  .refine((nums) => new Set(nums).size === 6, {
    message: "6 個號碼不能重複",
  });

export function validateNumbersWithinPool(numbers: number[], numberPoolSize: number): boolean {
  return numbers.every((n) => n <= numberPoolSize);
}

export const createBetSchema = z.object({
  drawId: z.number().int().positive(),
  playerId: z.number().int().positive(),
  numbers: betNumbersSchema,
});

export const updateBetSchema = z.object({
  numbers: betNumbersSchema,
});

export const randomBetsSchema = z.object({
  drawId: z.number().int().positive(),
  playerId: z.number().int().positive(),
  count: z.number().int().min(1).max(100),
});

export const settingsUpdateSchema = z.object({
  numberPoolSize: z.number().int().min(7).max(99),
  betPrice: z.number().int().positive(),
  baseJackpotAmount: z.number().int().min(0),
  prize2Amount: z.number().int().min(0),
  prize3Amount: z.number().int().min(0),
  prize4Amount: z.number().int().min(0),
  prize5Amount: z.number().int().min(0),
  prize6Amount: z.number().int().min(0),
  prize7Amount: z.number().int().min(0),
});
