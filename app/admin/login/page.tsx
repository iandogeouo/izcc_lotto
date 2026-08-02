"use client";

import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // 用整頁導航（而不是 router.push）確保新 cookie 一定會帶上，
        // 避免 Next.js 的 client-side router cache 沿用登入前的重新導向結果卡住不動
        window.location.href = "/admin";
        return;
      }
      const data = await res.json();
      setError(data.error ?? "登入失敗");
    } catch {
      setError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-sm space-y-5 rounded-2xl border border-black/10 bg-card/70 p-7 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-card/5">
      <div className="space-y-1 text-center">
        <div className="text-3xl">🔒</div>
        <h1 className="text-xl font-bold">管理後台登入</h1>
        <p className="text-sm text-gray-500">請輸入管理密碼以繼續</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          autoFocus
          placeholder="管理密碼"
          className="w-full rounded-lg border border-black/10 bg-card px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {submitting ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}
