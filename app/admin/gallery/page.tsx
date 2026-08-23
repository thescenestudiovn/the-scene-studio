"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Collection = {
  id: string;
  title: string;
  slug: string;
  destination_name?: string | null;
  media_count?: number;
  published?: number;
  cover_path?: string | null;
  cover_position_x?: number;
  cover_position_y?: number;
};

type GalleryPage = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  eyebrow: string;
  description: string;
};

type CollectionsResponse = { collections?: Collection[]; galleryPage?: GalleryPage | null };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [galleryPage, setGalleryPage] = useState<GalleryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/collections", { cache: "no-store" });
      const data = (await response.json()) as CollectionsResponse;
      setItems(data.collections ?? []);
      setGalleryPage(data.galleryPage ?? null);
    } catch {
      setMessage("Failed to load Gallery content.");
    } finally {
      setLoading(false);
    }
  }

  async function saveGalleryPage() {
    if (!galleryPage || savingPage) return;
    setSavingPage(true); setMessage("");
    try {
      const response = await fetch("/api/admin/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ galleryPage }) });
      const data = (await response.json()) as { success?: boolean; error?: string; galleryPage?: GalleryPage };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save Gallery content");
      if (data.galleryPage) setGalleryPage(data.galleryPage);
      setMessage("Gallery content saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to save Gallery content"); }
    finally { setSavingPage(false); }
  }

  async function deleteCollection(id: string, title: string) {
    if (!window.confirm(`Delete collection “${title}”? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete collection");
      await load();
    } catch (error) { window.alert(error instanceof Error ? error.message : "Failed to delete collection"); }
    finally { setDeleting(null); }
  }

  function updatePage<K extends keyof GalleryPage>(field: K, value: GalleryPage[K]) {
    setGalleryPage(current => current ? { ...current, [field]: value } : current);
  }

  useEffect(() => { void load(); }, []);

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col gap-8 border-b border-[#d8d3ca] pb-10 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Gallery</p><h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] md:text-6xl">Collections</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#77736c]">Manage your client galleries and the editorial content shown above them.</p></div><Link href="/admin/gallery/new" className="inline-flex shrink-0 items-center justify-center bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-white">+ New Collection</Link></header>
    <section className="mt-10 border border-[#d8d3ca] bg-white p-6 md:p-8"><div className="flex flex-col gap-5 border-b border-[#eee9e1] pb-7 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Gallery Page</p><h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Hero & SEO Content</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#77736c]">Edit the content displayed on the public Gallery page. These fields are also used for SEO.</p></div><div className="flex items-center gap-3">{message && <span className="text-xs text-[#666158]">{message}</span>}<button type="button" onClick={saveGalleryPage} disabled={!galleryPage || savingPage} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40">{savingPage ? "Saving…" : "Save Gallery Content"}</button></div></div>
      {loading ? <div className="py-10 text-sm text-[#77736c]">Loading Gallery content…</div> : galleryPage ? <div className="mt-7 grid gap-6 md:grid-cols-2"><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Eyebrow</span><input type="text" value={galleryPage.eyebrow} onChange={e => updatePage("eyebrow", e.target.value)} className="block w-full border border-[#cfc9bf] bg-[#faf8f4] px-4 py-3 text-sm text-[#171717] outline-none focus:border-[#171717]" /></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Page Title</span><input type="text" value={galleryPage.title} onChange={e => updatePage("title", e.target.value)} className="block w-full border border-[#cfc9bf] bg-[#faf8f4] px-4 py-3 text-sm text-[#171717] outline-none focus:border-[#171717]" /></label><label className="md:col-span-2"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Introduction</span><textarea value={galleryPage.description} onChange={e => updatePage("description", e.target.value)} rows={5} className="block w-full resize-y border border-[#cfc9bf] bg-[#faf8f4] px-4 py-3 text-sm leading-6 text-[#171717] outline-none focus:border-[#171717]" /></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">SEO Title</span><input type="text" value={galleryPage.seo_title ?? ""} onChange={e => updatePage("seo_title", e.target.value)} className="block w-full border border-[#cfc9bf] bg-[#faf8f4] px-4 py-3 text-sm text-[#171717] outline-none focus:border-[#171717]" /></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">SEO Description</span><textarea value={galleryPage.seo_description ?? ""} onChange={e => updatePage("seo_description", e.target.value)} rows={3} className="block w-full resize-y border border-[#cfc9bf] bg-[#faf8f4] px-4 py-3 text-sm leading-6 text-[#171717] outline-none focus:border-[#171717]" /></label></div> : <div className="py-10 text-sm text-red-700">Gallery page data could not be loaded.</div>}
    </section>
    <section className="mt-12"><div className="flex items-end justify-between gap-6 border-b border-[#d8d3ca] pb-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Client Galleries</p><h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Collections</h2></div><span className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{items.length} {items.length === 1 ? "collection" : "collections"}</span></div>
      {items.length === 0 ? <div className="border-b border-[#d8d3ca] py-10 text-sm text-[#77736c]">No collections yet.</div> : <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">{items.map(item => { const x = Number(item.cover_position_x ?? 50); const y = Number(item.cover_position_y ?? 50); const cover = item.cover_path ? mediaUrl(item.cover_path) : null; return <article key={item.id} className="group min-w-0"><Link href={`/admin/gallery/${item.id}`} className="block"><div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf]">{cover ? <img src={cover} alt={item.title} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]" style={{ objectPosition: `${x}% ${y}%` }} /> : <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">No cover image</div>}</div><div className="pt-4 text-center"><h3 className="font-serif text-2xl tracking-[-0.02em]">{item.title}</h3><p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#77736c]">{item.destination_name ?? "No destination"}</p></div><p className="mt-2 text-right text-[10px] text-[#77736c]">{item.media_count ?? 0} photos</p></Link><div className="mt-4 flex items-center justify-between border-t border-[#eee9e1] pt-3"><span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">{item.published ? "Published" : "Draft"}</span><button type="button" onClick={() => deleteCollection(item.id, item.title)} disabled={deleting === item.id} className="text-[10px] uppercase tracking-[0.14em] text-red-700 disabled:opacity-40">{deleting === item.id ? "Deleting…" : "Delete"}</button></div></article>; })}</div>}
    </section>
  </div></main>;
}
