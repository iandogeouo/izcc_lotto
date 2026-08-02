"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { NumberBall } from "@/app/components/shared/NumberBall";
import { NumberPicker } from "./NumberPicker";

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

export function BetListTable({ defaultDrawId }: { defaultDrawId: number }) {
  const [draws, setDraws] = useState<DrawOption[]>([]);
  const [drawId, setDrawId] = useState(defaultDrawId);
  const [bets, setBets] = useState<BetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumbers, setEditNumbers] = useState<number[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [clearing, setClearing] = useState(false);

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

  const loadBets = useCallback(() => {
    setLoading(true);
    fetch(`/api/bets?drawId=${drawId}`)
      .then((r) => r.json())
      .then(setBets)
      .finally(() => setLoading(false));
  }, [drawId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change (drawId) pattern
    loadBets();
  }, [loadBets]);

  useEffect(() => {
    window.addEventListener("bet-created", loadBets);
    return () => window.removeEventListener("bet-created", loadBets);
  }, [loadBets]);

  const isDrawn = draws.find((d) => d.id === drawId)?.status === "DRAWN";

  async function handleClearRound() {
    if (!confirm(`確定要清空第 ${drawId} 期的所有下注紀錄嗎？此動作無法復原。`)) return;
    setClearing(true);
    const res = await fetch(`/api/draws/${drawId}/bets`, { method: "DELETE" });
    setClearing(false);
    if (res.ok) {
      loadBets();
    } else {
      const data = await res.json();
      alert(data.error ?? "清空失敗");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("確定要刪除這筆下注紀錄嗎？")) return;
    const res = await fetch(`/api/bets/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadBets();
    } else {
      const data = await res.json();
      alert(data.error ?? "刪除失敗");
    }
  }

  function startEdit(bet: BetRow) {
    setEditingId(bet.id);
    setEditNumbers(bet.numbers);
  }

  async function saveEdit(id: number) {
    if (editNumbers.length !== 6) return;
    setSavingEdit(true);
    const res = await fetch(`/api/bets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers: editNumbers }),
    });
    setSavingEdit(false);
    if (res.ok) {
      setEditingId(null);
      loadBets();
    } else {
      const data = await res.json();
      alert(data.error ?? "更新失敗");
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">下注紀錄</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
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
              className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              {clearing ? "清空中..." : "清空本期下注"}
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">載入中...</p>
      ) : bets.length === 0 ? (
        <p className="text-sm text-gray-500">這一期還沒有下注紀錄。</p>
      ) : (
        <ul className="space-y-2">
          {bets.map((bet) => (
            <li
              key={bet.id}
              className="border-b border-black/5 py-2 last:border-0 dark:border-white/5"
            >
              {editingId === bet.id ? (
                <div className="space-y-3">
                  <span className="font-semibold">{bet.player.name}</span>
                  <NumberPicker selected={editNumbers} onChange={setEditNumbers} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(bet.id)}
                      disabled={editNumbers.length !== 6 || savingEdit}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                    >
                      {savingEdit ? "儲存中..." : "儲存"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/20"
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
                        className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bet.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
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
