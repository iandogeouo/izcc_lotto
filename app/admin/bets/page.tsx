import { getCurrentDraw, getPlayers, getSettings } from "@/lib/queries";
import { CreateDrawButton } from "../components/CreateDrawButton";
import { BetEntryForm } from "./components/BetEntryForm";
import { BetListTable } from "./components/BetListTable";

export const dynamic = "force-dynamic";

export default async function AdminBetsPage() {
  const [players, currentDraw, settings] = await Promise.all([
    getPlayers(),
    getCurrentDraw(),
    getSettings(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">下注輸入</h1>
      <p className="-mt-6 text-xs text-gray-400">下注紀錄每 10 秒自動更新，不需手動整頁重新整理</p>
      {currentDraw ? (
        <>
          <BetEntryForm players={players} drawId={currentDraw.id} numberPoolSize={settings.numberPoolSize} />
          <BetListTable defaultDrawId={currentDraw.id} numberPoolSize={settings.numberPoolSize} />
        </>
      ) : (
        <CreateDrawButton />
      )}
    </div>
  );
}
