"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="ml-auto rounded-md px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      登出
    </button>
  );
}
