"use client";

import { useEffect, useState } from "react";

type Story = { id: string; title: string; published: number };
type Collection = { id: string; title: string };

type StoriesResponse = { stories?: Story[]; error?: string };
type CollectionsResponse = { collections?: Collection[]; error?: string };

export default function AdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storiesRes, collectionsRes] = await Promise.all([
          fetch("/api/admin/stories", { cache: "no-store" }),
          fetch("/api/admin/collections", { cache: "no-store" }),
        ]);
        const storiesData = (await storiesRes.json()) as StoriesResponse;
        const collectionsData = (await collectionsRes.json()) as CollectionsResponse;
        setStories(storiesData.stories ?? []);
        setCollections(collectionsData.collections ?? []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const published = stories.filter((story) => Boolean(story.published)).length;
  const items = [
    { href: "/admin/collections", label: "Collections", description: "Create collections and upload photos to NAS", count: loading ? "—" : collections.length },
    { href: "/admin/stories", label: "Stories", description: "Create and manage editorial stories", count: loading ? "—" : stories.length },
    { href: "/admin/stories/new", label: "New Story", description: "Start a story with the block editor", count: "+" },
    { href: "/admin/media", label: "Media Library", description: "Browse all media registered in D1", count: "→" },
  ];

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
    <header className="border-b border-black/10 px-5 py-6 md:px-8 md:py-7"><div className="mx-auto flex max-w-[1500px] items-end justify-between gap-6"><div><p className="font-sans text-[9px] uppercase tracking-[.3em] opacity-40">The Scene Studio</p><h1 className="mt-2 font-serif text-5xl tracking-[-.05em] md:text-6xl">Admin</h1></div><a href="/" className="font-sans text-[9px] uppercase tracking-[.2em] opacity-45">View website →</a></div></header>
    <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12"><div className="grid gap-3 md:grid-cols-3"><div className="border border-black/10 bg-white/40 p-6"><p className="font-sans text-[9px] uppercase tracking-[.2em] opacity-40">Collections</p><p className="mt-5 font-serif text-5xl">{loading ? "—" : collections.length}</p></div><div className="border border-black/10 bg-white/40 p-6"><p className="font-sans text-[9px] uppercase tracking-[.2em] opacity-40">Stories</p><p className="mt-5 font-serif text-5xl">{loading ? "—" : stories.length}</p></div><div className="border border-black/10 bg-white/40 p-6"><p className="font-sans text-[9px] uppercase tracking-[.2em] opacity-40">Published</p><p className="mt-5 font-serif text-5xl">{loading ? "—" : published}</p></div></div>
      <div className="mt-10 border-y border-black/10">{items.map((item) => <a key={item.href} href={item.href} className="group grid gap-4 border-b border-black/10 px-5 py-7 last:border-b-0 transition hover:bg-white md:grid-cols-[1fr_260px_80px] md:items-center md:px-6"><div><h2 className="font-serif text-3xl tracking-[-.035em] group-hover:underline">{item.label}</h2><p className="mt-2 font-sans text-[9px] uppercase tracking-[.16em] opacity-40">{item.description}</p></div><span className="hidden font-sans text-[9px] uppercase tracking-[.18em] opacity-35 md:block">Open →</span><span className="font-serif text-2xl md:text-right">{item.count}</span></a>)}</div>
    </section>
  </main>;
}
