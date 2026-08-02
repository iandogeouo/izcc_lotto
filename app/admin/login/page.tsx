"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "登入失敗");
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10">
      <h1 className="text-xl font-bold">管理後台登入</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          autoFocus
          placeholder="請輸入管理密碼"
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          {submitting ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}
