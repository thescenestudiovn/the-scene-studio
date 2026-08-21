"use client";

import { FormEvent, useEffect, useState } from "react";

type Collection = { id: string; title: string; slug: string; description: string | null; destination_id: string | null; destination_name: string | null; destination_country: string | null };
type Destination = { id: string; name: string; country_name: string; slug: string };
type CollectionsResponse = { success?: boolean; collections?: Collection[]; error?: string };
type DestinationsResponse = { success?: boolean; destinations?: Destination[]; error?: string };
type CreateCollectionResponse = { success?: boolean; error?: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [cResponse, dResponse] = await Promise.all([
      fetch("/api/admin/collections", { cache: "no-store" }),
      fetch("/api/admin/destinations", { cache: "no-store" }),
    ]);
    const c = (await cResponse.json()) as CollectionsResponse;
    const d = (await dResponse.json()) as DestinationsResponse;
    if (!cResponse.ok || !c.success) throw new Error(c.error || "Failed to load collections");
    if (!dResponse.ok || !d.success) throw new Error(d.error || "Failed to load destinations");
    setCollections(c.collections ?? []);
    setDestinations(d.destinations ?? []);
  }

  useEffect(() => { void load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load")); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), slug: slugify(title), description: description.trim() || null, destination_id: destinationId || null }) });
      const data = (await response.json()) as CreateCollectionResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create collection");
      setTitle(""); setDescription(""); setDestinationId("");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to create collection"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
    <header className="border-b border-black/10 px-5 py-6 md:px-8"><div className="mx-auto flex max-w-[1500px] items-end justify-between"><div><a href="/admin" className="font-sans text-[9px] uppercase tracking-[.28em] opacity-45">← Admin</a><h1 className="mt-2 font-serif text-5xl tracking-[-.05em]">Collections</h1></div><span className="font-sans text-[9px] uppercase tracking-[.2em] opacity-40">{collections.length} collections</span></div></header>
    <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12">
      <form onSubmit={create} className="grid gap-4 border border-black/10 bg-white/40 p-6 md:grid-cols-[1.2fr_1fr_1.5fr_auto] md:items-end">
        <label className="font-sans text-[9px] uppercase tracking-[.18em]">Collection name<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full border-b border-black/20 bg-transparent px-0 py-2 font-serif text-2xl outline-none" placeholder="Da Nang Wedding" required /></label>
        <label className="font-sans text-[9px] uppercase tracking-[.18em]">Destination<select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="mt-2 w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none"><option value="">No destination</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}{d.country_name ? ` — ${d.country_name}` : ""}</option>)}</select></label>
        <label className="font-sans text-[9px] uppercase tracking-[.18em]">Description<input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full border-b border-black/20 bg-transparent px-0 py-2 text-sm outline-none" placeholder="Optional description" /></label>
        <button disabled={busy} className="bg-[#171717] px-6 py-3 text-[9px] uppercase tracking-[.18em] text-white disabled:opacity-40">{busy ? "Creating…" : "Create"}</button>
      </form>
      {error && <p className="mt-4 border-l-2 border-red-700 px-4 py-2 text-[10px] uppercase tracking-[.12em] text-red-700">{error}</p>}
      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{collections.map((c) => <a key={c.id} href={`/admin/collections/${c.id}`} className="group border border-black/10 bg-white/35 p-6 transition hover:bg-white"><p className="font-sans text-[9px] uppercase tracking-[.2em] opacity-40">{c.destination_name || "Collection"}</p><h2 className="mt-3 font-serif text-3xl tracking-[-.03em] group-hover:underline">{c.title}</h2><p className="mt-3 line-clamp-2 text-sm opacity-55">{c.description || "No description"}</p><p className="mt-8 font-sans text-[9px] uppercase tracking-[.18em] opacity-40">Open collection →</p></a>)}</div>
    </section>
  </main>;
}
