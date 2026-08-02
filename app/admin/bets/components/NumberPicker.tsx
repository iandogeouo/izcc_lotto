"use client";

import { pickUniqueRandomNumbers } from "@/lib/draw";

export function NumberPicker({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (numbers: number[]) => void;
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
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-10">
        {Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
          const isSelected = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              disabled={!isSelected && selected.length >= 6}
              className={`aspect-square rounded-md text-sm font-bold transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "border border-black/10 hover:bg-black/5 disabled:opacity-30 dark:border-white/20 dark:hover:bg-white/10"
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
          onClick={() => onChange(pickUniqueRandomNumbers(6, 1, 49))}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          隨機選號
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          清除
        </button>
        <span className="text-sm text-gray-500">已選 {selected.length}/6</span>
      </div>
    </div>
  );
}
