"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Collection = { id: string; title: string; slug: string; description: string | null; destination_name: string | null; destination_country: string | null };
type Media = { id: string; collection_id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number; type: string };
type CollectionsResponse = { success?: boolean; collections?: Collection[]; error?: string };
type MediaResponse = { success?: boolean; media?: Media[]; error?: string };
type UploadResponse = { success?: boolean; media?: Media[]; error?: string };
type DeleteResponse = { success?: boolean; error?: string };

const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

function imageUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${MEDIA_BASE_URL}${cleanPath}`;
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [collectionsResponse, mediaResponse] = await Promise.all([
      fetch("/api/admin/collections", { cache: "no-store" }),
      fetch("/api/admin/media", { cache: "no-store" }),
    ]);
    const collections = (await collectionsResponse.json()) as CollectionsResponse;
    const mediaData = (await mediaResponse.json()) as MediaResponse;

    if (!collectionsResponse.ok || !collections.success) throw new Error(collections.error || "Failed to load collections");
    if (!mediaResponse.ok || !mediaData.success) throw new Error(mediaData.error || "Failed to load media");

    const found = (collections.collections ?? []).find((item) => item.id === id);
    if (!found) throw new Error("Collection not found");

    setCollection(found);
    setMedia((mediaData.media ?? []).filter((item) => item.collection_id === id));
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load collection"));
  }, [id]);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files || []));
  }

  async function upload() {
    if (!files.length) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const form = new FormData();
      form.set("collection_id", id);
      files.forEach((file) => form.append("files", file, file.name));

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: form,
      });

      const data = (await response.json()) as UploadResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Upload failed");

      setFiles([]);
      setMessage(`${(data.media ?? []).length} image(s) uploaded`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(mediaId: string) {
    if (!window.confirm("Remove this image from the collection?")) return;

    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: mediaId }),
    });
    const data = (await response.json()) as DeleteResponse;

    if (!response.ok || !data.success) {
      setError(data.error || "Failed to remove image");
      return;
    }

    setMedia((items) => items.filter((item) => item.id !== mediaId));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? media.filter((item) => `${item.filename || ""} ${item.alt || ""}`.toLowerCase().includes(q))
      : media;
  }, [media, query]);

  if (!collection && !error) {
    return <main className="min-h-screen bg-[#f7f5f0] p-10 text-[10px] uppercase tracking-[.2em] opacity-40">Loading collection…</main>;
  }

  if (!collection) {
    return <main className="min-h-screen bg-[#f7f5f0] p-10"><p className="text-red-700">{error}</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-5 backdrop-blur md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <a href="/admin/collections" className="font-sans text-[9px] uppercase tracking-[.28em] opacity-45">← Collections</a>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-5xl tracking-[-.05em]">{collection.title}</h1>
              <p className="mt-2 font-sans text-[9px] uppercase tracking-[.16em] opacity-40">
                {collection.destination_name || "No destination"}
                {collection.destination_country ? ` — ${collection.destination_country}` : ""}
              </p>
            </div>
            <span className="font-sans text-[9px] uppercase tracking-[.18em] opacity-40">{media.length} images</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12">
        <div className="border border-dashed border-black/15 bg-white/30 p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-3xl">Upload images</h2>
              <p className="mt-2 max-w-xl text-sm opacity-50">Choose multiple images at once. Files are uploaded to the NAS and registered in this collection.</p>
            </div>
            <label className="cursor-pointer border border-black/20 px-5 py-3 text-center font-sans text-[9px] uppercase tracking-[.18em] hover:bg-white">
              Choose images
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={choose} className="hidden" />
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="font-sans text-[9px] uppercase tracking-[.16em] opacity-40">{files.length} selected</p>
              <div className="mt-3 grid max-h-40 gap-2 overflow-auto">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex justify-between text-xs">
                    <span className="truncate">{file.name}</span>
                    <span className="ml-4 opacity-40">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
              <button onClick={() => void upload()} disabled={busy} className="mt-5 bg-[#171717] px-6 py-3 text-[9px] uppercase tracking-[.18em] text-white disabled:opacity-40">
                {busy ? "Uploading…" : "Upload to NAS"}
              </button>
            </div>
          )}
        </div>

        {(message || error) && (
          <p className={`mt-4 text-[10px] uppercase tracking-[.12em] ${error ? "text-red-700" : "opacity-50"}`}>
            {error || message}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-4 border-y border-black/10 py-4 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[9px] uppercase tracking-[.18em] opacity-40">Media in collection</p>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search images…" className="w-full border-b border-black/15 bg-transparent py-2 text-[10px] uppercase tracking-[.12em] outline-none md:w-80" />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 border border-dashed border-black/10 py-20 text-center text-[10px] uppercase tracking-[.18em] opacity-35">No images in this collection</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((item) => (
              <article key={item.id} className="group overflow-hidden border border-black/10 bg-white/40">
                <div className="relative aspect-[4/3] bg-black/5">
                  <img src={imageUrl(item.path)} alt={item.alt || item.filename || ""} className="h-full w-full object-cover" loading="lazy" />
                  <button onClick={() => void removeMedia(item.id)} className="absolute right-2 top-2 bg-white/90 px-2 py-1 text-[8px] uppercase tracking-[.12em] opacity-0 transition group-hover:opacity-100">Remove</button>
                </div>
                <div className="p-3"><p className="truncate text-[9px] uppercase tracking-[.08em]">{item.filename || item.path}</p></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
