"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 定時呼叫 router.refresh() 重新抓取 Server Component 的資料，讓頁面不用手動整頁重新整理
export function AutoRefresh({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
