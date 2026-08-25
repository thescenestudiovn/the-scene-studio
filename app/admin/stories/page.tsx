"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Story = {
  id: string; slug: string; title: string; location: string | null; date: string | null;
  category: string | null; categories?: string | null; description: string | null;
  published: number; destination_name: string | null; cover_image?: string | null;
  cover_path?: string | null; block_count?: number; image_count?: number;
};
type Destination = { id: string; name: string };

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [dests, setDests] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [destination, setDestination] = useState("all");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const [a, b] = await Promise.all([
      fetch("/api/admin/stories", { cache: "no-store" }),
      fetch("/api/admin/destinations", { cache: "no-store" }),
    ]);
    const x = await a.json() as { stories?: Story[] };
    const y = await b.json() as { destinations?: Destination[] };
    setStories(x.stories ?? []);
    setDests(y.destinations ?? []);
  }

  useEffect(() => { void load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(stories.flatMap(s => (s.categories || s.category || "").split(",").map(v => v.trim()).filter(Boolean)))),
    [stories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stories.filter(s => {
      const cats = (s.categories || s.category || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
      const hay = [s.title, s.description, s.location, s.destination_name, s.categories, s.category].filter(Boolean).join(" ").toLowerCase();
      return (!q || hay.includes(q)) && (category === "all" || cats.includes(category.toLowerCase())) && (destination === "all" || s.destination_name === destination);
    });
  }, [stories, search, category, destination]);

  async function deleteStory(story: Story) {
    if (!window.confirm(`Delete “${story.title}”? This will permanently remove the story and its blocks.`)) return;
    setDeleting(story.id); setMessage("");
    try {
      const r = await fetch("/api/admin/stories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: story.id }) });
      const d = await r.json() as { success: boolean; error?: string };
      if (!r.ok || !d.success) { setMessage(d.error || "Could not delete story."); return; }
      setStories(v => v.filter(x => x.id !== story.id));
      setMessage("Story deleted.");
    } catch { setMessage("Could not delete story."); }
    finally { setDeleting(null); }
  }

  const cover = (s: Story) => s.cover_image || (s.cover_path ? mediaUrl(s.cover_path) : null);
  const cats = (s: Story) => (s.categories || s.category || "").split(",").map(v => v.trim()).filter(Boolean);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const meta = (story: Story) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-[#77736c]">
      <span>{cats(story).join(" · ") || "Story"}</span>
      {(story.destination_name || story.location) && <><span>·</span><span>{story.destination_name || story.location}</span></>}
      {story.date && <><span>·</span><span>{story.date}</span></>}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#171717] md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-[11px] uppercase tracking-[0.18em] text-[#77736c] hover:text-[#171717]">← Admin</Link>

        <header className="mt-10 flex flex-col justify-between gap-6 border-b border-[#d8d3ca] pb-8 md:flex-row md:items-end">
          <div><p className="text-[11px] uppercase tracking-[0.24em] text-[#77736c]">Editorial</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] md:text-6xl">Stories</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#77736c]">Manage the journal of The Scene Studio — stories, essays and visual narratives.</p></div>
          <Link href="/admin/stories/new" className="inline-flex w-fit items-center gap-3 bg-[#171717] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:opacity-80"><span className="text-base leading-none">+</span> New Story</Link>
        </header>

        <section className="mt-8 border-y border-[#d8d3ca] py-5"><div className="grid gap-2 md:grid-cols-[1fr_190px_190px]"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories, locations, descriptions..." className="h-11 border border-[#d8d3ca] bg-white px-4 text-sm outline-none focus:border-[#171717]"/><select value={category} onChange={e => setCategory(e.target.value)} className="h-11 border border-[#d8d3ca] bg-white px-3 text-sm outline-none"><option value="all">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><select value={destination} onChange={e => setDestination(e.target.value)} className="h-11 border border-[#d8d3ca] bg-white px-3 text-sm outline-none"><option value="all">All destinations</option>{dests.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div></section>

        {message && <p className="py-4 text-sm text-[#77736c]">{message}</p>}

        {featured && (
          <section className="mt-9">
            <Link href={`/admin/stories/${featured.id}`} className="group relative block overflow-hidden bg-[#e9e5de]">
              <div className="aspect-[2.05/1] min-h-[430px] w-full">{cover(featured) ? <img src={cover(featured)!} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.015]"/> : <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[#9a968e]">No cover image</div>}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
              <div className="absolute inset-x-0 bottom-0 px-7 pb-8 text-white md:px-10 md:pb-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-white/75"><span>{cats(featured).join(" · ") || "Story"}</span>{(featured.destination_name || featured.location) && <><span>·</span><span>{featured.destination_name || featured.location}</span></>}{featured.date && <><span>·</span><span>{featured.date}</span></>}</div>
                <h2 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.03] tracking-[-0.02em] md:text-6xl">{featured.title}</h2>
                {featured.description && <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base md:leading-7 line-clamp-3">{featured.description}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.15em] text-white/65"><span>{featured.published ? "Published" : "Draft"}</span><span>·</span><span>{featured.block_count ?? 0} {(featured.block_count ?? 0) === 1 ? "block" : "blocks"}</span><span>·</span><span>{featured.image_count ?? 0} {(featured.image_count ?? 0) === 1 ? "image" : "images"}</span></div>
              </div>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between border-b border-[#d8d3ca] pb-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">More Stories</p><p className="mt-1 font-serif text-2xl">The Journal</p></div><span className="text-[10px] uppercase tracking-[0.15em] text-[#9a968e]">{rest.length} stories</span></div>
            <div className="grid gap-x-7 gap-y-14 md:grid-cols-2">
              {rest.map(story => (
                <article key={story.id} className="group">
                  <Link href={`/admin/stories/${story.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e5de]">{cover(story) ? <img src={cover(story)!} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/> : <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[#9a968e]">No cover image</div>}<span className="absolute left-3 top-3 bg-white/95 px-2 py-1 text-[9px] uppercase tracking-[0.14em]">{story.published ? "Published" : "Draft"}</span></div>
                    <div className="pt-5">{meta(story)}<h2 className="mt-3 font-serif text-3xl leading-[1.08] tracking-[-0.015em]">{story.title}</h2>{story.description && <p className="mt-3 max-w-xl text-sm leading-6 text-[#69645d] line-clamp-3">{story.description}</p>}<div className="mt-5 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-[#99958e]"><span>{story.block_count ?? 0} {(story.block_count ?? 0) === 1 ? "block" : "blocks"}</span><span>·</span><span>{story.image_count ?? 0} {(story.image_count ?? 0) === 1 ? "image" : "images"}</span><span className="ml-1 h-3 w-px bg-[#d0cbc2]"/><span className="text-[#171717]">Edit Story →</span></div></div>
                  </Link>
                  <button onClick={() => void deleteStory(story)} disabled={deleting === story.id} className="mt-2 text-[9px] uppercase tracking-[0.14em] text-red-700 hover:underline disabled:opacity-40">{deleting === story.id ? "Deleting…" : "Delete"}</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && <div className="border-b border-[#d8d3ca] py-24 text-center"><p className="font-serif text-3xl">No stories found.</p><p className="mt-3 text-sm text-[#77736c]">Try another search or create a new story.</p></div>}
        <div className="mt-10 flex items-center justify-between border-t border-[#d8d3ca] pt-5 text-[10px] uppercase tracking-[0.16em] text-[#8a857d]"><span>{filtered.length} {filtered.length === 1 ? "story" : "stories"}</span><span>Journal / Editorial</span></div>
      </div>
    </main>
  );
}
