import { formatCurrency } from "@/lib/format";

interface WinnerBet {
  id: number;
  prizeTier: string | null;
  prizeAmount: number | null;
  player: { name: string };
}

export function RecentWinners({
  drawId,
  winners,
}: {
  drawId: number | null;
  winners: WinnerBet[];
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="mb-4 text-lg font-bold">
        🎊 最近中獎名單{drawId ? `（第 ${drawId} 期）` : ""}
      </h2>
      {!drawId ? (
        <p className="text-sm text-gray-500">尚未有開獎紀錄。</p>
      ) : winners.length === 0 ? (
        <p className="text-sm text-gray-500">這一期沒有人中獎。</p>
      ) : (
        <ul className="space-y-2">
          {winners.map((bet) => (
            <li
              key={bet.id}
              className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2 dark:border-white/5"
            >
              <span className="font-semibold">{bet.player.name}</span>
              <span className="text-sm">
                <span className="font-bold text-amber-600">{bet.prizeTier}</span>
                <span className="ml-2 text-gray-500">{formatCurrency(bet.prizeAmount ?? 0)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
