"use client";

import { useEffect, useState } from "react";

interface Destination { id: string; name: string; slug: string; country: string; country_name: string; region?: string | null; seo_title?: string | null; seo_description?: string | null; description?: string | null; }
interface DestinationsResponse { destinations?: Destination[] }

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<Destination[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<string | null>(null); const [message, setMessage] = useState("");
  const empty = { name: "", slug: "", country: "vn", country_name: "Vietnam", region: "", description: "", seo_title: "", seo_description: "" };
  const [form, setForm] = useState(empty);

  async function load() { setLoading(true); const response = await fetch("/api/admin/destinations", { cache: "no-store" }); const data = (await response.json()) as DestinationsResponse; setItems(data.destinations ?? []); setLoading(false); }
  useEffect(() => { load(); }, []);

  function edit(item: Destination) { setEditing(item.id); setForm({ name: item.name, slug: item.slug, country: item.country, country_name: item.country_name, region: item.region ?? "", description: item.description ?? "", seo_title: item.seo_title ?? "", seo_description: item.seo_description ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { setEditing(null); setForm(empty); setMessage(""); }

  async function save() {
    if (!form.name) return setMessage("Destination name is required.");
    const payload = { ...form, slug: form.slug || slugify(form.name), ...(editing ? { id: editing } : {}) };
    const response = await fetch("/api/admin/destinations", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json() as { success: boolean; error?: string };
    if (!response.ok || !data.success) return setMessage(data.error || "Could not save destination.");
    setMessage(editing ? "Destination updated." : "Destination created."); reset(); await load();
  }

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl">
    <a href="/admin" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Admin</a>
    <div className="mt-8"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">SEO</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Destinations</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#77736c]">Shared SEO taxonomy used by Collections and Stories. Slugs are used in public URLs and can be customized when needed.</p></div>
    <section className="mt-12 border border-[#d8d3ca] bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">{editing ? "Edit destination" : "New destination"}</p><h2 className="mt-2 font-serif text-2xl">{editing ? form.name : "Create a destination"}</h2></div>{editing && <button onClick={reset} className="text-xs uppercase tracking-[0.14em] text-[#77736c]">Cancel</button>}</div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><input className="border border-[#d8d3ca] p-3" placeholder="Name — Da Nang" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}/><input className="border border-[#d8d3ca] p-3" placeholder="Slug — da-nang" value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}/><input className="border border-[#d8d3ca] p-3" placeholder="Country code — vn" value={form.country} onChange={e => setForm({ ...form, country: e.target.value.toLowerCase() })}/><input className="border border-[#d8d3ca] p-3" placeholder="Country — Vietnam" value={form.country_name} onChange={e => setForm({ ...form, country_name: e.target.value })}/><input className="border border-[#d8d3ca] p-3" placeholder="Region (optional)" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}/><input className="border border-[#d8d3ca] p-3 md:col-span-2" placeholder="SEO title" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })}/><button onClick={save} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">{editing ? "Save changes" : "Create destination"}</button></div>
      <textarea className="mt-4 min-h-24 w-full border border-[#d8d3ca] p-3" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/><textarea className="mt-4 min-h-20 w-full border border-[#d8d3ca] p-3" placeholder="SEO description" value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })}/>{message && <p className="mt-4 text-sm text-[#77736c]">{message}</p>}
    </section>
    <section className="mt-10 overflow-hidden border border-[#d8d3ca] bg-white">{loading ? <p className="p-6 text-sm text-[#77736c]">Loading…</p> : items.length === 0 ? <p className="p-6 text-sm text-[#77736c]">No destinations yet.</p> : items.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e2da] p-5 last:border-0"><div><strong className="font-serif text-xl">{item.name}</strong><div className="mt-1 text-xs text-[#77736c]">{item.country_name} · /destinations/{item.country}/{item.slug}</div>{item.seo_title && <div className="mt-1 text-xs text-[#999]">SEO: {item.seo_title}</div>}</div><button onClick={() => edit(item)} className="border border-[#d8d3ca] px-4 py-2 text-xs uppercase tracking-[0.14em]">Edit</button></div>)}</section>
  </div></main>;
}
