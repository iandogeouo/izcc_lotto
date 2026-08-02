import Link from "next/link";
import { LogoutButton } from "./components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-3 text-sm dark:border-white/10">
        <Link href="/admin" className="rounded-md px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          總覽
        </Link>
        <Link href="/admin/bets" className="rounded-md px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          下注輸入
        </Link>
        <Link href="/admin/draws" className="rounded-md px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          開獎作業
        </Link>
        <Link href="/admin/settings" className="rounded-md px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          參數設定
        </Link>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
