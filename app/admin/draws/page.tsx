import Link from "next/link";
import { HistoryList } from "@/app/components/player/HistoryList";
import { computePoolAmount, getCurrentDraw, getDrawHistory, getDrawStats } from "@/lib/queries";
import { DrawTrigger } from "./components/DrawTrigger";

export const dynamic = "force-dynamic";

export default async function AdminDrawsPage() {
  const [currentDraw, history] = await Promise.all([getCurrentDraw(), getDrawHistory()]);

  if (!currentDraw) {
    return <p className="text-sm text-gray-500">目前沒有進行中的期別。</p>;
  }

  const [pool, stats, historyWithPool] = await Promise.all([
    computePoolAmount(currentDraw.id, currentDraw.basePoolAmount),
    getDrawStats(currentDraw.id),
    Promise.all(
      history.map(async (draw) => ({
        ...draw,
        pool: await computePoolAmount(draw.id, draw.basePoolAmount),
      }))
    ),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">開獎作業</h1>
      <DrawTrigger key={currentDraw.id} drawId={currentDraw.id} pool={pool} totalBets={stats.totalBets} />
      <Link href={`/admin/draws/${currentDraw.id}`} className="text-sm text-blue-600 hover:underline">
        查看本期下注明細（第 {currentDraw.id} 期）
      </Link>
      <HistoryList history={historyWithPool} linkBase="/admin/draws" />
    </div>
  );
}
