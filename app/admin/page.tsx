import Link from "next/link";
import { computePoolAmount, getCurrentDraw, getDrawStats } from "@/lib/queries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { AutoRefresh } from "@/app/components/shared/AutoRefresh";
import { CreateDrawButton } from "./components/CreateDrawButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentDraw = await getCurrentDraw();

  if (!currentDraw) {
    return <CreateDrawButton />;
  }

  const [pool, stats] = await Promise.all([
    computePoolAmount(currentDraw.id, currentDraw.basePoolAmount),
    getDrawStats(currentDraw.id),
  ]);

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <h1 className="text-2xl font-bold">管理後台總覽</h1>
      <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
        <p className="text-lg font-semibold">第 {currentDraw.id} 期（尚未開獎）</p>
        <p className="text-sm text-gray-500">預計開獎時間：{formatDateTime(currentDraw.drawTime)}</p>
        <div className="mt-3 flex gap-6 text-sm">
          <span>
            目前總注數：<span className="font-bold">{stats.totalBets}</span>
          </span>
          <span>
            目前獎池：<span className="font-bold text-amber-600">{formatCurrency(pool)}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/bets"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          新增 / 管理下注
        </Link>
        <Link
          href="/admin/draws"
          className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
        >
          觸發開獎
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          參數設定
        </Link>
      </div>
    </div>
  );
}
