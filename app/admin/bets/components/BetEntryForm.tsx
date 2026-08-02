"use client";

import { useState } from "react";
import { NumberPicker } from "./NumberPicker";

interface PlayerOption {
  id: number;
  name: string;
}

export function BetEntryForm({
  players,
  drawId,
  numberPoolSize,
}: {
  players: PlayerOption[];
  drawId: number;
  numberPoolSize: number;
}) {
  const [playerId, setPlayerId] = useState<number | "">(players[0]?.id ?? "");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [randomCount, setRandomCount] = useState(5);
  const [randomSubmitting, setRandomSubmitting] = useState(false);

  async function handleSubmit() {
    if (!playerId || numbers.length !== 6) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId, playerId, numbers }),
      });
      if (res.ok) {
        setNumbers([]);
        setMessage({ text: "新增成功，可以繼續為同一位玩家新增下一注。", ok: true });
        window.dispatchEvent(new CustomEvent("bet-created"));
      } else {
        const data = await res.json();
        setMessage({
          text: `新增失敗：${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}`,
          ok: false,
        });
      }
    } catch {
      setMessage({ text: "網路連線異常，請確認網路狀態後再試一次", ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRandomBatch() {
    if (!playerId || randomCount < 1) return;
    setRandomSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bets/random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId, playerId, count: randomCount }),
      });
      if (res.ok) {
        setMessage({ text: `已自動新增 ${randomCount} 筆隨機下注。`, ok: true });
        window.dispatchEvent(new CustomEvent("bet-created"));
      } else {
        const data = await res.json();
        setMessage({
          text: `新增失敗：${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}`,
          ok: false,
        });
      }
    } catch {
      setMessage({ text: "網路連線異常，請確認網路狀態後再試一次", ok: false });
    } finally {
      setRandomSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
      <h2 className="text-lg font-bold">新增下注（第 {drawId} 期）</h2>
      <div className="space-y-2">
        <label className="text-sm text-gray-500">玩家</label>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlayerId(p.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                playerId === p.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "border border-black/10 hover:border-blue-400 hover:bg-blue-50 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-black/15 p-3 dark:border-white/20">
        <span className="text-sm text-gray-500">自動下注</span>
        <input
          type="number"
          min={1}
          max={100}
          value={randomCount}
          onChange={(e) => setRandomCount(Math.max(1, Math.min(100, Number(e.target.value))))}
          className="w-20 rounded-lg border border-black/10 bg-card px-2 py-1.5 text-center outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
        />
        <span className="text-sm text-gray-500">筆</span>
        <button
          type="button"
          onClick={handleRandomBatch}
          disabled={!playerId || randomSubmitting}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600"
        >
          {randomSubmitting ? "新增中..." : "🎲 一鍵自動下注"}
        </button>
      </div>

      <NumberPicker selected={numbers} onChange={setNumbers} maxNumber={numberPoolSize} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!playerId || numbers.length !== 6 || submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {submitting ? "新增中..." : "新增這一注"}
        </button>
        {message && (
          <span className={`text-sm ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
