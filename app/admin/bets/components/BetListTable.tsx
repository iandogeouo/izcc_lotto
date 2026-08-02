"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { NumberBall } from "@/app/components/shared/NumberBall";
import { NumberPicker } from "./NumberPicker";

const POLL_INTERVAL_MS = 10000;
const LIST_LIMIT = 200;

interface DrawOption {
  id: number;
  status: string;
}

interface BetRow {
  id: number;
  numbers: number[];
  betAt: string;
  player: { id: number; name: string };
}

export function BetListTable({
  defaultDrawId,
  numberPoolSize,
}: {
  defaultDrawId: number;
  numberPoolSize: number;
}) {
  const [draws, setDraws] = useState<DrawOption[]>([]);
  const [drawId, setDrawId] = useState(defaultDrawId);
  const [bets, setBets] = useState<BetRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumbers, setEditNumbers] = useState<number[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const data = await fetch(`/api/bets?drawId=${drawId}&take=${LIST_LIMIT}`).then((r) =>
        r.json()
      );
      setBets(data.items);
      setTotalCount(data.totalCount);
    } catch {
      // 靜默失敗，等下一次輪詢再試
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change (drawId) pattern
    loadBets();
  }, [loadBets]);

  useEffect(() => {
    window.addEventListener("bet-created", loadBets);
    return () => window.removeEventListener("bet-created", loadBets);
  }, [loadBets]);

  // 定時輪詢，讓別人（或其他分頁）新增的下注自動出現；編輯中先暫停避免打斷輸入
  useEffect(() => {
    const id = setInterval(() => {
      if (editingId === null) {
        loadDraws();
        loadBets();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [editingId, loadDraws, loadBets]);

  const isDrawn = draws.find((d) => d.id === drawId)?.status === "DRAWN";

  async function handleClearRound() {
    if (!confirm(`確定要清空第 ${drawId} 期的所有下注紀錄嗎？此動作無法復原。`)) return;
    setClearing(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/draws/${drawId}/bets`, { method: "DELETE" });
      if (res.ok) {
        loadBets();
      } else {
        const data = await res.json();
        setActionError(data.error ?? "清空失敗");
      }
    } catch {
      setActionError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setClearing(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("確定要刪除這筆下注紀錄嗎？")) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/bets/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadBets();
      } else {
        const data = await res.json();
        setActionError(data.error ?? "刪除失敗");
      }
    } catch {
      setActionError("網路連線異常，請確認網路狀態後再試一次");
    }
  }

  function startEdit(bet: BetRow) {
    setEditingId(bet.id);
    setEditNumbers(bet.numbers);
    setActionError(null);
  }

  async function saveEdit(id: number) {
    if (editNumbers.length !== 6) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/bets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: editNumbers }),
      });
      if (res.ok) {
        setEditingId(null);
        loadBets();
      } else {
        const data = await res.json();
        setActionError(data.error ?? "更新失敗");
      }
    } catch {
      setActionError("網路連線異常，請確認網路狀態後再試一次");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">下注紀錄</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-black/10 bg-card px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
            value={drawId}
            onChange={(e) => setDrawId(Number(e.target.value))}
          >
            {draws.map((d) => (
              <option key={d.id} value={d.id}>
                第 {d.id} 期 {d.status === "DRAWN" ? "（已開獎）" : "（尚未開獎）"}
              </option>
            ))}
          </select>
          {!isDrawn && (
            <button
              type="button"
              onClick={handleClearRound}
              disabled={clearing || bets.length === 0}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              {clearing ? "清空中..." : "清空本期下注"}
            </button>
          )}
        </div>
      </div>
      {actionError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {actionError}
        </p>
      )}
      {totalCount > bets.length && (
        <p className="text-xs text-gray-500">
          共 {totalCount} 筆，僅顯示最新 {bets.length} 筆
        </p>
      )}
      {loading && bets.length === 0 ? (
        <p className="text-sm text-gray-500">載入中...</p>
      ) : bets.length === 0 ? (
        <p className="text-sm text-gray-500">這一期還沒有下注紀錄。</p>
      ) : (
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {bets.map((bet) => (
            <li key={bet.id} className="py-2.5">
              {editingId === bet.id ? (
                <div className="space-y-3">
                  <span className="font-semibold">{bet.player.name}</span>
                  <NumberPicker
                    selected={editNumbers}
                    onChange={setEditNumbers}
                    maxNumber={numberPoolSize}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(bet.id)}
                      disabled={editNumbers.length !== 6 || savingEdit}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
                    >
                      {savingEdit ? "儲存中..." : "儲存"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-14 shrink-0 font-semibold">{bet.player.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {bet.numbers.map((n) => (
                      <NumberBall key={n} n={n} size="sm" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{formatDateTime(bet.betAt)}</span>
                  {!isDrawn && (
                    <div className="ml-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(bet)}
                        className="rounded-lg border border-black/10 px-2 py-1 text-xs transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bet.id)}
                        className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                      >
                        刪除
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
