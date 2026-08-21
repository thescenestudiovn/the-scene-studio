"use client";

import { FormEvent, useEffect, useState } from "react";

type Destination = { id: string; name: string; country: string; country_name: string; slug: string };
type Form = { title: string; slug: string; location: string; date: string; category: string; description: string; destination_id: string };

const CATEGORIES = ["Wedding", "Prewedding", "Elopement", "Engagement", "Destination Wedding", "Editorial", "Lifestyle", "Other"];

export default function NewStoryPage() {
  const [form, setForm] = useState<Form>({ title: "", slug: "", location: "", date: "", category: "", description: "", destination_id: "" });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/api/admin/destinations", { cache: "no-store" });
        const data = (await response.json()) as { success: boolean; destinations?: Destination[]; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || "Failed to load destinations");
        setDestinations(data.destinations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load destinations");
      } finally { setLoadingDestinations(false); }
    }
    void loadDestinations();
  }, []);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      if (!form.title.trim() || !form.slug.trim()) throw new Error("Title and slug are required.");
      if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) throw new Error("Date must be a valid date.");
      const response = await fetch("/api/admin/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, title: form.title.trim(), slug: form.slug.trim(), location: form.location.trim() || null, date: form.date || null, category: form.category || null, description: form.description.trim() || null, destination_id: form.destination_id || null }) });
      const data = (await response.json()) as { success: boolean; story?: { id: string }; error?: string };
      if (!response.ok || !data.success || !data.story) throw new Error(data.error || `Failed to create story (${response.status})`);
      window.location.href = `/admin/stories/${data.story.id}`;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create story"); setSaving(false); }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="border-b border-black/10 px-5 py-5 md:px-8"><div className="mx-auto max-w-[1100px]"><a href="/admin/stories" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45">← Stories</a><h1 className="mt-3 font-serif text-5xl tracking-[-0.05em]">New story</h1></div></header>
      <section className="mx-auto max-w-[1100px] px-5 py-10 md:px-8">
        <form onSubmit={submit} className="max-w-3xl space-y-8">
          <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Title *</span><input required value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 font-serif text-3xl outline-none" /></label>
          <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Slug *</span><div className="mt-3 flex gap-3 border-b border-black/15"><input required value={form.slug} onChange={(e) => update("slug", e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 font-sans text-sm outline-none" /><button type="button" onClick={() => update("slug", slugify(form.title))} className="font-sans text-[8px] uppercase tracking-[0.15em] opacity-40 hover:opacity-100">Generate</button></div></label>
          <div className="grid gap-6 md:grid-cols-3">
            <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Date</span><input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="mt-2 w-full border-b border-black/15 bg-transparent py-3 font-sans text-sm outline-none" /></label>
            <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Category</span><select value={form.category} onChange={(e) => update("category", e.target.value)} className="mt-2 w-full border-b border-black/15 bg-[#f7f5f0] py-3 font-sans text-sm outline-none"><option value="">Select category</option>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
            <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Destination</span><select value={form.destination_id} onChange={(e) => update("destination_id", e.target.value)} disabled={loadingDestinations} className="mt-2 w-full border-b border-black/15 bg-[#f7f5f0] py-3 font-sans text-sm outline-none"><option value="">{loadingDestinations ? "Loading…" : "Select destination"}</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}{destination.country_name ? ` — ${destination.country_name}` : ""}</option>)}</select></label>
          </div>
          <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Location</span><input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Da Nang, Vietnam" className="mt-2 w-full border-b border-black/15 bg-transparent py-3 font-sans text-sm outline-none" /></label>
          <label className="block"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-45">Description</span><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} placeholder="Short story introduction" className="mt-3 w-full resize-none border border-black/10 bg-white/30 p-4 font-serif text-lg outline-none" /></label>
          {error && <p className="border-l-2 border-red-700 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em] text-red-700">{error}</p>}
          <button disabled={saving} className="bg-[#171717] px-6 py-3 font-sans text-[9px] uppercase tracking-[0.2em] text-white disabled:opacity-40">{saving ? "Creating…" : "Create story →"}</button>
        </form>
      </section>
    </main>
  );
}
