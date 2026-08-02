export function BetStats({
  totalBets,
  histogram,
}: {
  totalBets: number;
  histogram: Record<number, number>;
}) {
  const max = Math.max(1, ...Object.values(histogram));
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-bold text-lg">目前下注統計</h2>
        <p className="text-sm text-gray-500">
          本期總注數：<span className="text-base font-bold text-black dark:text-white">{totalBets}</span>
        </p>
      </div>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-10">
        {Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
          const count = histogram[n] ?? 0;
          const intensity = count === 0 ? 0 : Math.max(0.2, count / max);
          return (
            <div key={n} className="flex flex-col items-center gap-1" title={`號碼 ${n}：${count} 注`}>
              <div
                className="flex aspect-square w-full items-center justify-center rounded-md border border-blue-600/30 text-[10px] font-bold text-white"
                style={{ backgroundColor: `rgba(37, 99, 235, ${intensity})` }}
              >
                {count > 0 ? count : ""}
              </div>
              <span className="text-[10px] text-gray-500">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
