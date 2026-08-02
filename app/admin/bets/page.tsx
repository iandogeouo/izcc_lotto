import { getCurrentDraw, getPlayers } from "@/lib/queries";
import { BetEntryForm } from "./components/BetEntryForm";
import { BetListTable } from "./components/BetListTable";

export const dynamic = "force-dynamic";

export default async function AdminBetsPage() {
  const [players, currentDraw] = await Promise.all([getPlayers(), getCurrentDraw()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">下注輸入</h1>
      {currentDraw ? (
        <>
          <BetEntryForm players={players} drawId={currentDraw.id} />
          <BetListTable defaultDrawId={currentDraw.id} />
        </>
      ) : (
        <p className="text-sm text-gray-500">目前沒有進行中的期別。</p>
      )}
    </div>
  );
}
