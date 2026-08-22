"use client";

import { useEffect, useState } from "react";

interface Destination { id: string; name: string; slug: string; country: string; country_name: string; region?: string | null; }
interface DestinationsResponse { destinations?: Destination[] }

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", country: "vn", country_name: "Vietnam", region: "" });

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/destinations", { cache: "no-store" });
    const data: DestinationsResponse = await response.json();
    setItems(data.destinations ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.name || !form.slug) return;
    await fetch("/api/admin/destinations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", slug: "", country: "vn", country_name: "Vietnam", region: "" });
    await load();
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <a href="/admin" style={{ color: "#777", fontSize: 12 }}>← Admin</a>
      <h1 style={{ marginTop: 24, fontSize: 40, fontWeight: 500 }}>Destinations</h1>
      <p style={{ color: "#777", marginTop: 8 }}>Shared SEO taxonomy for Collections and Stories.</p>

      <section style={{ marginTop: 40, padding: 24, border: "1px solid #e5e5e5", background: "#fff" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>New destination</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", gap: 12, marginTop: 16 }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          <input placeholder="Country code" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          <input placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
        </div>
        <button onClick={create} style={{ marginTop: 16, padding: "10px 18px", background: "#171717", color: "#fff" }}>Create</button>
      </section>

      <section style={{ marginTop: 32 }}>
        {loading ? <p>Loading…</p> : items.length === 0 ? <p style={{ color: "#777" }}>No destinations yet.</p> : items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid #e5e5e5" }}>
            <div><strong>{item.name}</strong><div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>{item.country_name} · /{item.slug}</div></div>
            <span style={{ color: "#999", fontSize: 12 }}>{item.region ?? ""}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
