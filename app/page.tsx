import {
  computePoolAmount,
  getCurrentDraw,
  getDrawHistory,
  getDrawStats,
  getPlayers,
  getSettings,
} from "@/lib/queries";
import { BetStats } from "./components/player/BetStats";
import { HistoryList } from "./components/player/HistoryList";
import { JackpotCard } from "./components/player/JackpotCard";
import { MyBetsQuery } from "./components/player/MyBetsQuery";
import { PrizeTable } from "./components/player/PrizeTable";
import { WinningNumbersCard } from "./components/player/WinningNumbersCard";

export const dynamic = "force-dynamic";

export default async function PlayerPage() {
  const [currentDraw, history, settings, players] = await Promise.all([
    getCurrentDraw(),
    getDrawHistory(),
    getSettings(),
    getPlayers(),
  ]);

  if (!currentDraw) {
    return (
      <p className="text-sm text-gray-500">
        目前沒有進行中的期別，請先在管理後台建立一期資料。
      </p>
    );
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

  const latestDrawn = history[0] ?? null;

  return (
    <div className="space-y-6 pb-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <WinningNumbersCard latestDrawn={latestDrawn} currentDraw={currentDraw} />
        <JackpotCard pool={pool} />
      </div>
      <BetStats totalBets={stats.totalBets} histogram={stats.histogram} />
      <PrizeTable settings={settings} />
      <MyBetsQuery players={players} defaultDrawId={currentDraw.id} />
      <HistoryList history={historyWithPool} />
    </div>
  );
}
