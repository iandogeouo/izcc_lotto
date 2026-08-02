import Link from "next/link";
import { notFound } from "next/navigation";
import { NumberBall } from "@/app/components/shared/NumberBall";
import { AutoRefresh } from "@/app/components/shared/AutoRefresh";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  computePoolAmount,
  getDrawBetsCapped,
  getDrawById,
  getRoundWinnerSummary,
  toNumberArray,
} from "@/lib/queries";
import { ClaimToggle } from "./components/ClaimToggle";
import { TeamSummary } from "./components/TeamSummary";

export const dynamic = "force-dynamic";

const BET_LIST_LIMIT = 200;

export default async function AdminDrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drawId = Number(id);
  const draw = await getDrawById(drawId);
  if (!draw) notFound();

  const isDrawn = draw.status === "DRAWN";

  const [pool, { items: bets, totalCount }, winnerSummary] = await Promise.all([
    computePoolAmount(draw.id, draw.basePoolAmount),
    getDrawBetsCapped(draw.id, BET_LIST_LIMIT),
    isDrawn ? getRoundWinnerSummary(draw.id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={15000} />
      <Link href="/admin/draws" className="text-sm font-medium text-blue-600 hover:underline">
        ← 返回開獎作業
      </Link>
      <h1 className="text-2xl font-bold">第 {draw.id} 期詳細資料</h1>

      <div className="space-y-2 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
        {isDrawn ? (
          <div className="flex flex-wrap items-center gap-2">
            {toNumberArray(draw.numbers).map((n) => (
              <NumberBall key={n} n={n} />
            ))}
            <span className="mx-1 text-gray-400">+</span>
            {draw.specialNumber != null && <NumberBall n={draw.specialNumber} special />}
          </div>
        ) : (
          <p className="text-gray-500">尚未開獎</p>
        )}
        <p className="text-sm text-gray-500">
          {isDrawn && draw.drawnAt ? `開獎時間：${formatDateTime(draw.drawnAt)}　` : ""}
          獎池：<span className="font-medium text-amber-600">{formatCurrency(pool)}</span>　總注數：
          {totalCount}
        </p>
      </div>

      {isDrawn && <TeamSummary drawId={draw.id} entries={winnerSummary} />}

      <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
        <h2 className="mb-1 text-lg font-bold">各注下注與對獎明細</h2>
        {totalCount > bets.length && (
          <p className="mb-3 text-xs text-gray-500">
            共 {totalCount} 注，依獎金高到低僅顯示前 {bets.length} 注
          </p>
        )}
        {bets.length === 0 ? (
          <p className="text-sm text-gray-500">這一期沒有下注紀錄。</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {bets.map((bet) => (
              <li key={bet.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-16 shrink-0 font-semibold">{bet.player.name}</span>
                <div className="flex flex-wrap gap-1">
                  {toNumberArray(bet.numbers).map((n) => (
                    <NumberBall key={n} n={n} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{formatDateTime(bet.betAt)}</span>
                {isDrawn && (
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm">
                      對中 {bet.matchedCount} 個{bet.matchedSpecial ? " + 特別號" : ""} →{" "}
                      {bet.prizeTier ? (
                        <span className="font-bold text-amber-600">
                          {bet.prizeTier}（{formatCurrency(bet.prizeAmount ?? 0)}）
                        </span>
                      ) : (
                        <span className="text-gray-500">未中獎</span>
                      )}
                    </span>
                    {bet.prizeTier && <ClaimToggle betId={bet.id} claimed={bet.claimed} />}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
