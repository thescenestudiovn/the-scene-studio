"use client";

import { useEffect, useMemo, useState } from "react";

type Story = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  date: string | null;
  category: string | null;
  published: number;
  destination_name: string | null;
};

type ResponseData = { success: boolean; stories: Story[]; error?: string };

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/stories", { cache: "no-store" });
        const data = (await response.json()) as ResponseData;
        if (!response.ok || !data.success) throw new Error(data.error || `Failed to load stories (${response.status})`);
        setStories(data.stories || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stories");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stories.filter((story) => {
      if (filter === "published" && !story.published) return false;
      if (filter === "draft" && story.published) return false;
      if (!q) return true;
      return `${story.title} ${story.slug} ${story.location || ""} ${story.category || ""} ${story.destination_name || ""}`.toLowerCase().includes(q);
    });
  }, [stories, search, filter]);

  const published = stories.filter((story) => Boolean(story.published)).length;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6">
          <div>
            <a href="/admin" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45 hover:opacity-100">← Admin</a>
            <h1 className="mt-2 font-serif text-4xl tracking-[-0.045em] md:text-5xl">Stories</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-sans text-[9px] uppercase tracking-[0.18em] opacity-40 md:inline">{stories.length} stories · {published} published</span>
            <a href="/admin/stories/new" className="bg-[#171717] px-5 py-3 font-sans text-[9px] uppercase tracking-[0.2em] text-white hover:opacity-80">+ New Story</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-black/10 bg-white/40 p-5"><p className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">All stories</p><p className="mt-4 font-serif text-4xl">{stories.length}</p></div>
          <div className="border border-black/10 bg-white/40 p-5"><p className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">Published</p><p className="mt-4 font-serif text-4xl">{published}</p></div>
          <div className="border border-black/10 bg-white/40 p-5"><p className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">Drafts</p><p className="mt-4 font-serif text-4xl">{stories.length - published}</p></div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-y border-black/10 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-5">
            {(["all", "published", "draft"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`font-sans text-[9px] uppercase tracking-[0.18em] ${filter === item ? "underline underline-offset-4" : "opacity-40 hover:opacity-100"}`}>{item}</button>)}
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories…" className="w-full border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.12em] outline-none md:w-80" />
        </div>

        {error && <div className="mt-5 border-l-2 border-red-700 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em] text-red-700">{error}</div>}

        {loading ? <div className="py-28 text-center font-sans text-[10px] uppercase tracking-[0.2em] opacity-40">Loading stories…</div> : filtered.length === 0 ? <div className="border border-dashed border-black/15 py-28 text-center font-serif text-3xl opacity-35">No stories found.</div> : (
          <div className="mt-7 overflow-hidden border border-black/10 bg-white/30">
            {filtered.map((story, index) => (
              <a key={story.id} href={`/admin/stories/${story.id}`} className="group grid gap-4 border-b border-black/10 p-5 transition last:border-b-0 hover:bg-white md:grid-cols-[56px_minmax(0,1fr)_190px_150px] md:items-center md:p-6">
                <span className="font-sans text-[9px] tracking-[0.18em] opacity-25">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0"><h2 className="truncate font-serif text-2xl tracking-[-0.03em] group-hover:underline">{story.title}</h2><p className="mt-2 truncate font-sans text-[9px] uppercase tracking-[0.16em] opacity-40">{story.location || "No location"} · {story.category || "Story"}</p></div>
                <div className="hidden md:block"><p className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-35">Destination</p><p className="mt-2 font-serif text-lg">{story.destination_name || "—"}</p></div>
                <div className="flex items-center justify-between md:block md:text-right"><span className={`inline-flex rounded-full px-2.5 py-1 font-sans text-[8px] uppercase tracking-[0.16em] ${story.published ? "bg-[#263a2d] text-white" : "bg-black/8 text-black/50"}`}>{story.published ? "Published" : "Draft"}</span><p className="mt-2 hidden font-sans text-[8px] uppercase tracking-[0.16em] opacity-30 md:block">Edit →</p></div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
