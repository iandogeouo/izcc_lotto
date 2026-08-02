"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { NumberBall } from "../shared/NumberBall";

const POLL_INTERVAL_MS = 10000;

interface PlayerOption {
  id: number;
  name: string;
}

interface DrawOption {
  id: number;
  status: string;
}

interface BetRecord {
  id: number;
  numbers: number[];
  betAt: string;
  matchedCount: number | null;
  matchedSpecial: boolean | null;
  prizeTier: string | null;
  prizeAmount: number | null;
}

export function MyBetsQuery({
  players,
  defaultDrawId,
}: {
  players: PlayerOption[];
  defaultDrawId: number;
}) {
  const [draws, setDraws] = useState<DrawOption[]>([]);
  const [playerId, setPlayerId] = useState<number | "">("");
  const [drawId, setDrawId] = useState<number>(defaultDrawId);
  const [bets, setBets] = useState<BetRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDraws = useCallback(async () => {
    try {
      const [history, current] = await Promise.all([
        fetch("/api/draws").then((r) => r.json()),
        fetch("/api/draws/current").then((r) => r.json()),
      ]);
      const list: DrawOption[] = [...history];
      if (current.draw) list.push(current.draw);
      list.sort((a, b) => b.id - a.id);
      setDraws(list);
    } catch {
      // 靜默失敗，等下一次輪詢再試
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    loadDraws();
  }, [loadDraws]);

  const loadBets = useCallback(async () => {
    if (!playerId) {
      setBets(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetch(`/api/bets?drawId=${drawId}&playerId=${playerId}`).then((r) =>
        r.json()
      );
      setBets(data.items);
    } catch {
      setLoadError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setLoading(false);
    }
  }, [playerId, drawId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change (playerId/drawId) pattern
    loadBets();
  }, [loadBets]);

  // 定時輪詢，讓其他人下注/開獎後的最新結果自動出現，不需要手動整頁重新整理
  useEffect(() => {
    const id = setInterval(() => {
      loadDraws();
      loadBets();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadDraws, loadBets]);

  const selectedDraw = draws.find((d) => d.id === drawId);
  const isDrawn = selectedDraw?.status === "DRAWN";

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="text-lg font-bold">查詢我的下注</h2>
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-black/10 bg-card px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">請選擇玩家</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-black/10 bg-card px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
          value={drawId}
          onChange={(e) => setDrawId(Number(e.target.value))}
        >
          {draws.map((d) => (
            <option key={d.id} value={d.id}>
              第 {d.id} 期 {d.status === "DRAWN" ? "（已開獎）" : "（尚未開獎）"}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500">查詢中...</p>}

      {loadError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {loadError}
        </p>
      )}

      {!loading && playerId && bets && bets.length === 0 && (
        <p className="text-sm text-gray-500">這位玩家在此期沒有下注紀錄。</p>
      )}

      {!loading && bets && bets.length > 0 && (
        <ul className="space-y-3">
          {bets.map((bet) => (
            <li
              key={bet.id}
              className="space-y-2 rounded-xl border border-black/10 p-3 dark:border-white/10"
            >
              <div className="flex flex-wrap gap-2">
                {bet.numbers.map((n) => (
                  <NumberBall key={n} n={n} size="sm" />
                ))}
              </div>
              <p className="text-xs text-gray-500">下注時間：{formatDateTime(bet.betAt)}</p>
              {isDrawn && (
                <p className="text-sm">
                  對中 {bet.matchedCount} 個號碼{bet.matchedSpecial ? " + 特別號" : ""} →{" "}
                  {bet.prizeTier ? (
                    <span className="font-bold text-amber-600">
                      {bet.prizeTier}（{formatCurrency(bet.prizeAmount ?? 0)}）
                    </span>
                  ) : (
                    <span className="text-gray-500">未中獎</span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
