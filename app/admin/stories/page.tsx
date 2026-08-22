"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

type StoriesResponse = {
  success: boolean;
  stories: Story[];
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      try {
        const res = await fetch("/api/admin/stories", { cache: "no-store" });
        const data = (await res.json()) as StoriesResponse;
        if (data.success) setStories(data.stories);
      } catch (error) {
        console.error("Failed to load stories:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, []);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 28px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 36 }}>
        <div>
          <p style={eyebrow}>Content</p>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 500, letterSpacing: -1 }}>Stories</h1>
          <p style={{ margin: "10px 0 0", color: "#777" }}>Manage your published stories and galleries.</p>
        </div>
        <Link href="/" target="_blank" style={secondaryButton}>View website ↗</Link>
      </div>

      {loading ? (
        <div style={emptyState}>Loading stories...</div>
      ) : stories.length === 0 ? (
        <div style={emptyState}>No stories found.</div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 2fr) 1fr 1fr 110px 100px", gap: 16, padding: "13px 18px", borderBottom: "1px solid #e5e5e5", color: "#888", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
            <span>Story</span><span>Destination</span><span>Date</span><span>Status</span><span />
          </div>
          {stories.map((story) => (
            <div key={story.id} style={{ display: "grid", gridTemplateColumns: "minmax(280px, 2fr) 1fr 1fr 110px 100px", gap: 16, alignItems: "center", padding: "18px", borderBottom: "1px solid #eee" }}>
              <div>
                <div style={{ fontSize: 16, marginBottom: 5 }}>{story.title}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{story.category || "Uncategorised"} · /stories/{story.slug}</div>
              </div>
              <span style={{ fontSize: 13, color: "#666" }}>{story.destination_name || story.location || "—"}</span>
              <span style={{ fontSize: 13, color: "#666" }}>{story.date || "—"}</span>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: story.published ? "#333" : "#999" }}>{story.published ? "Published" : "Draft"}</span>
              <Link href={`/admin/stories/${story.id}`} style={editButton}>Edit</Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const eyebrow: React.CSSProperties = { margin: "0 0 8px", color: "#999", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" };
const secondaryButton: React.CSSProperties = { display: "inline-block", padding: "10px 14px", border: "1px solid #ddd", color: "#333", textDecoration: "none", fontSize: 13, background: "#fff" };
const editButton: React.CSSProperties = { display: "inline-block", textAlign: "center", padding: "8px 12px", border: "1px solid #ddd", color: "#222", textDecoration: "none", fontSize: 12, background: "#fff" };
const emptyState: React.CSSProperties = { padding: 60, border: "1px dashed #ddd", background: "#fff", color: "#888", textAlign: "center" };
