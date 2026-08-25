"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Destination = { id: string; name: string };
type DestinationResponse = { destinations?: Destination[] };

export default function NewStoryPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    location: "",
    date: "",
    category: "",
    description: "",
    destination_id: "",
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/api/admin/destinations", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load destinations");
        const data: DestinationResponse = await response.json();
        setDestinations(data.destinations ?? []);
      } catch {
        setDestinations([]);
      }
    }

    loadDestinations();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function createStory(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          slug: form.slug.trim(),
          location: form.location.trim() || null,
          date: form.date || null,
          category: form.category.trim() || null,
          description: form.description.trim() || null,
          destination_id: form.destination_id || null,
        }),
      });
      const data = (await response.json()) as { success?: boolean; story?: { id: string }; error?: string };
      if (!response.ok || !data.success || !data.story?.id) {
        setError(data.error || "Could not create story.");
        return;
      }
      window.location.href = `/admin/stories/${data.story.id}`;
    } catch {
      setError("Could not create story. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#171717] md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/stories" className="text-[11px] uppercase tracking-[0.18em] text-[#77736c] hover:text-[#171717]">
          ← Stories
        </Link>

        <header className="mt-10 border-b border-[#d8d3ca] pb-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#77736c]">Editorial</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] md:text-6xl">New Story</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#77736c]">
            Create the story details first. You will build the story content and blocks in the editor after saving.
          </p>
        </header>

        <form onSubmit={createStory} className="mt-10">
          <section className="bg-white p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Title *</span>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: current.slug || makeSlug(title),
                    }));
                  }}
                  placeholder="Anna & James"
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none transition-colors focus:border-[#171717]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Slug *</span>
                <input
                  value={form.slug}
                  onChange={(event) => updateField("slug", makeSlug(event.target.value))}
                  placeholder="anna-james-da-nang"
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none transition-colors focus:border-[#171717]"
                />
                <span className="mt-2 block text-[11px] text-[#99958e]">/stories/{form.slug || "your-story"}</span>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Category</span>
                <input
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  placeholder="Wedding"
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none transition-colors focus:border-[#171717]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Destination</span>
                <select
                  value={form.destination_id}
                  onChange={(event) => updateField("destination_id", event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-sm outline-none transition-colors focus:border-[#171717]"
                >
                  <option value="">Select destination</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>{destination.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Location</span>
                <input
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Da Nang, Vietnam"
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none transition-colors focus:border-[#171717]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-sm outline-none transition-colors focus:border-[#171717]"
                />
              </label>
            </div>

            <label className="mt-8 block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Description / SEO intro</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="A short introduction to this story..."
                className="mt-2 min-h-36 w-full resize-y border border-[#d8d3ca] bg-[#fffefa] px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-[#171717]"
              />
            </label>
          </section>

          {error && <p className="mt-4 border border-[#e2cfcf] bg-white px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/admin/stories" className="px-2 py-3 text-center text-[11px] uppercase tracking-[0.16em] text-[#77736c] hover:text-[#171717]">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#171717] px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create Story →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
