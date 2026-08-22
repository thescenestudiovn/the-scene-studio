"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Collection = { id: string; title: string; slug: string; description?: string | null; destination_name?: string | null; media_count?: number; published?: number; cover_path?: string | null };
type Destination = { id: string; name: string };
type CollectionsResponse = { collections?: Collection[] };
type DestinationsResponse = { destinations?: Destination[] };

type Form = { title: string; description: string; destination_id: string; client_name: string; event_date: string; seo_title: string; seo_description: string };
const emptyForm: Form = { title: "", description: "", destination_id: "", client_name: "", event_date: "", seo_title: "", seo_description: "" };

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [created, setCreated] = useState<Collection | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [a, b] = await Promise.all([fetch("/api/admin/collections", { cache: "no-store" }), fetch("/api/admin/destinations", { cache: "no-store" })]);
    const collections = (await a.json()) as CollectionsResponse;
    const destinations = (await b.json()) as DestinationsResponse;
    setItems(collections.collections ?? []); setDestinations(destinations.destinations ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() { setForm(emptyForm); setCreated(null); setFiles([]); setMessage(""); setStep(1); }

  async function createCollection() {
    if (!form.title.trim()) return setMessage("Collection title is required.");
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: slugify(form.title), published: false }) });
    const data = (await response.json()) as { success: boolean; error?: string; collection?: Collection };
    setSaving(false);
    if (!response.ok || !data.success || !data.collection) return setMessage(data.error || "Could not create collection.");
    setCreated(data.collection); setStep(2); setMessage("Collection created as Draft. Add photos now, then open the collection to edit or publish it."); await load();
  }

  async function uploadSelected() {
    if (!created || files.length === 0) return;
    setSaving(true); setMessage("");
    try {
      for (const file of files) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: JPEG, PNG or WebP only`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: maximum 5 MB`);
        const url = URL.createObjectURL(file); const image = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => { image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not read ${file.name}`)); }; image.src = url; });
        const body = new FormData(); body.append("file", file); body.append("collection_id", created.id); body.append("collection_slug", created.slug); body.append("alt", file.name.replace(/\.[^/.]+$/, "")); body.append("width", String(dimensions.width)); body.append("height", String(dimensions.height));
        const response = await fetch("/api/admin/media/upload", { method: "POST", body });
        const data = (await response.json()) as { success: boolean; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || `Failed to upload ${file.name}`);
      }
      setFiles([]); if (inputRef.current) inputRef.current.value = ""; setMessage("Photos uploaded successfully."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); } finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Gallery</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Collections</h1><p className="mt-3 max-w-xl text-sm text-[#77736c]">One collection represents one client gallery. Photos are managed inside each collection and can be reused by Stories.</p></div><button onClick={startCreate} className="bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.15em] text-white">+ New Collection</button></div>
    <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="group border border-[#d8d3ca] bg-white p-4"><Link href={`/admin/gallery/${item.id}`}><div className="aspect-[4/3] overflow-hidden bg-[#ddd8cf]">{item.cover_path && <img src={item.cover_path} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />}</div><div className="flex items-start justify-between gap-4 pt-5"><div><h2 className="font-serif text-2xl">{item.title}</h2><p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#77736c]">{item.destination_name ?? "No destination"}</p></div><span className="text-xs text-[#77736c]">{item.media_count ?? 0} photos</span></div></Link></article>)}{items.length === 0 && <p className="text-sm text-[#77736c]">No collections yet.</p>}</section>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" hidden={!step}><section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-7 md:p-9"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-[#77736c]">New Collection · Step {step} of 2</p><h2 className="mt-2 font-serif text-4xl">{step === 1 ? "Collection details" : "Add photos"}</h2></div><button onClick={() => { setStep(1); setCreated(null); }} className="text-2xl text-[#77736c]">×</button></div>
      {step === 1 && <div className="mt-8 grid gap-4 md:grid-cols-2"><input className="border border-[#d8d3ca] p-3 md:col-span-2" placeholder="Collection title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><div className="border border-[#d8d3ca] bg-[#f5f3ef] p-3 text-sm text-[#77736c] md:col-span-2">Slug will be generated automatically from the collection title. You can edit it later inside the collection settings.</div><input className="border border-[#d8d3ca] p-3" placeholder="Client name" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /><select className="border border-[#d8d3ca] p-3" value={form.destination_id} onChange={e => setForm({ ...form, destination_id: e.target.value })}><option value="">Destination</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><input className="border border-[#d8d3ca] p-3" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /><input className="border border-[#d8d3ca] p-3" placeholder="SEO title" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} /><textarea className="min-h-24 border border-[#d8d3ca] p-3 md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><textarea className="min-h-20 border border-[#d8d3ca] p-3 md:col-span-2" placeholder="SEO description" value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} /><div className="flex justify-end md:col-span-2"><button onClick={createCollection} disabled={saving} className="bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.15em] text-white">{saving ? "Creating…" : "Create & Continue"}</button></div></div>}
      {step === 2 && created && <div className="mt-8"><div className="border border-[#d8d3ca] bg-[#f7f5f0] p-5"><p className="font-serif text-2xl">{created.title}</p><p className="mt-1 text-sm text-[#77736c]">/{created.slug} · Draft</p></div><button onClick={() => inputRef.current?.click()} disabled={saving} className="mt-6 w-full border border-dashed border-[#aaa49a] px-6 py-14 text-center text-sm uppercase tracking-[0.12em]">Select Photos</button><input ref={inputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => setFiles(Array.from(e.target.files ?? []))} />{files.length > 0 && <div className="mt-4 flex items-center justify-between text-sm"><span>{files.length} photo(s) selected</span><button onClick={uploadSelected} disabled={saving} className="bg-[#171717] px-5 py-2 text-xs uppercase tracking-[0.12em] text-white">{saving ? "Uploading…" : "Upload Photos"}</button></div>}<div className="mt-8 flex justify-between"><button onClick={() => setStep(1)} className="text-xs uppercase tracking-[0.12em] text-[#77736c]">Back</button><Link href={`/admin/gallery/${created.id}`} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.12em] text-white">Open Collection</Link></div></div>}
      {message && <p className="mt-5 text-sm text-[#77736c]">{message}</p>}
    </section></div>
  </div></main>;
}
