"use client";

import { pickUniqueRandomNumbers } from "@/lib/draw";
import { LOTTO_MIN_NUMBER } from "@/lib/types";

export function NumberPicker({
  selected,
  onChange,
  maxNumber,
}: {
  selected: number[];
  onChange: (numbers: number[]) => void;
  maxNumber: number;
}) {
  function toggle(n: number) {
    if (selected.includes(n)) {
      onChange(selected.filter((x) => x !== n));
    } else if (selected.length < 6) {
      onChange([...selected, n].sort((a, b) => a - b));
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
        {Array.from(
          { length: maxNumber - LOTTO_MIN_NUMBER + 1 },
          (_, i) => i + LOTTO_MIN_NUMBER
        ).map((n) => {
          const isSelected = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              disabled={!isSelected && selected.length >= 6}
              className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                isSelected
                  ? "scale-105 bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "border border-black/10 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-30 disabled:hover:border-black/10 disabled:hover:bg-transparent dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(pickUniqueRandomNumbers(6, LOTTO_MIN_NUMBER, maxNumber))}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          🎲 隨機選號
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          清除
        </button>
        <span className="text-sm text-gray-500">已選 {selected.length}/6</span>
      </div>
    </div>
  );
}
