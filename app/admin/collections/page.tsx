"use client";

import { useEffect, useState } from "react";

interface Collection { id: string; title: string; slug: string; description?: string | null; destination_name?: string | null; }
interface Destination { id: string; name: string; }

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState({ title: "", slug: "", description: "", destination_id: "" });

  async function load() {
    const [collections, destinations] = await Promise.all([
      fetch("/api/admin/collections", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/admin/destinations", { cache: "no-store" }).then(r => r.json()),
    ]);
    setItems(collections.collections ?? []);
    setDestinations(destinations.destinations ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.title || !form.slug) return;
    await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, destination_id: form.destination_id || null }) });
    setForm({ title: "", slug: "", description: "", destination_id: "" });
    await load();
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <a href="/admin" style={{ color: "#777", fontSize: 12 }}>← Admin</a>
      <h1 style={{ marginTop: 24, fontSize: 40, fontWeight: 500 }}>Collections</h1>
      <p style={{ color: "#777", marginTop: 8 }}>One collection represents one client gallery.</p>
      <section style={{ marginTop: 40, padding: 24, border: "1px solid #e5e5e5", background: "#fff" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>New collection</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginTop: 16 }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          <select value={form.destination_id} onChange={e => setForm({ ...form, destination_id: e.target.value })}><option value="">No destination</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", marginTop: 12, minHeight: 80 }} />
        <button onClick={create} style={{ marginTop: 16, padding: "10px 18px", background: "#171717", color: "#fff" }}>Create collection</button>
      </section>
      <section style={{ marginTop: 32 }}>{items.length === 0 ? <p style={{ color: "#777" }}>No collections yet.</p> : items.map(item => <div key={item.id} style={{ padding: "20px 0", borderBottom: "1px solid #e5e5e5" }}><strong>{item.title}</strong><div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>{item.destination_name ?? "No destination"} · /gallery/{item.slug}</div></div>)}</section>
    </main>
  );
}
