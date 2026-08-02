"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const LINKS = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/bets", label: "下注輸入" },
  { href: "/admin/draws", label: "開獎作業" },
  { href: "/admin/settings", label: "參數設定" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-black/10 pb-3 text-sm dark:border-white/10">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              active
                ? "bg-blue-600 text-white"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
