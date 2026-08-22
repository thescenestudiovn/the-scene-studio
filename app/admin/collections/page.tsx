"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Collection = { id: string; title: string; slug: string; destination_name?: string | null; media_count?: number; published?: number; cover_path?: string | null };
type CollectionsResponse = { collections?: Collection[] };

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  async function load() { const response = await fetch("/api/admin/collections", { cache: "no-store" }); const data = await response.json() as CollectionsResponse; setItems(data.collections ?? []); }
  useEffect(() => { load(); }, []);
  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Gallery</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Collections</h1><p className="mt-3 max-w-xl text-sm text-[#77736c]">One collection represents one client gallery. Photos are managed inside each collection and can be reused by Stories.</p></div><Link href="/admin/gallery/new" className="bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.15em] text-white">+ New Collection</Link></div><section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="group border border-[#d8d3ca] bg-white p-4"><Link href={`/admin/gallery/${item.id}`}><div className="aspect-[4/3] overflow-hidden bg-[#ddd8cf]">{item.cover_path && <img src={item.cover_path} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />}</div><div className="flex items-start justify-between gap-4 pt-5"><div><h2 className="font-serif text-2xl">{item.title}</h2><p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#77736c]">{item.destination_name ?? "No destination"}</p></div><span className="text-xs text-[#77736c]">{item.media_count ?? 0} photos</span></div></Link></article>)}{items.length === 0 && <p className="text-sm text-[#77736c]">No collections yet.</p>}</section></div></main>;
}
