"use client";

import { useEffect, useState } from "react";

type Settings = { phone: string; email: string; instagram: string; facebook: string };
const empty: Settings = { phone: "", email: "", instagram: "", facebook: "" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then(async response => {
        const data = await response.json() as { success?: boolean; settings?: Settings; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || "Failed to load site settings");
        setSettings(data.settings ?? empty);
      })
      .catch(error => setMessage(error instanceof Error ? error.message : "Failed to load site settings"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json() as { success?: boolean; settings?: Settings; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save site settings");
      if (data.settings) setSettings(data.settings);
      setMessage("Site settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save site settings");
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof Settings, label: string, placeholder: string) {
    return (
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{label}</span>
        <input
          value={settings[key]}
          onChange={event => setSettings(current => ({ ...current, [key]: event.target.value }))}
          disabled={loading}
          className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none focus:border-[#171717] disabled:opacity-50"
          placeholder={placeholder}
        />
      </label>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">The Scene Studio</p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.04em]">Site Settings</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#77736c]">Global contact and social information. Components across the website can reuse these values without entering them again.</p>
          </div>
          <button type="button" onClick={save} disabled={loading || saving} className="shrink-0 bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save Settings"}</button>
        </div>

        <section className="mt-10 border border-[#d8d3ca] bg-white p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {field("phone", "Phone", "+84 ...")}
            {field("email", "Email", "hello@thescenestudio.asia")}
            {field("instagram", "Instagram", "https://instagram.com/...")}
            {field("facebook", "Facebook", "https://facebook.com/...")}
          </div>
          {message && <p className="mt-6 text-xs text-[#666158]">{message}</p>}
        </section>

        <p className="mt-6 text-xs leading-5 text-[#8a857d]">These are global values. When a Story, footer, contact section or other component is built to use Site Settings, changing them here updates that component automatically.</p>
      </div>
    </main>
  );
}
