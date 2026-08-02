import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur sticky top-0 z-10 dark:bg-black/50 dark:border-white/10">
      <nav className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-lg">
          🎱 大樂透模擬
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">
            玩家頁面
          </Link>
          <Link href="/admin" className="hover:underline">
            管理後台
          </Link>
        </div>
      </nav>
    </header>
  );
}
