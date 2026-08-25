"use client";

import Link from "next/link";
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
  cover_image?: string | null;
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
    const [storiesResponse, destinationsResponse] = await Promise.all([
      fetch("/api/admin/stories", { cache: "no-store" }),
      fetch("/api/admin/destinations", { cache: "no-store" }),
    ]);
    const storyData = (await storiesResponse.json()) as { stories?: Story[] };
    const destinationData = (await destinationsResponse.json()) as { destinations?: Destination[] };
    setStories(storyData.stories ?? []);
    setDests(destinationData.destinations ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(stories.map((story) => story.category).filter(Boolean))) as string[],
    [stories]
  );

  const featured = stories[0];

  const filteredStories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stories.filter((story) => {
      const matchesSearch = !query || [story.title, story.location, story.category, story.destination_name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
      const matchesCategory = category === "all" || story.category === category;
      const matchesDestination = destination === "all" || story.destination_name === destination;
      return matchesSearch && matchesCategory && matchesDestination;
    });
  }, [stories, search, category, destination]);

  async function deleteStory(story: Story) {
    if (!window.confirm(`Delete “${story.title}”? This will permanently remove the story and its blocks.`)) return;
    setDeleting(story.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/stories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: story.id }),
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        setMessage(data.error || "Could not delete story.");
        return;
      }
      setStories((current) => current.filter((item) => item.id !== story.id));
      setMessage("Story deleted.");
    } catch {
      setMessage("Could not delete story.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#171717] md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-[11px] uppercase tracking-[0.18em] text-[#77736c] hover:text-[#171717]">
          ← Admin
        </Link>

        <header className="mt-10 flex flex-col justify-between gap-6 border-b border-[#d8d3ca] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#77736c]">Editorial</p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] md:text-6xl">Stories</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#77736c]">
              A curated collection of weddings, destinations and stories from The Scene Studio.
            </p>
          </div>
          <Link
            href="/admin/stories/new"
            className="inline-flex w-fit items-center gap-3 bg-[#171717] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80"
          >
            <span className="text-base leading-none">+</span> New Story
          </Link>
        </header>

        {featured && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#77736c]">Featured Story</p>
              <span className={`text-[10px] uppercase tracking-[0.14em] ${featured.published ? "text-green-700" : "text-[#77736c]"}`}>
                {featured.published ? "Published" : "Draft"}
              </span>
            </div>
            <Link href={`/admin/stories/${featured.id}`} className="group block overflow-hidden bg-white">
              <div className="relative aspect-[2.1/1] overflow-hidden bg-[#e9e5de]">
                {featured.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[#9a968e]">No cover image</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-6 pt-20 text-white md:px-10 md:pb-10">
                  <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">{featured.category || "Story"}</p>
                  <h2 className="mt-2 max-w-3xl font-serif text-3xl md:text-5xl">{featured.title}</h2>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] opacity-80">{featured.destination_name || featured.location || "The Scene Studio"}</p>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="mt-14">
          <div className="flex flex-col gap-4 border-y border-[#d8d3ca] py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#77736c]">All Stories</p>
              <p className="mt-1 text-xs text-[#99958e]">{filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[680px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stories..."
                className="h-10 border border-[#d8d3ca] bg-white px-3 text-sm outline-none placeholder:text-[#aaa59c] focus:border-[#171717]"
              />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 border border-[#d8d3ca] bg-white px-3 text-sm outline-none">
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={destination} onChange={(event) => setDestination(event.target.value)} className="h-10 border border-[#d8d3ca] bg-white px-3 text-sm outline-none">
                <option value="all">All destinations</option>
                {dests.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </div>
          </div>

          {message && <p className="py-3 text-sm text-[#77736c]">{message}</p>}

          <div className="mt-8 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <article key={story.id} className="group">
                <Link href={`/admin/stories/${story.id}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e5de]">
                    {story.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[#9a968e]">No cover image</div>
                    )}
                    <div className="absolute left-3 top-3 bg-white/95 px-2 py-1 text-[9px] uppercase tracking-[0.14em]">
                      {story.published ? "Published" : "Draft"}
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{story.category || "Story"}</p>
                    <h2 className="mt-2 font-serif text-2xl leading-tight">{story.title}</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[#99958e]">{story.destination_name || story.location || "—"}{story.date ? ` · ${story.date}` : ""}</p>
                  </div>
                </Link>
                <div className="mt-3 flex gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                  <Link href={`/admin/stories/${story.id}`} className="border border-[#d8d3ca] px-3 py-2 text-[10px] uppercase tracking-[0.12em] hover:bg-white">Edit</Link>
                  <button onClick={() => deleteStory(story)} disabled={deleting === story.id} className="border border-[#e2cfcf] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-red-700 hover:bg-white disabled:opacity-40">
                    {deleting === story.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredStories.length === 0 && (
            <div className="border-b border-[#d8d3ca] py-20 text-center">
              <p className="font-serif text-2xl">No stories found.</p>
              <p className="mt-2 text-sm text-[#77736c]">Try another search or create a new story.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
