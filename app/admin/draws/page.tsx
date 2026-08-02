import Link from "next/link";
import { HistoryList } from "@/app/components/player/HistoryList";
import { computePoolAmount, getCurrentDraw, getDrawHistory, getDrawStats } from "@/lib/queries";
import { AutoRefresh } from "@/app/components/shared/AutoRefresh";
import { CreateDrawButton } from "../components/CreateDrawButton";
import { DrawTrigger } from "./components/DrawTrigger";

export const dynamic = "force-dynamic";

export default async function AdminDrawsPage() {
  const [currentDraw, history] = await Promise.all([getCurrentDraw(), getDrawHistory()]);

  if (!currentDraw) {
    return <CreateDrawButton />;
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
      <AutoRefresh intervalMs={15000} />
      <h1 className="text-2xl font-bold">開獎作業</h1>
      <DrawTrigger drawId={currentDraw.id} pool={pool} totalBets={stats.totalBets} />
      <Link
        href={`/admin/draws/${currentDraw.id}`}
        className="inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        查看本期下注明細（第 {currentDraw.id} 期）→
      </Link>
      <HistoryList history={historyWithPool} linkBase="/admin/draws" />
    </div>
  );
}
