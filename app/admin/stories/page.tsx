"use client";

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
        const res = await fetch("/api/admin/stories");

        const data = (await res.json()) as StoriesResponse;

        if (data.success) {
          setStories(data.stories);
        }
      } catch (error) {
        console.error("Failed to load stories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Stories</h1>

      {loading ? (
        <p>Loading...</p>
      ) : stories.length === 0 ? (
        <p>No stories found.</p>
      ) : (
        <div style={{ marginTop: "30px" }}>
          {stories.map((story) => (
            <div
              key={story.id}
              style={{
                padding: "20px 0",
                borderBottom: "1px solid #ddd",
              }}
            >
              <h2>{story.title}</h2>

              <p>
                {story.location || "—"} · {story.category || "—"} ·{" "}
                {story.date || "—"}
              </p>

              <p>
                Destination: {story.destination_name || "—"} ·{" "}
                {story.published ? "Published" : "Draft"}
              </p>

              <small>/stories/{story.slug}</small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}