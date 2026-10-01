"use client";

import { useEffect, useState } from "react";

type Destination = { id: string; name: string; slug: string; country: string; country_name: string; region?: string | null; seo_title?: string | null; seo_description?: string | null; description?: string | null };
const empty = { name: "", slug: "", country: "vn", country_name: "Vietnam", region: "", description: "", seo_title: "", seo_description: "" };
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export default function DestinationsManager() {
    const [items, setItems] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState(empty);

    async function load() {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/destinations", { cache: "no-store" });
            const data = await response.json() as { destinations?: Destination[]; error?: string };
            if (!response.ok) throw new Error(data.error || "Could not load destinations.");
            setItems(data.destinations ?? []);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not load destinations.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

    function edit(item: Destination) {
        setEditing(item.id);
        setForm({ name: item.name, slug: item.slug, country: item.country, country_name: item.country_name, region: item.region ?? "", description: item.description ?? "", seo_title: item.seo_title ?? "", seo_description: item.seo_description ?? "" });
    }

    function reset() { setEditing(null); setForm(empty); setMessage(""); }

    async function save() {
        if (!form.name.trim()) { setMessage("Destination name is required."); return; }
        setSaving(true);
        setMessage("");
        try {
            const payload = { ...form, slug: form.slug || slugify(form.name), ...(editing ? { id: editing } : {}) };
            const response = await fetch("/api/admin/destinations", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json() as { success?: boolean; error?: string };
            if (!response.ok || !data.success) throw new Error(data.error || "Could not save destination.");
            setMessage(editing ? "Destination updated." : "Destination created.");
            reset();
            await load();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not save destination.");
        } finally {
            setSaving(false);
        }
    }

    return <div className="mt-5 border-y border-[#e7e2da]">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="font-serif text-2xl">Destinations</h3><p className="mt-1 text-xs text-[#77736c]">Manage places used by Stories.</p></div>{editing && <button type="button" onClick={reset} className="text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Cancel edit</button>}</div>
        <div className="grid gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <input aria-label="Destination name" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm" placeholder="Name — Da Nang" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
            <input aria-label="Destination slug" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm" placeholder="Slug — da-nang" value={form.slug} onChange={event => setForm(current => ({ ...current, slug: slugify(event.target.value) }))} />
            <input aria-label="Country code" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm" placeholder="Country code — vn" value={form.country} onChange={event => setForm(current => ({ ...current, country: event.target.value.toLowerCase() }))} />
            <input aria-label="Country name" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm" placeholder="Country — Vietnam" value={form.country_name} onChange={event => setForm(current => ({ ...current, country_name: event.target.value }))} />
            <input aria-label="Region" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm" placeholder="Region (optional)" value={form.region} onChange={event => setForm(current => ({ ...current, region: event.target.value }))} />
            <input aria-label="Destination SEO title" className="min-w-0 border border-[#d8d3ca] bg-white px-3 py-2.5 text-sm sm:col-span-2" placeholder="SEO title" value={form.seo_title} onChange={event => setForm(current => ({ ...current, seo_title: event.target.value }))} />
            <button type="button" onClick={() => void save()} disabled={saving} className="bg-[#171717] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-50">{saving ? "Saving…" : editing ? "Save destination" : "Add destination"}</button>
            <textarea aria-label="Destination description" className="min-h-20 min-w-0 border border-[#d8d3ca] bg-white p-3 text-sm sm:col-span-2 lg:col-span-4" placeholder="Description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
            <textarea aria-label="Destination SEO description" className="min-h-16 min-w-0 border border-[#d8d3ca] bg-white p-3 text-sm sm:col-span-2 lg:col-span-4" placeholder="SEO description" value={form.seo_description} onChange={event => setForm(current => ({ ...current, seo_description: event.target.value }))} />
        </div>
        {message && <p role="status" className="pb-3 text-xs text-[#666158]">{message}</p>}
        <div className="divide-y divide-[#e7e2da]">
            {loading ? <p className="py-4 text-sm text-[#77736c]">Loading destinations…</p> : items.length ? items.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm">{item.name}</p><p className="mt-1 text-[10px] text-[#77736c]">{item.country_name} · /destinations/{item.country}/{item.slug}</p></div><button type="button" onClick={() => edit(item)} className="border border-[#d8d3ca] px-3 py-2 text-[9px] uppercase tracking-[0.12em]">Edit</button></div>) : <p className="py-4 text-sm text-[#77736c]">No destinations yet.</p>}
        </div>
    </div>;
}