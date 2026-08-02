"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // 即使登出請求失敗也繼續導向登入頁，避免卡住
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="ml-auto rounded-lg px-3 py-1.5 text-sm transition hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
    >
      {loggingOut ? "登出中..." : "登出"}
    </button>
  );
}
