"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateDrawButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/draws", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "建立失敗");
      }
    } catch {
      setError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <p className="text-sm text-gray-500">目前沒有進行中的期別。</p>
      <button
        type="button"
        onClick={handleCreate}
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
      >
        {submitting ? "建立中..." : "手動開新期別"}
      </button>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
