"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Collection = { id: string; title: string; slug: string; description?: string | null; destination_name?: string | null; media_count?: number; published?: number; cover_path?: string | null };
type Destination = { id: string; name: string };
type CollectionsResponse = { collections?: Collection[]; error?: string };
type DestinationsResponse = { destinations?: Destination[]; error?: string };

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState({ title: "", slug: "", description: "", destination_id: "", client_name: "", event_date: "", seo_title: "", seo_description: "" });
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const [a, b] = await Promise.all([fetch("/api/admin/collections", { cache: "no-store" }), fetch("/api/admin/destinations", { cache: "no-store" })]);
    const collections = (await a.json()) as CollectionsResponse;
    const destinations = (await b.json()) as DestinationsResponse;
    setItems(collections.collections ?? []); setDestinations(destinations.destinations ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.title) return setMessage("Collection title is required.");
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    const response = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = (await response.json()) as { success: boolean; error?: string };
    if (!response.ok || !data.success) return setMessage(data.error || "Could not create collection.");
    setForm({ title: "", slug: "", description: "", destination_id: "", client_name: "", event_date: "", seo_title: "", seo_description: "" }); setMessage("Collection created."); await load();
  }

  async function setStatus(item: Collection, published: boolean) {
    setBusyId(item.id);
    try {
      const response = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, title: item.title, slug: item.slug, description: item.description, published }) });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) setMessage(data.error || "Could not update collection.");
      else await load();
    } finally { setBusyId(null); }
  }

  async function remove(item: Collection) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      const response = await fetch("/api/admin/collections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) setMessage(data.error || "Could not delete collection.");
      else await load();
    } finally { setBusyId(null); }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl">
      <Link href="/admin" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Admin</Link>
      <div className="mt-8"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Gallery</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Collections</h1><p className="mt-3 max-w-xl text-sm text-[#77736c]">One collection represents one client gallery. Photos are managed inside each collection and can be reused by Stories.</p></div>
      <section className="mt-12 border border-[#d8d3ca] bg-white p-6 md:p-8"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <input className="border border-[#d8d3ca] p-3" placeholder="Collection title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        <input className="border border-[#d8d3ca] p-3" placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} />
        <input className="border border-[#d8d3ca] p-3" placeholder="Client name" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
        <select className="border border-[#d8d3ca] p-3" value={form.destination_id} onChange={e => setForm({ ...form, destination_id: e.target.value })}><option value="">Destination</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <input className="border border-[#d8d3ca] p-3" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
        <input className="border border-[#d8d3ca] p-3 lg:col-span-2" placeholder="SEO title" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} />
        <button onClick={create} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">Create collection</button>
      </div><textarea className="mt-4 min-h-24 w-full border border-[#d8d3ca] p-3" placeholder="Collection description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><input className="mt-4 w-full border border-[#d8d3ca] p-3" placeholder="SEO description" value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} />{message && <p className="mt-4 text-sm text-[#77736c]">{message}</p>}</section>
      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="group border border-[#d8d3ca] bg-white p-4"><Link href={`/admin/collections/${item.id}`}><div className="aspect-[4/3] overflow-hidden bg-[#ddd8cf]">{item.cover_path && <img src={item.cover_path} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />}</div><div className="flex items-start justify-between gap-4 pt-5"><div><h2 className="font-serif text-2xl">{item.title}</h2><p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#77736c]">{item.destination_name ?? "No destination"}</p></div><span className="text-xs text-[#77736c]">{item.media_count ?? 0} photos</span></div></Link><div className="mt-5 flex items-center justify-between border-t border-[#eeeae3] pt-4"><span className={`text-[10px] uppercase tracking-[0.14em] ${item.published ? "text-[#49654f]" : "text-[#8a7660]"}`}>{item.published ? "Published" : "Draft"}</span><div className="flex gap-1"><button disabled={busyId === item.id || !!item.published} onClick={() => setStatus(item, true)} className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#49654f] disabled:opacity-30">Publish</button><button disabled={busyId === item.id || !item.published} onClick={() => setStatus(item, false)} className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#8a7660] disabled:opacity-30">Draft</button><button disabled={busyId === item.id} onClick={() => remove(item)} className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-red-700 disabled:opacity-30">Delete</button></div></div></article>)}{items.length === 0 && <p className="text-sm text-[#77736c]">No collections yet.</p>}</section>
    </div></main>
  );
}
