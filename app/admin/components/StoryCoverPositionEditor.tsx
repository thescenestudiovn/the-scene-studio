"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; collection_id?: string | null; type?: string };
type Story = { id: string; title: string; cover_media_id?: string | null; cover_path?: string | null; cover_filename?: string | null };
type Point = { x: number; y: number };

export default function StoryCoverPositionEditor({ storyId, onChanged, compact = false }: { storyId: string; onChanged?: (story: Story) => void; compact?: boolean }) {
  const [story, setStory] = useState<Story | null>(null);
  const [cover, setCover] = useState<Media | null>(null);
  const [position, setPosition] = useState<Point>({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  async function load() {
    try {
      const [storyRes, positionRes] = await Promise.all([
        fetch(`/api/admin/stories/${encodeURIComponent(storyId)}`, { cache: "no-store" }),
        fetch(`/api/admin/story-cover?id=${encodeURIComponent(storyId)}`, { cache: "no-store" }),
      ]);
      const storyData = await storyRes.json() as { success?: boolean; story?: Story; error?: string };
      const positionData = await positionRes.json() as { position?: { position_x?: number; position_y?: number } };
      if (!storyRes.ok || !storyData.success || !storyData.story) throw new Error(storyData.error || "Failed to load story cover");
      const nextStory = storyData.story;
      setStory(nextStory);
      setCover(nextStory.cover_media_id && nextStory.cover_path ? { id: nextStory.cover_media_id, path: nextStory.cover_path, filename: nextStory.cover_filename ?? null, alt: null, width: null, height: null } : null);
      setPosition({ x: Number(positionData.position?.position_x ?? 50), y: Number(positionData.position?.position_y ?? 50) });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load cover");
    }
  }

  useEffect(() => { void load(); }, [storyId]);

  async function savePosition(next: Point, successMessage = "Cover focus saved.") {
    setPosition(next);
    try {
      const response = await fetch("/api/admin/story-cover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story_id: storyId, position_x: next.x, position_y: next.y }),
      });
      if (!response.ok) throw new Error("save failed");
      setMessage(successMessage);
      return true;
    } catch {
      setMessage("Focus changed but could not be saved.");
      return false;
    }
  }

  async function saveAndClose() {
    if (uploading || saving) return;
    setSaving(true);
    setMessage("");
    try {
      await savePosition(position);
      setOpen(false);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save cover.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("JPEG, PNG or WebP only."); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage("Maximum 5 MB."); return; }
    setUploading(true); setMessage("");
    try {
      const previousCoverId = cover?.id ?? null;
      const url = URL.createObjectURL(file);
      const image = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
        image.src = url;
      });
      const form = new FormData();
      form.append("file", file);
      form.append("alt", file.name.replace(/\.[^/.]+$/, ""));
      form.append("width", String(dimensions.width));
      form.append("height", String(dimensions.height));
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const data = await response.json() as { success?: boolean; error?: string; media?: Media };
      if (!response.ok || !data.success || !data.media) throw new Error(data.error || "Failed to upload cover");

      const saveResponse = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_media_id: data.media.id }),
      });
      const saveData = await saveResponse.json() as { success?: boolean; error?: string; story?: Story };
      if (!saveResponse.ok || !saveData.success || !saveData.story) throw new Error(saveData.error || "Failed to save cover");

      setStory(saveData.story);
      setCover(data.media);
      setPosition({ x: 50, y: 50 });
      await fetch("/api/admin/story-cover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story_id: storyId, position_x: 50, position_y: 50 }) });
      onChanged?.(saveData.story);

      if (previousCoverId && previousCoverId !== data.media.id) {
        const deleteResponse = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: previousCoverId }) });
        if (!deleteResponse.ok) console.error("Failed to remove previous story cover media", previousCoverId);
      }
      setMessage("Cover uploaded and saved. Click or drag the focus point to adjust the crop.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload cover");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function pointFromPointer(event: React.PointerEvent<HTMLDivElement>): Point | null {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)), y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)) };
  }

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!cover || event.button !== 0 || !frameRef.current) return;
    dragStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y };
    frameRef.current.setPointerCapture(event.pointerId);
    setDragging(true); setMessage("");
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current; const frame = frameRef.current;
    if (!start || !frame) return;
    const rect = frame.getBoundingClientRect();
    const dx = ((event.clientX - start.pointerX) / rect.width) * 100;
    const dy = ((event.clientY - start.pointerY) / rect.height) * 100;
    setPosition({ x: Math.max(0, Math.min(100, start.x + dx)), y: Math.max(0, Math.min(100, start.y + dy)) });
  }

  async function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current; dragStartRef.current = null; setDragging(false);
    if (frameRef.current?.hasPointerCapture(event.pointerId)) frameRef.current.releasePointerCapture(event.pointerId);
    if (!start) return;
    const moved = Math.hypot(event.clientX - start.pointerX, event.clientY - start.pointerY);
    const point = pointFromPointer(event); if (!point) return;
    await savePosition(moved < 5 ? point : position);
  }

  function reset() { void savePosition({ x: 50, y: 50 }, "Focus reset to center."); }

  return <>
    <div className="flex justify-end">
      <button type="button" onClick={() => { setOpen(true); setMessage(""); void load(); }} className="border border-[#171717] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.14em] transition hover:bg-[#171717] hover:text-white">{cover ? "Manage Cover" : "Add Cover"}</button>
    </div>
    {!compact && cover && <div className="mt-6 overflow-hidden border border-[#d8d3ca] bg-white">
      <div className="aspect-[2/1] w-full overflow-hidden bg-[#ddd8cf]"><img src={mediaUrl(cover.path)} alt={cover.alt ?? cover.filename ?? story?.title ?? "Story cover"} className="h-full w-full object-cover" style={{ objectPosition: `${position.x}% ${position.y}%` }} /></div>
      <div className="flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77736c]"><span>Story cover</span><span>{Math.round(position.x)}% · {Math.round(position.y)}%</span></div>
    </div>}
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 md:p-8" role="dialog" aria-modal="true" aria-label="Story cover editor">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-[#f7f5f0] p-5 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">Story Cover</p><h2 className="mt-2 font-serif text-3xl md:text-4xl">Cover image</h2><p className="mt-2 max-w-2xl text-sm text-[#77736c]">Upload a dedicated cover image, then click or drag to choose the focus point.</p></div><button type="button" onClick={saveAndClose} disabled={saving || uploading} className="shrink-0 border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving…" : "Save & Close"}</button></div>
        <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || saving} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-40">{uploading ? "Uploading…" : cover ? "Replace Cover" : "Upload Cover"}</button><button type="button" onClick={reset} disabled={!cover || uploading || saving} className="border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em] disabled:opacity-30">Reset Focus</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => upload(e.target.files?.[0] ?? null)} /></div>
        {cover ? <div ref={frameRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className={`relative mx-auto mt-6 max-h-[60vh] w-full overflow-hidden bg-[#ddd8cf] touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-crosshair"}`}><img src={mediaUrl(cover.path)} alt={cover.alt ?? cover.filename ?? "Story cover preview"} draggable={false} className="block max-h-[60vh] w-full select-none object-contain"/><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10"/><div className="pointer-events-none absolute" style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}><div className="h-7 w-7 rounded-full border-2 border-white bg-black/20 shadow-[0_0_0_1px_rgba(0,0,0,0.45)] md:h-8 md:w-8"/></div><div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white"><span>{dragging ? "Move focus point" : "Click or drag to set focus"}</span><span>{Math.round(position.x)}% · {Math.round(position.y)}%</span></div></div> : <div className="mt-6 flex min-h-64 w-full items-center justify-center border border-dashed border-[#d8d3ca] bg-white text-sm text-[#77736c]">No cover selected — upload an image from your computer.</div>}
        {message && <p className="mt-3 text-xs text-[#666158]">{message}</p>}
      </div>
    </div>}
  </>;
}
