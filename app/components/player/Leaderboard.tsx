import { formatCurrency } from "@/lib/format";
import type { LeaderboardEntry } from "@/lib/queries";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const hasAnyWinnings = entries.some((e) => e.totalWinnings > 0);

  return (
    <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="mb-4 text-lg font-bold">🏆 排行榜</h2>
      {!hasAnyWinnings ? (
        <p className="text-sm text-gray-500">目前還沒有人中獎，敬請期待！</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.playerId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                i === 0
                  ? "bg-amber-50 dark:bg-amber-950/20"
                  : "bg-black/[0.02] dark:bg-white/[0.03]"
              }`}
            >
              <span className="w-7 shrink-0 text-center text-lg">
                {MEDALS[i] ?? `#${i + 1}`}
              </span>
              <span className="flex-1 font-semibold">{entry.name}</span>
              <span className="text-xs text-gray-500">{entry.winCount} 次中獎</span>
              <span className="font-bold text-amber-600">{formatCurrency(entry.totalWinnings)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
