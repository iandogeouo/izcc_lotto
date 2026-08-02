import { z } from "zod";

export const betNumbersSchema = z
  .array(z.number().int().min(1).max(49))
  .length(6)
  .refine((nums) => new Set(nums).size === 6, {
    message: "6 個號碼不能重複",
  });

export const createBetSchema = z.object({
  drawId: z.number().int().positive(),
  playerId: z.number().int().positive(),
  numbers: betNumbersSchema,
});

export const updateBetSchema = z.object({
  numbers: betNumbersSchema,
});

export const settingsUpdateSchema = z.object({
  betPrice: z.number().int().positive(),
  baseJackpotAmount: z.number().int().min(0),
  prize2Amount: z.number().int().min(0),
  prize3Amount: z.number().int().min(0),
  prize4Amount: z.number().int().min(0),
  prize5Amount: z.number().int().min(0),
  prize6Amount: z.number().int().min(0),
  prize7Amount: z.number().int().min(0),
});
