"use client";

import { useCallback, useEffect, useState } from "react";
import type { SettingsConfig } from "@/lib/types";

const FIELDS: { key: keyof SettingsConfig; label: string; min?: number; max?: number }[] = [
  { key: "numberPoolSize", label: "選號範圍上限（1~此數字，選 6 碼）", min: 7, max: 99 },
  { key: "betPrice", label: "每注金額" },
  { key: "baseJackpotAmount", label: "頭獎底金" },
  { key: "prize2Amount", label: "貳獎（5中+特別號）固定金額" },
  { key: "prize3Amount", label: "參獎（5中）固定金額" },
  { key: "prize4Amount", label: "肆獎（4中）固定金額" },
  { key: "prize5Amount", label: "伍獎（3中）固定金額" },
  { key: "prize6Amount", label: "陸獎（2中+特別號）固定金額" },
  { key: "prize7Amount", label: "普獎（0中+特別號）固定金額" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await fetch("/api/settings").then((r) => r.json());
      setSettings(data);
    } catch {
      setLoadError("網路連線異常，請確認網路狀態後再試一次");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    loadSettings();
  }, [loadSettings]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setMessage(res.ok ? { text: "已儲存。", ok: true } : { text: "儲存失敗，請檢查輸入。", ok: false });
    } catch {
      setMessage({ text: "網路連線異常，請確認網路狀態後再試一次", ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="space-y-3 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          type="button"
          onClick={loadSettings}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          重新載入
        </button>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-sm text-gray-500">載入中...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">參數設定</h1>
      <div className="space-y-4 rounded-2xl border border-black/10 bg-card/70 p-5 shadow-sm dark:border-white/10 dark:bg-card/5">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-300">{field.label}</label>
            <input
              type="number"
              min={field.min ?? 0}
              max={field.max}
              className="w-40 rounded-lg border border-black/10 bg-card px-3 py-1.5 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-black/20"
              value={settings[field.key]}
              onChange={(e) =>
                setSettings({ ...settings, [field.key]: Number(e.target.value) })
              }
            />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            {saving ? "儲存中..." : "儲存設定"}
          </button>
          {message && (
            <span className={`text-sm ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
