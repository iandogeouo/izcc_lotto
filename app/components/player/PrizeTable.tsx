import { formatCurrency } from "@/lib/format";
import type { SettingsConfig } from "@/lib/types";

const ROWS: { tier: string; rule: string; amountKey?: keyof SettingsConfig }[] = [
  { tier: "頭獎", rule: "中 6 個號碼" },
  { tier: "貳獎", rule: "中 5 個號碼 + 特別號", amountKey: "prize2Amount" },
  { tier: "參獎", rule: "中 5 個號碼", amountKey: "prize3Amount" },
  { tier: "肆獎", rule: "中 4 個號碼", amountKey: "prize4Amount" },
  { tier: "伍獎", rule: "中 3 個號碼", amountKey: "prize5Amount" },
  { tier: "陸獎", rule: "中 2 個號碼 + 特別號", amountKey: "prize6Amount" },
  { tier: "普獎", rule: "未中任何號碼但中特別號", amountKey: "prize7Amount" },
];

export function PrizeTable({ settings }: { settings: SettingsConfig }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="mb-3 text-lg font-bold">📋 中獎方式說明</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-gray-500 dark:border-white/10">
              <th className="py-2 pr-4 font-medium">獎項</th>
              <th className="py-2 pr-4 font-medium">對中方式</th>
              <th className="py-2 font-medium">獎金</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.tier}
                className="border-b border-black/5 transition-colors hover:bg-black/[0.02] last:border-0 dark:border-white/5 dark:hover:bg-white/[0.03]"
              >
                <td className="py-2 pr-4 font-semibold whitespace-nowrap">{row.tier}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{row.rule}</td>
                <td className="py-2 whitespace-nowrap font-medium text-amber-600">
                  {row.amountKey
                    ? `${formatCurrency(settings[row.amountKey])} / 注`
                    : `均分總獎池（底金 ${formatCurrency(settings.baseJackpotAmount)} + 本期投注金額）`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">每注金額：{formatCurrency(settings.betPrice)}</p>
    </div>
  );
}
