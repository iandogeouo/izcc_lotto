import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-card/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          <span>🎱</span>
          <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
            大樂透模擬
          </span>
        </Link>
        <div className="flex gap-1 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            玩家頁面
          </Link>
          <Link
            href="/admin"
            className="rounded-lg px-3 py-1.5 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            管理後台
          </Link>
        </div>
      </nav>
    </header>
  );
}
