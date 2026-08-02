"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { NumberBall } from "../shared/NumberBall";

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

  useEffect(() => {
    async function loadDraws() {
      const [history, current] = await Promise.all([
        fetch("/api/draws").then((r) => r.json()),
        fetch("/api/draws/current").then((r) => r.json()),
      ]);
      const list: DrawOption[] = [...history];
      if (current.draw) list.push(current.draw);
      list.sort((a, b) => b.id - a.id);
      setDraws(list);
    }
    loadDraws();
  }, []);

  useEffect(() => {
    if (!playerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing results when the player selector is unset
      setBets(null);
      return;
    }
    setLoading(true);
    fetch(`/api/bets?drawId=${drawId}&playerId=${playerId}`)
      .then((r) => r.json())
      .then((data) => setBets(data))
      .finally(() => setLoading(false));
  }, [playerId, drawId]);

  const selectedDraw = draws.find((d) => d.id === drawId);
  const isDrawn = selectedDraw?.status === "DRAWN";

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 space-y-4">
      <h2 className="font-bold text-lg">查詢我的下注</h2>
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
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
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
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

      {!loading && playerId && bets && bets.length === 0 && (
        <p className="text-sm text-gray-500">這位玩家在此期沒有下注紀錄。</p>
      )}

      {!loading && bets && bets.length > 0 && (
        <ul className="space-y-3">
          {bets.map((bet) => (
            <li
              key={bet.id}
              className="space-y-2 rounded-lg border border-black/10 p-3 dark:border-white/10"
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
