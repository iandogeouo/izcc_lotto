"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { NumberBall } from "@/app/components/shared/NumberBall";

interface TierSummary {
  tier: string;
  winnerCount: number;
  amountPerWinner: number;
}

interface DrawResult {
  drawId: number;
  numbers: number[];
  specialNumber: number;
  pool: number;
  totalBets: number;
  tierSummary: TierSummary[];
}

export function DrawTrigger({
  drawId,
  pool,
  totalBets,
}: {
  drawId: number;
  pool: number;
  totalBets: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 目前這顆按鈕對應的期別是否已經開過獎了（用 result 記錄的期別跟目前 prop 期別比對，
  // 而不是單純看 result 是否存在，避免期別自動推進到下一期後按鈕一直卡在「已開獎」）
  const isCurrentRoundDrawn = result?.drawId === drawId;

  async function handleExecute() {
    if (!confirm(`確定要開出第 ${drawId} 期嗎？此動作無法復原。`)) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/draws/${drawId}/execute`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        router.refresh();
      } else {
        setError(data.error ?? "開獎失敗");
      }
    } catch {
      setError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="text-lg font-bold">第 {drawId} 期</h2>
      <p className="text-sm text-gray-500">
        目前總注數：<span className="font-semibold text-black dark:text-white">{totalBets}</span>
        　目前獎池：<span className="font-semibold text-amber-600">{formatCurrency(pool)}</span>
      </p>
      <button
        type="button"
        onClick={handleExecute}
        disabled={submitting || isCurrentRoundDrawn}
        className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600"
      >
        {submitting ? "開獎中..." : isCurrentRoundDrawn ? "已開獎" : "🎉 觸發開獎"}
      </button>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-500">
            第 {result.drawId} 期開獎結果
            {!isCurrentRoundDrawn && "（新一期已開始，此為上一期結果）"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {result.numbers.map((n) => (
              <NumberBall key={n} n={n} />
            ))}
            <span className="mx-1 text-gray-400">+</span>
            <NumberBall n={result.specialNumber} special />
          </div>
          <p className="text-sm">
            本期獎池：{formatCurrency(result.pool)}（共 {result.totalBets} 注）
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left dark:border-white/10">
                  <th className="py-1 pr-4">獎項</th>
                  <th className="py-1 pr-4">中獎注數</th>
                  <th className="py-1">每注獎金</th>
                </tr>
              </thead>
              <tbody>
                {result.tierSummary.map((t) => (
                  <tr key={t.tier} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-1 pr-4">{t.tier}</td>
                    <td className="py-1 pr-4">{t.winnerCount}</td>
                    <td className="py-1">{t.winnerCount > 0 ? formatCurrency(t.amountPerWinner) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">開獎完成，新一期已自動建立，玩家頁面已可看到最新結果。</p>
        </div>
      )}
    </div>
  );
}
