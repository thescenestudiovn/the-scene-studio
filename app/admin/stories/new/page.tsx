"use client";

import { FormEvent, useState } from "react";

export default function NewStoryPage() {
  const [form, setForm] = useState({ title: "", slug: "", location: "", date: "", category: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = (await response.json()) as { success: boolean; story?: { id: string }; error?: string };
      if (!response.ok || !data.success || !data.story) throw new Error(data.error || `Failed to create story (${response.status})`);
      window.location.href = `/admin/stories/${data.story.id}`;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create story"); setSaving(false); }
  };

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><header className="border-b border-black/10 px-5 py-5 md:px-8"><div className="mx-auto max-w-[1100px]"><a href="/admin/stories" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45">← Stories</a><h1 className="mt-3 font-serif text-5xl tracking-[-0.05em]">New story</h1></div></header><section className="mx-auto max-w-[1100px] px-5 py-10 md:px-8"><form onSubmit={submit} className="max-w-3xl space-y-7"><label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 font-serif text-3xl outline-none" /></label><label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Slug</span><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 font-sans text-sm outline-none" /></label><div className="grid gap-6 md:grid-cols-3"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border-b border-black/15 bg-transparent py-3 font-sans text-[10px] uppercase outline-none" /><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Date" className="border-b border-black/15 bg-transparent py-3 font-sans text-[10px] uppercase outline-none" /><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="border-b border-black/15 bg-transparent py-3 font-sans text-[10px] uppercase outline-none" /></div><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Short story introduction" className="w-full resize-none border border-black/10 bg-white/30 p-4 font-serif text-lg outline-none" />{error && <p className="border-l-2 border-red-700 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em] text-red-700">{error}</p>}<button disabled={saving} className="bg-[#171717] px-6 py-3 font-sans text-[9px] uppercase tracking-[0.2em] text-white disabled:opacity-40">{saving ? "Creating…" : "Create story →"}</button></form></section></main>;
}
