"use client";

import { useEffect, useMemo, useState } from "react";

type Media = {
  id: string;
  path: string;
  filename: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  type: string;
  collection_title: string | null;
};
type ResponseData = { success: boolean; media: Media[]; error?: string };

function mediaUrl(path: string) {
  const value = (path || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `/api/media?path=${encodeURIComponent(value)}`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/media", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as ResponseData;
        if (!response.ok || !data.success) throw new Error(data.error || `Failed to load media (${response.status})`);
        setMedia(data.media || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load media"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return media;
    return media.filter((item) => `${item.filename || ""} ${item.path} ${item.alt || ""} ${item.collection_title || ""}`.toLowerCase().includes(q));
  }, [media, search]);

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-5 backdrop-blur md:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><div><a href="/admin" className="font-sans text-[9px] uppercase tracking-[.28em] opacity-45">← Admin</a><h1 className="mt-2 font-serif text-4xl tracking-[-.045em] md:text-5xl">Media Library</h1></div><a href="/admin/collections" className="border border-black/15 px-4 py-2 font-sans text-[9px] uppercase tracking-[.18em]">Collections →</a></div></header><section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12"><div className="flex flex-col gap-4 border-y border-black/10 py-4 md:flex-row md:items-center md:justify-between"><p className="font-sans text-[9px] uppercase tracking-[.18em] opacity-40">{media.length} assets</p><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media…" className="w-full border-b border-black/15 bg-transparent py-2 text-[10px] uppercase tracking-[.12em] outline-none md:w-80" /></div>{error && <p className="mt-5 text-[10px] uppercase tracking-[.12em] text-red-700">{error}</p>}{loading ? <div className="py-28 text-center text-[10px] uppercase tracking-[.2em] opacity-40">Loading media…</div> : filtered.length === 0 ? <div className="mt-7 border border-dashed border-black/15 py-28 text-center font-serif text-3xl opacity-35">No media found.</div> : <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{filtered.map((item) => <article key={item.id} className="overflow-hidden border border-black/10 bg-white/50"><div className="aspect-square bg-black/5"><img src={mediaUrl(item.path)} alt={item.alt || item.filename || ""} className="block h-full w-full object-cover" loading="lazy" decoding="async"/></div><div className="p-3"><p className="truncate text-[9px] uppercase tracking-[.08em]">{item.filename || item.path}</p><p className="mt-1 truncate text-[8px] opacity-40">{item.collection_title || "Unassigned"}</p></div></article>)}</div>}</section></main>;
}
