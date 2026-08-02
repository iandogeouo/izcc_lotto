import Link from "next/link";
import { notFound } from "next/navigation";
import { NumberBall } from "@/app/components/shared/NumberBall";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { computePoolAmount, getBetsByDrawAndPlayer, getDrawById, toNumberArray } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drawId = Number(id);
  const draw = await getDrawById(drawId);
  if (!draw) notFound();

  const [pool, bets] = await Promise.all([
    computePoolAmount(draw.id, draw.basePoolAmount),
    getBetsByDrawAndPlayer(draw.id),
  ]);

  const isDrawn = draw.status === "DRAWN";
  const sortedBets = [...bets].sort((a, b) => (b.prizeAmount ?? 0) - (a.prizeAmount ?? 0));

  return (
    <div className="space-y-6">
      <Link href="/admin/draws" className="text-sm text-blue-600 hover:underline">
        ← 返回開獎作業
      </Link>
      <h1 className="text-2xl font-bold">第 {draw.id} 期詳細資料</h1>

      <div className="space-y-2 rounded-xl border border-black/10 p-5 dark:border-white/10">
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
          獎池：{formatCurrency(pool)}　總注數：{bets.length}
        </p>
      </div>

      <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-4 text-lg font-bold">各注下注與對獎明細</h2>
        {bets.length === 0 ? (
          <p className="text-sm text-gray-500">這一期沒有下注紀錄。</p>
        ) : (
          <ul className="space-y-2">
            {sortedBets.map((bet) => (
              <li
                key={bet.id}
                className="flex flex-wrap items-center gap-3 border-b border-black/5 py-2 last:border-0 dark:border-white/5"
              >
                <span className="w-16 shrink-0 font-semibold">{bet.player.name}</span>
                <div className="flex flex-wrap gap-1">
                  {toNumberArray(bet.numbers).map((n) => (
                    <NumberBall key={n} n={n} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{formatDateTime(bet.betAt)}</span>
                {isDrawn && (
                  <span className="ml-auto text-sm">
                    對中 {bet.matchedCount} 個{bet.matchedSpecial ? " + 特別號" : ""} →{" "}
                    {bet.prizeTier ? (
                      <span className="font-bold text-amber-600">
                        {bet.prizeTier}（{formatCurrency(bet.prizeAmount ?? 0)}）
                      </span>
                    ) : (
                      <span className="text-gray-500">未中獎</span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
