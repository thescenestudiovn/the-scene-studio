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
  // Use the same-origin proxy. The NAS sends CORP: same-origin, so direct
  // browser requests to media.thescenestudio.asia are blocked by the browser.
  return `/api/media?path=${encodeURIComponent(value)}`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/media", { cache: "no-store" });
        const data = (await response.json()) as ResponseData;
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Failed to load media (${response.status})`);
        }
        setMedia(data.media || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return media;
    return media.filter((item) =>
      `${item.filename || ""} ${item.path} ${item.alt || ""} ${item.collection_title || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [media, search]);

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6">
          <div>
            <a href="/admin" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45 hover:opacity-100">← Admin</a>
            <h1 className="mt-2 font-serif text-4xl tracking-[-0.045em] md:text-5xl">Media</h1>
          </div>
          <span className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-40">{media.length} assets</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-4 border-y border-black/10 py-4 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-40">Image Library</p>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media…" className="w-full border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.12em] outline-none md:w-80" />
        </div>

        {error && <div className="mt-5 border-l-2 border-red-700 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em] text-red-700">{error}</div>}

        {loading ? (
          <div className="py-28 text-center font-sans text-[10px] uppercase tracking-[0.2em] opacity-40">Loading media…</div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-black/15 py-28 text-center font-serif text-3xl opacity-35">No media found.</div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((item) => {
              const src = mediaUrl(item.path);
              return (
                <article key={item.id} className="overflow-hidden border border-black/10 bg-white/50">
                  <div className="relative aspect-square bg-black/5">
                    {src ? (
                      <img
                        src={src}
                        alt={item.alt || item.filename || ""}
                        className="block h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sans text-[9px] uppercase tracking-[0.12em] opacity-30">No image path</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate font-sans text-[9px] uppercase tracking-[0.08em]">{item.filename || item.path}</p>
                    <p className="mt-1 truncate font-sans text-[8px] opacity-40">{item.path}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
