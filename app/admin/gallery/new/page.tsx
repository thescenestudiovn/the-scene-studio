"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Destination = { id: string; name: string };
type Form = { title: string; description: string; destination_id: string; client_name: string; event_date: string; seo_title: string; seo_description: string };
const emptyForm: Form = { title: "", description: "", destination_id: "", client_name: "", event_date: "", seo_title: "", seo_description: "" };

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function NewCollectionPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/destinations", { cache: "no-store" })
      .then(r => r.json() as Promise<{ destinations?: Destination[] }>)
      .then(data => setDestinations(data.destinations ?? []));
  }, []);

  async function createCollection() {
    if (!form.title.trim()) { setMessage("Collection title is required."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: slugify(form.title), published: false }) });
      const data = await response.json() as { success: boolean; error?: string; collection?: { id: string } };
      if (!response.ok || !data.success || !data.collection) throw new Error(data.error || "Could not create collection.");
      router.push(`/admin/gallery/${data.collection.id}?step=2`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create collection.");
      setSaving(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-3xl"><Link href="/admin/gallery" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Gallery</Link><div className="mt-8"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">New Collection · Step 1</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Collection details</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#77736c]">Create the collection first. It will be saved as Draft, then you will be taken directly into the collection to add photos in Step 2.</p></div><section className="mt-10 border border-[#d8d3ca] bg-white p-7 md:p-9"><div className="grid gap-5 md:grid-cols-2"><label className="text-xs uppercase tracking-[0.12em] md:col-span-2">Collection title *<input className="mt-2 w-full border border-[#d8d3ca] p-3" placeholder="e.g. George & Vivian" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Client name<input className="mt-2 w-full border border-[#d8d3ca] p-3" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Destination<select className="mt-2 w-full border border-[#d8d3ca] p-3" value={form.destination_id} onChange={e => setForm({ ...form, destination_id: e.target.value })}><option value="">Select destination</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label className="text-xs uppercase tracking-[0.12em]">Event date<input type="date" className="mt-2 w-full border border-[#d8d3ca] p-3" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">SEO title<input className="mt-2 w-full border border-[#d8d3ca] p-3" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em] md:col-span-2">Description<textarea className="mt-2 min-h-28 w-full border border-[#d8d3ca] p-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em] md:col-span-2">SEO description<textarea className="mt-2 min-h-24 w-full border border-[#d8d3ca] p-3" value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} /></label><div className="border border-[#e5e1da] bg-[#f7f5f0] p-4 text-sm leading-6 text-[#77736c] md:col-span-2">Slug is generated automatically from the title. It is hidden during creation and can be edited later from Collection settings.</div><div className="flex items-center justify-between gap-4 pt-2 md:col-span-2"><Link href="/admin/gallery" className="text-xs uppercase tracking-[0.12em] text-[#77736c]">Cancel</Link><button onClick={createCollection} disabled={saving} className="bg-[#171717] px-7 py-3 text-xs uppercase tracking-[0.15em] text-white">{saving ? "Saving…" : "Save & Continue to Step 2"}</button></div>{message && <p className="text-sm text-red-700 md:col-span-2">{message}</p>}</div></section></div></main>;
}
