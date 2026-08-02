"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimToggle({ betId, claimed }: { betId: number; claimed: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(claimed);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(false);

  // claimed prop 可能因為父層（例如「一鍵領獎」）觸發 router.refresh() 而改變，
  // useState 的初始值只會在 mount 時套用一次，這裡手動同步避免畫面卡在舊狀態
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local display state when the claimed prop changes after a parent refresh
    setCurrent(claimed);
  }, [claimed]);

  async function toggle() {
    const next = !current;
    setUpdating(true);
    setError(false);
    try {
      const res = await fetch(`/api/bets/${betId}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimed: next }),
      });
      if (res.ok) {
        setCurrent(next);
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={updating}
      title={error ? "更新失敗，請再試一次" : undefined}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        current
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
          : "border border-black/10 text-gray-500 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      }`}
    >
      {updating ? "更新中..." : current ? "✅ 已領獎" : "⬜ 未領獎"}
    </button>
  );
}
