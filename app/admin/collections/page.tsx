"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Collection = { id: string; title: string; slug: string; destination_name?: string | null; media_count?: number; published?: number; cover_path?: string | null };
type GalleryPage = { id: string; slug: string; title: string; seo_title: string | null; seo_description: string | null; eyebrow: string; description: string };
type CollectionsResponse = { collections?: Collection[]; galleryPage?: GalleryPage | null };

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [galleryPage, setGalleryPage] = useState<GalleryPage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savingPage, setSavingPage] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/collections", { cache: "no-store" });
    const data = await response.json() as CollectionsResponse;
    setItems(data.collections ?? []);
    setGalleryPage(data.galleryPage ?? null);
  }

  async function saveGalleryPage() {
    if (!galleryPage) return;
    setSavingPage(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryPage }),
      });
      const data = await response.json() as { success: boolean; error?: string; galleryPage?: GalleryPage };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save Gallery page");
      if (data.galleryPage) setGalleryPage(data.galleryPage);
      setMessage("Gallery page content saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save Gallery page");
    } finally {
      setSavingPage(false);
    }
  }

  async function deleteCollection(id: string, title: string) {
    if (!window.confirm(`Delete collection “${title}”? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete collection");
      await load();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to delete collection");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => { load(); }, []);

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-6"><div className="min-w-0 flex-1"><label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Gallery Page — Eyebrow</span><input value={galleryPage?.eyebrow ?? ""} onChange={e=>galleryPage&&setGalleryPage({...galleryPage,eyebrow:e.target.value})} className="w-full max-w-md border-0 border-b border-[#d8d3ca] bg-transparent px-0 py-1 text-xs uppercase tracking-[0.2em] text-[#77736c] outline-none" placeholder="Collections" /></label><label className="mt-3 block"><span className="sr-only">Gallery page title</span><input value={galleryPage?.title ?? ""} onChange={e=>galleryPage&&setGalleryPage({...galleryPage,title:e.target.value})} className="w-full border-0 bg-transparent px-0 py-0 font-serif text-5xl tracking-[-0.04em] outline-none placeholder:text-[#b7b1a7]" placeholder="Gallery" /></label><label className="mt-3 block max-w-xl"><span className="sr-only">Gallery page introduction</span><textarea value={galleryPage?.description ?? ""} onChange={e=>galleryPage&&setGalleryPage({...galleryPage,description:e.target.value})} rows={3} className="w-full resize-y border-0 bg-transparent px-0 py-0 text-sm leading-6 text-[#77736c] outline-none placeholder:text-[#b7b1a7]" placeholder="Describe the gallery and its collections…" /></label><div className="mt-4 flex items-center gap-3"><button type="button" onClick={saveGalleryPage} disabled={!galleryPage||savingPage} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-40">{savingPage ? "Saving…" : "Save Gallery Content"}</button>{message && <span className="text-xs text-[#666158]">{message}</span>}</div></div><Link href="/admin/gallery/new" className="shrink-0 bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.15em] text-white">+ New Collection</Link></div>

  {galleryPage && <section className="mt-10 border border-[#d8d3ca] bg-white p-6 md:p-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Gallery Page</p><h2 className="mt-2 font-serif text-3xl">Hero & SEO Content</h2><p className="mt-2 text-sm text-[#77736c]">This content appears on the public Gallery page and is also used for its SEO metadata.</p></div><button type="button" onClick={saveGalleryPage} disabled={savingPage} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-40">{savingPage ? "Saving…" : "Save Gallery Content"}</button></div><div className="mt-7 grid gap-5 md:grid-cols-2"><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Eyebrow</span><input value={galleryPage.eyebrow} onChange={e=>setGalleryPage({...galleryPage,eyebrow:e.target.value})} className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none" placeholder="Collections"/></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Page Title</span><input value={galleryPage.title} onChange={e=>setGalleryPage({...galleryPage,title:e.target.value})} className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none" placeholder="Gallery"/></label><label className="md:col-span-2"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Introduction</span><textarea value={galleryPage.description} onChange={e=>setGalleryPage({...galleryPage,description:e.target.value})} rows={4} className="w-full resize-y border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm leading-6 outline-none" placeholder="Describe the gallery and its collections…"/></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">SEO Title</span><input value={galleryPage.seo_title??""} onChange={e=>setGalleryPage({...galleryPage,seo_title:e.target.value})} className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none" placeholder="Gallery — The Scene Studio"/></label><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">SEO Description</span><input value={galleryPage.seo_description??""} onChange={e=>setGalleryPage({...galleryPage,seo_description:e.target.value})} className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none" placeholder="SEO description"/></label></div></section>}

  <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="group border border-[#d8d3ca] bg-white p-4"><Link href={`/admin/gallery/${item.id}`}><div className="aspect-[4/3] overflow-hidden bg-[#ddd8cf]">{item.cover_path && <img src={item.cover_path} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />}</div><div className="flex items-start justify-between gap-4 pt-5"><div><h2 className="font-serif text-2xl">{item.title}</h2><p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#77736c]">{item.destination_name ?? "No destination"}</p></div><span className="text-xs text-[#77736c]">{item.media_count ?? 0} photos</span></div></Link><div className="mt-5 flex items-center justify-between border-t border-[#eee9e1] pt-4"><span className="text-[11px] uppercase tracking-[0.12em] text-[#77736c]">{item.published ? "Published" : "Draft"}</span><button type="button" onClick={() => deleteCollection(item.id, item.title)} disabled={deleting === item.id} className="text-[11px] uppercase tracking-[0.12em] text-red-700 disabled:opacity-40">{deleting === item.id ? "Deleting…" : "Delete"}</button></div></article>)}{items.length === 0 && <p className="text-sm text-[#77736c]">No collections yet.</p>}</section></div></main>;
}
