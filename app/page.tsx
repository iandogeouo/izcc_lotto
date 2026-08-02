import {
  computePoolAmount,
  getCurrentDraw,
  getDrawHistory,
  getLeaderboard,
  getPlayers,
  getRecentWinners,
  getSettings,
} from "@/lib/queries";
import { AutoRefresh } from "./components/shared/AutoRefresh";
import { HistoryList } from "./components/player/HistoryList";
import { JackpotCard } from "./components/player/JackpotCard";
import { Leaderboard } from "./components/player/Leaderboard";
import { MyBetsQuery } from "./components/player/MyBetsQuery";
import { PrizeTable } from "./components/player/PrizeTable";
import { RecentWinners } from "./components/player/RecentWinners";
import { WinningNumbersCard } from "./components/player/WinningNumbersCard";

export const dynamic = "force-dynamic";

export default async function PlayerPage() {
  const [currentDraw, history, settings, players, leaderboard] = await Promise.all([
    getCurrentDraw(),
    getDrawHistory(),
    getSettings(),
    getPlayers(),
    getLeaderboard(),
  ]);

  if (!currentDraw) {
    return (
      <p className="text-sm text-gray-500">
        目前沒有進行中的期別，請先在管理後台建立一期資料。
      </p>
    );
  }

  const latestDrawn = history[0] ?? null;

  const [pool, recentWinners, historyWithPool] = await Promise.all([
    computePoolAmount(currentDraw.id, currentDraw.basePoolAmount),
    latestDrawn ? getRecentWinners(latestDrawn.id) : Promise.resolve([]),
    Promise.all(
      history.map(async (draw) => ({
        ...draw,
        pool: await computePoolAmount(draw.id, draw.basePoolAmount),
      }))
    ),
  ]);

  return (
    <div className="space-y-6 pb-12">
      <AutoRefresh />
      <div className="grid gap-6 sm:grid-cols-2">
        <WinningNumbersCard latestDrawn={latestDrawn} currentDraw={currentDraw} />
        <JackpotCard pool={pool} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Leaderboard entries={leaderboard} />
        <RecentWinners drawId={latestDrawn?.id ?? null} winners={recentWinners} />
      </div>
      <PrizeTable settings={settings} />
      <MyBetsQuery players={players} defaultDrawId={currentDraw.id} />
      <HistoryList history={historyWithPool} />
    </div>
  );
}
