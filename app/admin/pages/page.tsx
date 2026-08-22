"use client";

import { useEffect, useState } from "react";

type Page = { id: string; title: string; slug: string; page_type: string; seo_title?: string | null; seo_description?: string | null };
type Block = { id: string; type: string; data: Record<string, unknown> };
type PagesResponse = { pages?: Page[] };
type PageBlocksResponse = { blocks?: Array<{ id: string; type: string; data: string | Record<string, unknown> }> };
const BLOCKS = ["text", "image", "content", "links", "blog", "video", "contact", "social", "others", "flex"];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/admin/pages", { cache: "no-store" });
    const data: PagesResponse = await response.json();
    setPages(data.pages ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openPage(item: Page) {
    setPage(item);
    const response = await fetch(`/api/pages/${item.slug}`, { cache: "no-store" });
    const data: PageBlocksResponse = await response.json();
    setBlocks((data.blocks ?? []).map(b => ({ ...b, data: typeof b.data === "string" ? JSON.parse(b.data) as Record<string, unknown> : b.data })));
  }

  function addBlock(type: string) { setBlocks(prev => [...prev, { id: crypto.randomUUID(), type, data: {} }]); }
  function move(index: number, direction: -1 | 1) {
    const next = [...blocks]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; setBlocks(next);
  }
  function remove(id: string) { setBlocks(prev => prev.filter(b => b.id !== id)); }

  async function save() {
    if (!page) return;
    await fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id, title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks }) });
    alert("Saved");
  }

  if (loading) return <main style={{ padding: 48 }}>Loading…</main>;
  if (!page) return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <a href="/admin" style={{ color: "#777", fontSize: 12 }}>← Admin</a>
      <h1 style={{ marginTop: 24, fontSize: 40, fontWeight: 500 }}>Pages</h1>
      <p style={{ color: "#777" }}>Home and About use the same block system as Stories.</p>
      <div style={{ marginTop: 32, display: "grid", gap: 12 }}>{pages.map(item => <button key={item.id} onClick={() => openPage(item)} style={{ textAlign: "left", padding: 24, border: "1px solid #e5e5e5", background: "#fff" }}><strong>{item.title}</strong><div style={{ color: "#777", fontSize: 12, marginTop: 5 }}>/{item.slug}</div></button>)}</div>
    </main>
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={() => setPage(null)} style={{ color: "#777", fontSize: 12 }}>← Pages</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 24 }}><div><h1 style={{ fontSize: 40, fontWeight: 500 }}>{page.title}</h1><p style={{ color: "#777" }}>/{page.slug}</p></div><button onClick={save} style={{ padding: "10px 18px", background: "#171717", color: "#fff" }}>Save</button></div>
      <section style={{ marginTop: 40 }}><h2 style={{ fontSize: 18, fontWeight: 500 }}>Add Block</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{BLOCKS.map(type => <button key={type} onClick={() => addBlock(type)} style={{ padding: "8px 12px", border: "1px solid #ddd", background: "#fff" }}>{type}</button>)}</div></section>
      <section style={{ marginTop: 32, display: "grid", gap: 12 }}>{blocks.map((block, index) => <div key={block.id} style={{ border: "1px solid #ddd", background: "#fff", padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong>{block.type}</strong><div><button onClick={() => move(index, -1)}>↑</button> <button onClick={() => move(index, 1)}>↓</button> <button onClick={() => remove(block.id)}>×</button></div></div><p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>Block content editor will use this block's structured data.</p></div>)}</section>
    </main>
  );
}
