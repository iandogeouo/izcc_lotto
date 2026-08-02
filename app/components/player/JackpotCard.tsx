import { formatCurrency } from "@/lib/format";

export function JackpotCard({ pool }: { pool: number }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 flex flex-col items-center justify-center gap-2 text-center bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-transparent">
      <h2 className="font-bold text-lg">目前累積總獎池</h2>
      <p className="text-3xl font-extrabold text-amber-600">{formatCurrency(pool)}</p>
      <p className="text-xs text-gray-500">頭獎從缺時，獎池將全數累積到下一期</p>
    </div>
  );
}
