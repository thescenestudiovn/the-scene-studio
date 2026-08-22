"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };
type Collection = { id: string; title: string; slug: string; description: string | null; destination_id: string | null; client_name: string | null; event_date: string | null; seo_title: string | null; seo_description: string | null; published: number; cover_media_id: string | null; destination_name: string | null };
type Destination = { id: string; name: string };
type SelectionRect = { left: number; top: number; width: number; height: number };

export default function AdminCollectionEditor() {
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number; cardId: string | null } | null>(null);
  const marqueeBaseRef = useRef<Set<string>>(new Set());
  const [collection, setCollection] = useState<Collection | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [collectionsRes, destinationsRes] = await Promise.all([fetch("/api/admin/collections", { cache: "no-store" }), fetch("/api/admin/destinations", { cache: "no-store" })]);
    const collections = (await collectionsRes.json()) as { collections?: Collection[] };
    const destinations = (await destinationsRes.json()) as { destinations?: Destination[] };
    const found = (collections.collections ?? []).find(item => item.id === id) ?? null;
    setCollection(found); setDestinations(destinations.destinations ?? []);
    if (found) {
      const mediaRes = await fetch(`/api/admin/media?collection_id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const mediaData = (await mediaRes.json()) as { media?: Media[] };
      setMedia(mediaData.media ?? []); setSelected(new Set());
    }
  }
  useEffect(() => { load(); }, [id]);

  async function save() {
    if (!collection) return;
    setSaving(true); setMessage("");
    try {
      const collectionResponse = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(collection) });
      const collectionData = (await collectionResponse.json()) as { success: boolean; error?: string };
      if (!collectionResponse.ok || !collectionData.success) throw new Error(collectionData.error || "Could not save collection.");
      const orderResponse = await fetch("/api/admin/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: media.map((item, index) => ({ id: item.id, sort_order: index })) }) });
      const orderData = (await orderResponse.json()) as { success: boolean; error?: string };
      if (!orderResponse.ok || !orderData.success) throw new Error(orderData.error || "Could not save photo order.");
      setMessage("Saved."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setSaving(false); }
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
        const form = new FormData(); form.append("file", file); form.append("collection_id", collection.id); form.append("collection_slug", collection.slug); form.append("alt", file.name.replace(/\.[^/.]+$/, "")); form.append("width", String(dimensions.width)); form.append("height", String(dimensions.height));
        const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
        const data = (await response.json()) as { success: boolean; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || `Failed to upload ${file.name}`);
      }
      setMessage("Images uploaded to R2."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  function toggleSelected(mediaId: string) {
    setSelected(current => { const next = new Set(current); next.has(mediaId) ? next.delete(mediaId) : next.add(mediaId); return next; });
  }

  function selectAll() {
    setSelected(selected.size === media.length ? new Set() : new Set(media.map(item => item.id)));
  }

  function getCardId(target: EventTarget | null) {
    return target instanceof Element ? target.closest<HTMLElement>("[data-media-card]")?.dataset.mediaId ?? null : null;
  }

  function updateMarquee(x: number, y: number) {
    const start = pointerRef.current;
    if (!start) return;
    const left = Math.min(start.x, x); const top = Math.min(start.y, y);
    const right = Math.max(start.x, x); const bottom = Math.max(start.y, y);
    setSelectionRect({ left, top, width: right - left, height: bottom - top });
    const hit = new Set<string>();
    photosRef.current?.querySelectorAll<HTMLElement>("[data-media-card]").forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.right >= left && rect.left <= right && rect.bottom >= top && rect.top <= bottom) hit.add(card.dataset.mediaId!);
    });

    const next = new Set(marqueeBaseRef.current);
    hit.forEach(mediaId => {
      if (marqueeBaseRef.current.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
    });
    setSelected(next);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-drag-handle]")) return;
    const cardId = getCardId(event.target);
    pointerRef.current = { x: event.clientX, y: event.clientY, cardId };
    marqueeBaseRef.current = new Set(selected);
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelecting(false);
    setSelectionRect(null);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerRef.current;
    if (!start) return;
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (distance < 5 && !selecting) return;
    setSelecting(true);
    updateMarquee(event.clientX, event.clientY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerRef.current;
    if (!start) return;
    const wasSelecting = selecting;
    pointerRef.current = null;
    setSelecting(false);
    setSelectionRect(null);
    if (!wasSelecting && start.cardId) toggleSelected(start.cardId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function moveGroup(dragged: string, target: string) {
    if (dragged === target) return;
    setMedia(current => {
      const movingIds = selected.has(dragged) && selected.size > 1 ? new Set(selected) : new Set([dragged]);
      const moving = current.filter(item => movingIds.has(item.id));
      if (!moving.length) return current;
      const remaining = current.filter(item => !movingIds.has(item.id));
      const targetIndex = remaining.findIndex(item => item.id === target);
      if (targetIndex < 0) return current;
      remaining.splice(targetIndex, 0, ...moving);
      return remaining;
    });
  }

  async function setCover(mediaId: string) {
    if (!collection) return;
    const updated = { ...collection, cover_media_id: mediaId }; setCollection(updated);
    await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setMessage("Cover updated.");
  }

  async function deleteSelected() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} selected photo${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setDeleting(true); setMessage("");
    try {
      const ids = [...selected];
      const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Could not delete photos.");
      setMedia(current => current.filter(item => !selected.has(item.id)));
      if (collection && selected.has(collection.cover_media_id ?? "")) setCollection({ ...collection, cover_media_id: null });
      setSelected(new Set()); setMessage(`${ids.length} photo${ids.length > 1 ? "s" : ""} deleted.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete photos."); }
    finally { setDeleting(false); }
  }

  if (!collection) return <main className="p-10">Loading collection…</main>;

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-10 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl">
    <Link href="/admin/gallery" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Gallery</Link>
    <div className="mt-8 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Collection Editor</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">{collection.title}</h1><p className="mt-2 text-sm text-[#77736c]">/gallery/{collection.slug}</p></div><div className="flex gap-3"><a href={`/gallery/${collection.slug}`} target="_blank" rel="noreferrer" className="border border-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em]">View Gallery</a><button onClick={save} disabled={saving} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">{saving ? "Saving…" : "Save"}</button></div></div>
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]"><div className="border border-[#d8d3ca] bg-white p-6"><div className="grid gap-4">
      <label className="text-xs uppercase tracking-[0.12em]">Title<input className="mt-2 w-full border p-3" value={collection.title} onChange={e => setCollection({ ...collection, title: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">Slug<input className="mt-2 w-full border p-3" value={collection.slug} onChange={e => setCollection({ ...collection, slug: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">Client<input className="mt-2 w-full border p-3" value={collection.client_name ?? ""} onChange={e => setCollection({ ...collection, client_name: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">Destination<select className="mt-2 w-full border p-3" value={collection.destination_id ?? ""} onChange={e => setCollection({ ...collection, destination_id: e.target.value || null })}><option value="">None</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label className="text-xs uppercase tracking-[0.12em]">Event date<input type="date" className="mt-2 w-full border p-3" value={collection.event_date ?? ""} onChange={e => setCollection({ ...collection, event_date: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">Description<textarea className="mt-2 min-h-28 w-full border p-3" value={collection.description ?? ""} onChange={e => setCollection({ ...collection, description: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">SEO title<input className="mt-2 w-full border p-3" value={collection.seo_title ?? ""} onChange={e => setCollection({ ...collection, seo_title: e.target.value })} /></label>
      <label className="text-xs uppercase tracking-[0.12em]">SEO description<textarea className="mt-2 min-h-20 w-full border p-3" value={collection.seo_description ?? ""} onChange={e => setCollection({ ...collection, seo_description: e.target.value })} /></label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={collection.published === 1} onChange={e => setCollection({ ...collection, published: e.target.checked ? 1 : 0 })} /> Published</label>
    </div></div>
    <div><div className="mb-4 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-serif text-3xl">Photos</h2><p className="mt-1 text-sm text-[#77736c]">Click to select. Click again to deselect. Drag across photos to select a group. Use the drag handle to reorder.</p></div><div className="flex flex-wrap gap-2"><button onClick={selectAll} disabled={!media.length} className="border border-[#171717] px-4 py-3 text-xs uppercase tracking-[0.12em]">{selected.size === media.length && media.length ? "Deselect All" : "Select All"}</button>{selected.size > 0 && <button onClick={deleteSelected} disabled={deleting} className="border border-red-700 px-5 py-3 text-xs uppercase tracking-[0.15em] text-red-700">{deleting ? "Deleting…" : `Delete ${selected.size}`}</button>}<button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white">{uploading ? "Uploading…" : "Upload Photos"}</button></div><input ref={inputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files)} /></div>
      <div ref={photosRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="relative grid grid-cols-1 gap-3 select-none sm:grid-cols-2 lg:grid-cols-3">
        {media.map(item => <div key={item.id} data-media-card data-media-id={item.id} className={`group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#e8e5df] transition-shadow ${selected.has(item.id) ? "ring-2 ring-blue-500 bg-blue-500/5" : collection.cover_media_id === item.id ? "ring-2 ring-[#171717]" : ""}`}>
          <img draggable={false} src={item.path} alt={item.alt ?? item.filename ?? collection.title} className="block h-full w-full object-contain" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/65 px-3 py-2"><button onClick={() => setCover(item.id)} className="text-[10px] uppercase tracking-[0.12em] text-white">{collection.cover_media_id === item.id ? "Cover" : "Set cover"}</button><span data-drag-handle draggable onDragStart={() => setDraggedId(item.id)} onDragOver={e => e.preventDefault()} onDrop={() => { if (draggedId) moveGroup(draggedId, item.id); setDraggedId(null); }} className="cursor-grab rounded border border-white/40 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">↕ Drag</span></div>
        </div>)}
        {selectionRect && <div className="pointer-events-none fixed z-50 border border-blue-500 bg-blue-500/10" style={{ left: selectionRect.left, top: selectionRect.top, width: selectionRect.width, height: selectionRect.height }} />}
      </div>
      {media.length === 0 && <div className="border border-dashed border-[#c9c4ba] p-16 text-center text-sm text-[#77736c]">No photos yet.</div>}
    </div></section>{message && <p className="mt-6 text-sm text-[#77736c]">{message}</p>}</div></main>;
}
