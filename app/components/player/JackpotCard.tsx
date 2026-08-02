import { formatCurrency } from "@/lib/format";

export function JackpotCard({ pool }: { pool: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-amber-50/80 to-card/70 p-5 text-center shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:via-amber-950/10 dark:to-transparent">
      <h2 className="text-lg font-bold">💰 目前累積總獎池</h2>
      <p className="text-4xl font-extrabold tracking-tight text-amber-600">
        {formatCurrency(pool)}
      </p>
      <p className="text-xs text-gray-500">頭獎從缺時，獎池將全數累積到下一期</p>
    </div>
  );
}
