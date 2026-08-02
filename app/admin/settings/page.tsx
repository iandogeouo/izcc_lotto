"use client";

import { useEffect, useState } from "react";
import type { SettingsConfig } from "@/lib/types";

const FIELDS: { key: keyof SettingsConfig; label: string }[] = [
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMessage(res.ok ? "已儲存。" : "儲存失敗，請檢查輸入。");
  }

  if (!settings) {
    return <p className="text-sm text-gray-500">載入中...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">參數設定</h1>
      <div className="space-y-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-4">
            <label className="text-sm">{field.label}</label>
            <input
              type="number"
              min={0}
              className="w-40 rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-right dark:border-white/20"
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
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
          >
            {saving ? "儲存中..." : "儲存設定"}
          </button>
          {message && <span className="text-sm text-gray-500">{message}</span>}
        </div>
      </div>
    </div>
  );
}
