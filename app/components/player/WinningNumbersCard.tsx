import type { Draw } from "@/generated/prisma/client";
import { formatDateTime } from "@/lib/format";
import { toNumberArray } from "@/lib/queries";
import { NumberBall } from "../shared/NumberBall";

export function WinningNumbersCard({
  latestDrawn,
  currentDraw,
}: {
  latestDrawn: Draw | null;
  currentDraw: Draw;
}) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 space-y-4">
      <h2 className="font-bold text-lg">最新開獎結果</h2>
      {latestDrawn ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            第 {latestDrawn.id} 期・開獎時間 {formatDateTime(latestDrawn.drawnAt ?? latestDrawn.createdAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {toNumberArray(latestDrawn.numbers).map((n) => (
              <NumberBall key={n} n={n} />
            ))}
            <span className="mx-1 text-gray-400">+</span>
            {latestDrawn.specialNumber != null && <NumberBall n={latestDrawn.specialNumber} special />}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">尚未有開獎紀錄</p>
      )}
      <div className="border-t border-black/10 dark:border-white/10 pt-3 text-sm text-gray-500">
        第 {currentDraw.id} 期尚未開獎，預計開獎時間：{formatDateTime(currentDraw.drawTime)}
      </div>
    </div>
  );
}
