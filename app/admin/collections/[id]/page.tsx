"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };
type Collection = { id: string; title: string; slug: string; description: string | null; destination_id: string | null; client_name: string | null; event_date: string | null; seo_title: string | null; seo_description: string | null; published: number; cover_media_id: string | null; destination_name: string | null };
type Destination = { id: string; name: string };

export default function AdminCollectionEditor() {
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [collectionsRes, destinationsRes] = await Promise.all([fetch("/api/admin/collections", { cache: "no-store" }), fetch("/api/admin/destinations", { cache: "no-store" })]);
    const collections = (await collectionsRes.json()) as { collections?: Collection[] };
    const destinations = (await destinationsRes.json()) as { destinations?: Destination[] };
    const found = (collections.collections ?? []).find(item => item.id === id) ?? null;
    setCollection(found);
    setDestinations(destinations.destinations ?? []);
    if (found) {
      const mediaRes = await fetch(`/api/admin/media?collection_id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const mediaData = (await mediaRes.json()) as { media?: Media[] };
      setMedia(mediaData.media ?? []);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function save() {
    if (!collection) return;
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(collection) });
    const data = (await response.json()) as { success: boolean; error?: string };
    setSaving(false); setMessage(response.ok && data.success ? "Saved." : data.error || "Could not save.");
    if (response.ok && data.success) await load();
  }

  async function upload(files: FileList | null) {
    if (!files || !collection) return;
    setUploading(true); setMessage("");
    try {
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: JPEG, PNG or WebP only`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: maximum 5 MB`);
        const url = URL.createObjectURL(file); const image = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => { image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not read ${file.name}`)); }; image.src = url; });
        const form = new FormData();
        form.append("file", file); form.append("collection_id", collection.id); form.append("collection_slug", collection.slug); form.append("alt", file.name.replace(/\.[^/.]+$/, "")); form.append("width", String(dimensions.width)); form.append("height", String(dimensions.height));
        const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
        const data = (await response.json()) as { success: boolean; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || `Failed to upload ${file.name}`);
      }
      setMessage("Images uploaded to R2.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  async function setCover(mediaId: string) {
    if (!collection) return;
    setCollection({ ...collection, cover_media_id: mediaId });
    await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...collection, cover_media_id: mediaId }) });
    setMessage("Cover updated.");
  }

  if (!collection) return <main className="p-10">Loading collection…</main>;

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-10 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl"><Link href="/admin/collections" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Collections</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Collection Editor</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">{collection.title}</h1><p className="mt-2 text-sm text-[#77736c]">/gallery/{collection.slug}</p></div><div className="flex gap-3"><a href={`/gallery/${collection.slug}`} target="_blank" rel="noreferrer" className="border border-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em]">View Gallery</a><button onClick={save} disabled={saving} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">{saving ? "Saving…" : "Save"}</button></div></div>

<section className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]"><div className="border border-[#d8d3ca] bg-white p-6"><div className="grid gap-4"><label className="text-xs uppercase tracking-[0.12em]">Title<input className="mt-2 w-full border p-3" value={collection.title} onChange={e => setCollection({ ...collection, title: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Slug<input className="mt-2 w-full border p-3" value={collection.slug} onChange={e => setCollection({ ...collection, slug: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Client<input className="mt-2 w-full border p-3" value={collection.client_name ?? ""} onChange={e => setCollection({ ...collection, client_name: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Destination<select className="mt-2 w-full border p-3" value={collection.destination_id ?? ""} onChange={e => setCollection({ ...collection, destination_id: e.target.value || null })}><option value="">None</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label className="text-xs uppercase tracking-[0.12em]">Event date<input type="date" className="mt-2 w-full border p-3" value={collection.event_date ?? ""} onChange={e => setCollection({ ...collection, event_date: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">Description<textarea className="mt-2 min-h-28 w-full border p-3" value={collection.description ?? ""} onChange={e => setCollection({ ...collection, description: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">SEO title<input className="mt-2 w-full border p-3" value={collection.seo_title ?? ""} onChange={e => setCollection({ ...collection, seo_title: e.target.value })} /></label><label className="text-xs uppercase tracking-[0.12em]">SEO description<textarea className="mt-2 min-h-20 w-full border p-3" value={collection.seo_description ?? ""} onChange={e => setCollection({ ...collection, seo_description: e.target.value })} /></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={collection.published === 1} onChange={e => setCollection({ ...collection, published: e.target.checked ? 1 : 0 })} /> Published</label></div></div>

<div><div className="mb-4 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-serif text-3xl">Photos</h2><p className="mt-1 text-sm text-[#77736c]">Upload lightweight web images. Click a photo to make it the collection cover.</p></div><button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">{uploading ? "Uploading…" : "Upload Photos"}</button><input ref={inputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files)} /></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{media.map(item => <button key={item.id} onClick={() => setCover(item.id)} className={`group relative overflow-hidden bg-[#ddd8cf] text-left ${collection.cover_media_id === item.id ? "ring-2 ring-[#171717]" : ""}`}><img src={item.path} alt={item.alt ?? item.filename ?? collection.title} className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /><span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white">{collection.cover_media_id === item.id ? "Cover" : "Set as cover"}</span></button>)}</div>{media.length === 0 && <div className="border border-dashed border-[#c9c4ba] p-16 text-center text-sm text-[#77736c]">No photos yet.</div>}</div></section>{message && <p className="mt-6 text-sm text-[#77736c]">{message}</p>}</div></main>;
}
