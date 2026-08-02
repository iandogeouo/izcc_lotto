import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toNumberArray } from "@/lib/queries";
import { NumberBall } from "../shared/NumberBall";

interface HistoryEntry {
  id: number;
  numbers: unknown;
  specialNumber: number | null;
  drawnAt: Date | string | null;
  pool: number;
}

// linkBase 有帶入時（僅限管理後台），每一期會連結到該期的詳細資料頁面；玩家頁面不帶入，維持唯讀不可點擊
export function HistoryList({
  history,
  linkBase,
}: {
  history: HistoryEntry[];
  linkBase?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="mb-4 text-lg font-bold">🗓️ 歷史開獎紀錄</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">尚無歷史開獎紀錄。</p>
      ) : (
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {history.map((draw) => {
            const content = (
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-gray-500">
                  第 {draw.id} 期
                  <br />
                  {draw.drawnAt ? formatDateTime(draw.drawnAt) : ""}
                </span>
                <div className="flex flex-wrap gap-1">
                  {toNumberArray(draw.numbers).map((n) => (
                    <NumberBall key={n} n={n} size="sm" />
                  ))}
                  {draw.specialNumber != null && <NumberBall n={draw.specialNumber} special size="sm" />}
                </div>
                <span className="ml-auto text-sm font-semibold text-amber-600">
                  {formatCurrency(draw.pool)}
                </span>
              </div>
            );
            return (
              <li key={draw.id} className="py-3 first:pt-0 last:pb-0">
                {linkBase ? (
                  <Link
                    href={`${linkBase}/${draw.id}`}
                    className="-mx-2 block rounded-lg px-2 py-1 transition hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
