"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

export default function CoverPositionEditor({ collectionId }: { collectionId: string }) {
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const startRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const response = await fetch(`/api/admin/collections`, { cache: "no-store" });
      const data = await response.json() as { collections?: Array<{ id: string; cover_path?: string | null }> };
      const collection = (data.collections ?? []).find(item => item.id === collectionId);
      setCoverPath(collection?.cover_path ?? null);

      const positionResponse = await fetch(`/api/admin/collection-cover?id=${encodeURIComponent(collectionId)}`, { cache: "no-store" });
      if (positionResponse.ok) {
        const positionData = await positionResponse.json() as { position?: { position_x?: number; position_y?: number } };
        setPosition({ x: Number(positionData.position?.position_x ?? 50), y: Number(positionData.position?.position_y ?? 50) });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load cover");
    }
  }

  useEffect(() => { load(); }, [collectionId]);

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!coverPath || event.button !== 0 || !frameRef.current) return;
    startRef.current = { x: position.x, y: position.y, px: event.clientX, py: event.clientY };
    frameRef.current.setPointerCapture(event.pointerId);
    setDragging(true); setMessage("");
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = startRef.current; const frame = frameRef.current;
    if (!start || !frame) return;
    const rect = frame.getBoundingClientRect();
    setPosition({
      x: Math.max(0, Math.min(100, start.x + ((event.clientX - start.px) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, start.y + ((event.clientY - start.py) / rect.height) * 100)),
    });
  }

  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    startRef.current = null; setDragging(false);
    if (frameRef.current?.hasPointerCapture(event.pointerId)) frameRef.current.releasePointerCapture(event.pointerId);
  }

  function reset() { setPosition({ x: 50, y: 50 }); setMessage("Position reset. Save to apply it."); }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/collection-cover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection_id: collectionId, position_x: position.x, position_y: position.y }) });
      const data = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save cover position");
      setMessage("Cover position saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to save cover position"); }
    finally { setSaving(false); }
  }

  if (!coverPath) return <section className="mt-8 border border-dashed border-[#d8d3ca] bg-white p-6"><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">Cover Position</p><p className="mt-2 text-sm text-[#77736c]">Set a cover photo first, then you can drag its crop here.</p></section>;

  return <section className="mt-8 border border-[#d8d3ca] bg-white p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-[#77736c]">Cover Position</p><h2 className="mt-2 font-serif text-3xl">Adjust the crop</h2><p className="mt-2 text-sm text-[#77736c]">Drag the image inside the 16:7 frame. This exact position is used on the public Gallery page.</p></div><div className="flex gap-2"><button type="button" onClick={reset} className="border border-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Reset</button><button type="button" onClick={save} disabled={saving} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save Position"}</button></div></div>
    <div ref={frameRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className={`relative mt-6 aspect-[16/7] overflow-hidden bg-[#ddd8cf] touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}>
      <img src={mediaUrl(coverPath)} alt="Collection cover preview" draggable={false} className="h-full w-full select-none object-cover" style={{ objectPosition: `${position.x}% ${position.y}%` }} />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white"><span>{dragging ? "Drag to position" : "Drag image to crop"}</span><span>{Math.round(position.x)}% · {Math.round(position.y)}%</span></div>
    </div>
    {message && <p className="mt-3 text-xs text-[#666158]">{message}</p>}
  </section>;
}
