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
}: {
  players: PlayerOption[];
  drawId: number;
}) {
  const [playerId, setPlayerId] = useState<number | "">(players[0]?.id ?? "");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!playerId || numbers.length !== 6) return;
    setSubmitting(true);
    setMessage(null);
    const res = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, playerId, numbers }),
    });
    setSubmitting(false);
    if (res.ok) {
      setNumbers([]);
      setMessage("新增成功，可以繼續為同一位玩家新增下一注。");
      window.dispatchEvent(new CustomEvent("bet-created"));
    } else {
      const data = await res.json();
      setMessage(`新增失敗：${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}`);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
      <h2 className="text-lg font-bold">新增下注（第 {drawId} 期）</h2>
      <div className="flex items-center gap-3">
        <label className="text-sm">玩家：</label>
        <select
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          value={playerId}
          onChange={(e) => setPlayerId(Number(e.target.value))}
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <NumberPicker selected={numbers} onChange={setNumbers} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!playerId || numbers.length !== 6 || submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          {submitting ? "新增中..." : "新增這一注"}
        </button>
        {message && <span className="text-sm text-gray-500">{message}</span>}
      </div>
    </div>
  );
}
