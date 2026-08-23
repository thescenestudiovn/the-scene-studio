"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; type?: string; collection_id?: string | null };
type Collection = { id: string; cover_media_id?: string | null };

export default function CoverPositionEditor({ collectionId }: { collectionId: string }) {
  const [cover, setCover] = useState<Media | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
      setCover(allMedia.find(item => item.id === collection?.cover_media_id) ?? null);
      setPosition({ x: Number(positionData.position?.position_x ?? 50), y: Number(positionData.position?.position_y ?? 50) });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to load cover"); }
  }

  useEffect(() => { load(); }, [collectionId]);

  async function upload(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("JPEG, PNG or WebP only."); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage("Maximum 5 MB."); return; }
    setUploading(true); setMessage("");
    try {
      const previousCoverId = cover?.id ?? null;
      const url = URL.createObjectURL(file); const image = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => { image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); }; image.src = url; });
      const form = new FormData();
      form.append("file", file); form.append("alt", file.name.replace(/\.[^/.]+$/, "")); form.append("width", String(dimensions.width)); form.append("height", String(dimensions.height));
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const data = await response.json() as { success?: boolean; error?: string; media?: Media };
      if (!response.ok || !data.success || !data.media) throw new Error(data.error || "Failed to upload cover");
      setCover(data.media);
      setPosition({ x: 50, y: 50 });

      const collectionsRes = await fetch("/api/admin/collections", { cache: "no-store" });
      const collectionsData = await collectionsRes.json() as { collections?: Array<Record<string, unknown>> };
      const collection = (collectionsData.collections ?? []).find(item => item.id === collectionId);
      if (!collection) throw new Error("Collection not found");
      const saveResponse = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...collection, cover_media_id: data.media.id }) });
      const saveData = await saveResponse.json() as { success?: boolean; error?: string };
      if (!saveResponse.ok || !saveData.success) throw new Error(saveData.error || "Failed to save cover");

      if (previousCoverId && previousCoverId !== data.media.id) {
        const deleteResponse = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: previousCoverId }) });
        if (!deleteResponse.ok) console.error("Failed to remove previous collection cover media", previousCoverId);
      }

      setMessage("Cover uploaded and saved. Previous cover removed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to upload cover"); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

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
  async function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    startRef.current = null; setDragging(false);
    if (frameRef.current?.hasPointerCapture(event.pointerId)) frameRef.current.releasePointerCapture(event.pointerId);
    try {
      const response = await fetch("/api/admin/collection-cover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection_id: collectionId, position_x: position.x, position_y: position.y }) });
      if (!response.ok) throw new Error("save failed");
      setMessage("Cover position saved.");
    } catch { setMessage("Cover position changed but could not be saved."); }
  }
  function reset() { setPosition({ x: 50, y: 50 }); setMessage("Position reset. Drag is saved automatically."); }

  return <section className="border border-[#d8d3ca] bg-white p-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">Collection Cover</p><h2 className="mt-2 font-serif text-3xl">Cover image</h2><p className="mt-2 max-w-2xl text-sm text-[#77736c]">Upload a dedicated cover directly from your computer. It is independent from the collection album. The same cover is used on the public Gallery grid and collection page.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-40">{uploading ? "Uploading…" : cover ? "Replace Cover" : "Upload Cover"}</button><button type="button" onClick={reset} disabled={!cover} className="border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em] disabled:opacity-30">Reset</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => upload(e.target.files?.[0] ?? null)} /></div>
    </div>
    {cover ? <div ref={frameRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className={`relative mt-6 aspect-[16/7] overflow-hidden bg-[#ddd8cf] touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}><img src={mediaUrl(cover.path)} alt={cover.alt ?? cover.filename ?? "Collection cover preview"} draggable={false} className="h-full w-full select-none object-cover" style={{ objectPosition: `${position.x}% ${position.y}%` }} /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" /><div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white"><span>{dragging ? "Drag to position" : "Drag image to crop"}</span><span>{Math.round(position.x)}% · {Math.round(position.y)}%</span></div></div> : <div className="mt-6 flex aspect-[16/7] items-center justify-center border border-dashed border-[#d8d3ca] bg-[#faf8f4] text-sm text-[#77736c]">No cover selected — upload an image from your computer.</div>}
    {message && <p className="mt-3 text-xs text-[#666158]">{message}</p>}
  </section>;
}
