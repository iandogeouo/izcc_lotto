import Link from "next/link";
import { computePoolAmount, getCurrentDraw, getDrawStats } from "@/lib/queries";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentDraw = await getCurrentDraw();

  if (!currentDraw) {
    return <p className="text-sm text-gray-500">目前沒有進行中的期別。</p>;
  }

  const [pool, stats] = await Promise.all([
    computePoolAmount(currentDraw.id, currentDraw.basePoolAmount),
    getDrawStats(currentDraw.id),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理後台總覽</h1>
      <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
        <p className="text-lg font-semibold">第 {currentDraw.id} 期（尚未開獎）</p>
        <p className="text-sm text-gray-500">預計開獎時間：{formatDateTime(currentDraw.drawTime)}</p>
        <div className="mt-3 flex gap-6 text-sm">
          <span>目前總注數：<span className="font-bold">{stats.totalBets}</span></span>
          <span>目前獎池：<span className="font-bold text-amber-600">{formatCurrency(pool)}</span></span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/bets" className="rounded-md bg-blue-600 px-4 py-2 text-white">
          新增 / 管理下注
        </Link>
        <Link href="/admin/draws" className="rounded-md bg-amber-600 px-4 py-2 text-white">
          觸發開獎
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-md border border-black/10 px-4 py-2 dark:border-white/20"
        >
          參數設定
        </Link>
      </div>
    </div>
  );
}
