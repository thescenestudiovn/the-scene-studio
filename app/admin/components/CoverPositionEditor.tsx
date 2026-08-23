"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Media = { id: string; collection_id?: string | null; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; type?: string; collection_title?: string | null };

type Collection = { id: string; cover_media_id?: string | null };

export default function CoverPositionEditor({ collectionId }: { collectionId: string }) {
  const [cover, setCover] = useState<Media | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const startRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const [collectionsRes, mediaRes, positionRes] = await Promise.all([
        fetch("/api/admin/collections", { cache: "no-store" }),
        fetch("/api/admin/media", { cache: "no-store" }),
        fetch(`/api/admin/collection-cover?id=${encodeURIComponent(collectionId)}`, { cache: "no-store" }),
      ]);
      const collectionsData = await collectionsRes.json() as { collections?: Collection[] };
      const mediaData = await mediaRes.json() as { media?: Media[] };
      const positionData = await positionRes.json() as { position?: { position_x?: number; position_y?: number } };
      const collection = (collectionsData.collections ?? []).find(item => item.id === collectionId);
      const allMedia = (mediaData.media ?? []).filter(item => item.type !== "video");
      setMedia(allMedia);
      setCover(allMedia.find(item => item.id === collection?.cover_media_id) ?? null);
      setPosition({ x: Number(positionData.position?.position_x ?? 50), y: Number(positionData.position?.position_y ?? 50) });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to load cover"); }
  }

  useEffect(() => { load(); }, [collectionId]);

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!cover || event.button !== 0 || !frameRef.current) return;
    startRef.current = { x: position.x, y: position.y, px: event.clientX, py: event.clientY };
    frameRef.current.setPointerCapture(event.pointerId); setDragging(true); setMessage("");
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = startRef.current; const frame = frameRef.current;
    if (!start || !frame) return;
    const rect = frame.getBoundingClientRect();
    setPosition({ x: Math.max(0, Math.min(100, start.x + ((event.clientX - start.px) / rect.width) * 100)), y: Math.max(0, Math.min(100, start.y + ((event.clientY - start.py) / rect.height) * 100)) });
  }

  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    startRef.current = null; setDragging(false);
    if (frameRef.current?.hasPointerCapture(event.pointerId)) frameRef.current.releasePointerCapture(event.pointerId);
  }

  function chooseCover(item: Media) { setCover(item); setPickerOpen(false); setMessage("New cover selected. Save to apply it."); }
  function reset() { setPosition({ x: 50, y: 50 }); setMessage("Position reset. Save to apply it."); }

  async function save() {
    if (!cover) { setMessage("Choose a cover image first."); return; }
    setSaving(true); setMessage("");
    try {
      const collectionRes = await fetch("/api/admin/collections", { cache: "no-store" });
      const collectionData = await collectionRes.json() as { collections?: Array<Record<string, unknown>> };
      const collection = (collectionData.collections ?? []).find(item => item.id === collectionId);
      if (!collection) throw new Error("Collection not found");
      const updateResponse = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...collection, cover_media_id: cover.id }) });
      const updateData = await updateResponse.json() as { success?: boolean; error?: string };
      if (!updateResponse.ok || !updateData.success) throw new Error(updateData.error || "Failed to save cover");
      const positionResponse = await fetch("/api/admin/collection-cover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection_id: collectionId, position_x: position.x, position_y: position.y }) });
      const positionData = await positionResponse.json() as { success?: boolean; error?: string };
      if (!positionResponse.ok || !positionData.success) throw new Error(positionData.error || "Failed to save cover position");
      setMessage("Cover saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to save cover"); }
    finally { setSaving(false); }
  }

  return <section className="border border-[#d8d3ca] bg-white p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">Collection Cover</p><h2 className="mt-2 font-serif text-3xl">Cover image</h2><p className="mt-2 max-w-2xl text-sm text-[#77736c]">Choose any image from the media library — it does not have to belong to this collection — then drag it inside the 16:7 frame to set the crop.</p></div><div className="flex gap-2"><button type="button" onClick={() => setPickerOpen(v => !v)} className="border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">{pickerOpen ? "Close Library" : "Choose Image"}</button><button type="button" onClick={reset} className="border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Reset</button><button type="button" onClick={save} disabled={saving || !cover} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save Cover"}</button></div></div>
    {pickerOpen && <div className="mt-6 border-t border-[#eee9e1] pt-6"><div className="mb-4 flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">Media Library</p><p className="text-xs text-[#77736c]">{media.length} images</p></div><div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">{media.map(item => <button key={item.id} type="button" onClick={() => chooseCover(item)} className={`group relative overflow-hidden bg-[#ddd8cf] ${cover?.id === item.id ? "ring-2 ring-[#171717]" : ""}`}><div className="aspect-[4/3]"><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename ?? "Media"} className="h-full w-full object-cover" /></div><span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-2 text-left text-[9px] text-white opacity-0 transition group-hover:opacity-100">{item.filename ?? item.collection_title ?? "Image"}</span></button>)}</div></div>}
    {cover ? <div ref={frameRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className={`relative mt-6 aspect-[16/7] overflow-hidden bg-[#ddd8cf] touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}><img src={mediaUrl(cover.path)} alt={cover.alt ?? cover.filename ?? "Collection cover preview"} draggable={false} className="h-full w-full select-none object-cover" style={{ objectPosition: `${position.x}% ${position.y}%` }} /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" /><div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white"><span>{dragging ? "Drag to position" : "Drag image to crop"}</span><span>{Math.round(position.x)}% · {Math.round(position.y)}%</span></div></div> : <div className="mt-6 flex aspect-[16/7] items-center justify-center border border-dashed border-[#d8d3ca] bg-[#faf8f4] text-sm text-[#77736c]">No cover selected — choose an image from the Media Library.</div>}
    {message && <p className="mt-3 text-xs text-[#666158]">{message}</p>}
  </section>;
}
