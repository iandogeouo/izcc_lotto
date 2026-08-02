"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

interface Entry {
  playerId: number;
  name: string;
  totalAmount: number;
  winCount: number;
  claimedCount: number;
  allClaimed: boolean;
}

export function TeamSummary({ drawId, entries }: { drawId: number; entries: Entry[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (entries.length === 0) return null;

  async function claimAll(playerId: number) {
    setPendingId(playerId);
    setError(null);
    try {
      const res = await fetch(`/api/draws/${drawId}/claim-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, claimed: true }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "更新失敗");
      }
    } catch {
      setError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="mb-4 text-lg font-bold">💵 小隊中獎統計</h2>
      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {entries.map((e) => (
          <li
            key={e.playerId}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-black/5 px-3 py-2 dark:border-white/5"
          >
            <span className="w-16 shrink-0 font-semibold">{e.name}</span>
            <span className="text-sm text-gray-500">
              {e.winCount} 注中獎・已領 {e.claimedCount}/{e.winCount}
            </span>
            <span className="font-bold text-amber-600">{formatCurrency(e.totalAmount)}</span>
            <button
              type="button"
              onClick={() => claimAll(e.playerId)}
              disabled={e.allClaimed || pendingId === e.playerId}
              className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600"
            >
              {pendingId === e.playerId ? "處理中..." : e.allClaimed ? "✅ 已全部領獎" : "一鍵領獎"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
