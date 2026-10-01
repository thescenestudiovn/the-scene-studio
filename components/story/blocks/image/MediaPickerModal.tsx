"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media } from "../../editor/types";

type Collection = { id: string; title: string };
type Props = {
  open: boolean;
  required: number;
  selectedIds: string[];
  collectionId: string;
  onClose: () => void;
  onDone: (collectionId: string, mediaIds: string[], selectedMedia: Media[]) => void;
};

type UploadResponse = { success?: boolean; error?: string; media?: Media };

export default function MediaPickerModal({ open, required, selectedIds, collectionId, onClose, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [activeCollection, setActiveCollection] = useState(collectionId);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMedia() {
    const response = await fetch("/api/admin/media", { cache: "no-store" });
    const result = await response.json() as { media?: Media[] };
    const nextMedia = Array.isArray(result.media) ? result.media : [];
    setMedia(nextMedia);
    return nextMedia;
  }

  useEffect(() => {
    if (!open) return;
    setSelected(selectedIds);
    setActiveCollection(collectionId);
    setMessage("");
    setLoading(true);
    Promise.all([
      fetch("/api/admin/media", { cache: "no-store" }).then(response => response.json() as Promise<{ media?: Media[] }>),
      fetch("/api/admin/collections", { cache: "no-store" }).then(response => response.json() as Promise<{ collections?: Collection[] }>),
    ])
      .then(([mediaResult, collectionResult]) => {
        setMedia(Array.isArray(mediaResult.media) ? mediaResult.media : []);
        setCollections(Array.isArray(collectionResult.collections) ? collectionResult.collections : []);
      })
      .catch(() => { setMedia([]); setCollections([]); })
      .finally(() => setLoading(false));
  }, [open, selectedIds, collectionId]);

  const visibleMedia = useMemo(
    () => activeCollection ? media.filter(item => item.collection_id === activeCollection) : media,
    [activeCollection, media],
  );

  if (!open) return null;

  const toggle = (id: string) => {
    if (required === 1) {
      setSelected([id]);
      return;
    }
    setSelected(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      if (current.length >= required) return current;
      return [...current, id];
    });
  };

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setMessage("");
    try {
      const uploaded: Media[] = [];
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error(`${file.name}: JPEG, PNG or WebP only`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: maximum 5 MB`);
        }

        const url = URL.createObjectURL(file);
        const image = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
          };
          image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Could not read ${file.name}`));
          };
          image.src = url;
        });

        const form = new FormData();
        form.append("file", file);
        if (activeCollection) form.append("collection_id", activeCollection);
        form.append("alt", file.name.replace(/\.[^/.]+$/, ""));
        form.append("width", String(dimensions.width));
        form.append("height", String(dimensions.height));

        const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
        const data = await response.json() as UploadResponse;
        if (!response.ok || !data.success || !data.media) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        uploaded.push(data.media);
      }

      const nextMedia = await loadMedia();
      const available = uploaded.map(item => item.id);
      setSelected(current => {
        const next = [...current];
        for (const id of available) {
          if (next.length >= required) break;
          if (!next.includes(id)) next.push(id);
        }
        return next;
      });
      // Keep the uploaded records available to Done even before React commits the state update.
      setMedia(current => {
        const ids = new Set(current.map(item => item.id));
        return [...current, ...uploaded.filter(item => !ids.has(item.id))].length >= nextMedia.length
          ? [...current, ...uploaded.filter(item => !ids.has(item.id))]
          : nextMedia;
      });
      setMessage(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded and added to Media Library.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const done = () => {
    const ids = selected.slice(0, required);
    const selectedMedia = ids.map(id => media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
    onDone(activeCollection, ids, selectedMedia);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#ebe7e0] px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#8a857d]">Add image</p>
            <h2 className="mt-1 font-serif text-2xl text-[#171717]">Choose image{required > 1 ? "s" : ""}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#77736c] hover:bg-[#f5f2ed]">×</button>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-[#ebe7e0] p-5">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex min-h-20 flex-col items-center justify-center border border-[#d8d3ca] bg-[#faf9f6] px-4 text-center hover:bg-[#f5f2ed] disabled:opacity-50">
            <span className="text-xl">↑</span>
            <span className="mt-1 text-[10px] uppercase tracking-[.14em]">Upload from computer</span>
            <span className="mt-1 text-[10px] text-[#8a857d]">JPEG, PNG, WebP · max 5 MB</span>
          </button>
          <button type="button" onClick={() => document.getElementById("media-library-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="flex min-h-20 flex-col items-center justify-center border border-[#d8d3ca] px-4 text-center hover:bg-[#f5f2ed]">
            <span className="text-xl">▦</span>
            <span className="mt-1 text-[10px] uppercase tracking-[.14em]">Choose from Gallery</span>
            <span className="mt-1 text-[10px] text-[#8a857d]">Use an existing image</span>
          </button>
          <input ref={inputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => void upload(event.target.files)} />
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#ebe7e0] px-6 py-3">
          <button type="button" onClick={() => setActiveCollection("")} className={`rounded-full px-3 py-1.5 text-xs ${!activeCollection ? "bg-[#171717] text-white" : "bg-[#f5f2ed] text-[#625e57]"}`}>All media</button>
          {collections.map(collection => (
            <button key={collection.id} type="button" onClick={() => setActiveCollection(collection.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${activeCollection === collection.id ? "bg-[#171717] text-white" : "bg-[#f5f2ed] text-[#625e57]"}`}>
              {collection.title}
            </button>
          ))}
        </div>

        <div id="media-library-grid" className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading || uploading ? (
            <div className="flex h-48 items-center justify-center text-sm text-[#99938b]">{uploading ? "Uploading…" : "Loading media…"}</div>
          ) : visibleMedia.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {visibleMedia.map(item => {
                const isSelected = selected.includes(item.id);
                return (
                  <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`group relative overflow-hidden rounded-lg border bg-[#f3f0eb] ${isSelected ? "border-[#171717] ring-2 ring-[#171717]/15" : "border-[#e5dfd7]"}`}>
                    <img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="aspect-square h-auto w-full object-cover" />
                    <span className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs ${isSelected ? "bg-[#171717] text-white" : "bg-white/85 text-[#77736c]"}`}>{isSelected ? "✓" : ""}</span>
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-2 py-1.5 text-left text-[10px] text-white">{item.filename}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#ddd6cd] text-sm text-[#99938b]">No media found.</div>
          )}
          {message && <p className="mt-4 text-xs text-[#77736c]">{message}</p>}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#ebe7e0] px-6 py-4">
          <p className="text-xs text-[#77736c]">{selected.length} selected</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-xs text-[#77736c] hover:bg-[#f5f2ed]">Cancel</button>
            <button type="button" disabled={!selected.length || uploading} onClick={done} className="rounded-full bg-[#171717] px-6 py-2.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
