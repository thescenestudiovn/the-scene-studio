"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Destination = { id: string; name: string };
type Category = { id: string; name: string; slug: string };
type Location = { id: string; name: string; slug: string; city: string | null; country: string | null };
type DestinationResponse = { destinations?: Destination[] };
type CategoryResponse = { categories?: Category[] };
type LocationResponse = { locations?: Location[] };

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewStoryPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    description: "",
    destination_id: "",
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [destinationResponse, categoryResponse, locationResponse] = await Promise.all([
          fetch("/api/admin/destinations", { cache: "no-store" }),
          fetch("/api/admin/story-categories", { cache: "no-store" }),
          fetch("/api/admin/locations", { cache: "no-store" }),
        ]);
        const destinationData: DestinationResponse = await destinationResponse.json();
        const categoryData: CategoryResponse = await categoryResponse.json();
        const locationData: LocationResponse = await locationResponse.json();
        setDestinations(destinationData.destinations ?? []);
        setCategories(categoryData.categories ?? []);
        setLocations(locationData.locations ?? []);
      } catch {
        setDestinations([]);
        setCategories([]);
        setLocations([]);
      }
    }

    loadOptions();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = categoryInput.trim().toLowerCase();
    if (!query) return categories.filter((category) => !selectedCategories.some((item) => item.id === category.id)).slice(0, 8);
    return categories
      .filter((category) => !selectedCategories.some((item) => item.id === category.id))
      .filter((category) => category.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [categories, categoryInput, selectedCategories]);

  const filteredLocations = useMemo(() => {
    const query = locationInput.trim().toLowerCase();
    if (!query) return locations.filter((location) => !selectedLocations.some((item) => item.id === location.id)).slice(0, 8);
    return locations
      .filter((location) => !selectedLocations.some((item) => item.id === location.id))
      .filter((location) => `${location.name} ${location.city ?? ""} ${location.country ?? ""}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [locations, locationInput, selectedLocations]);

  async function addCategory(name?: string) {
    const value = (name ?? categoryInput).trim();
    if (!value || creatingCategory) return;
    const existing = categories.find((category) => category.name.toLowerCase() === value.toLowerCase());
    if (existing) {
      if (!selectedCategories.some((item) => item.id === existing.id)) setSelectedCategories((current) => [...current, existing]);
      setCategoryInput("");
      return;
    }

    setCreatingCategory(true);
    setError("");
    try {
      const response = await fetch("/api/admin/story-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const data = (await response.json()) as { success?: boolean; category?: Category; error?: string };
      if (!response.ok || !data.success || !data.category) {
        setError(data.error || "Could not create category.");
        return;
      }
      setCategories((current) => current.some((item) => item.id === data.category!.id) ? current : [...current, data.category!].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategories((current) => current.some((item) => item.id === data.category!.id) ? current : [...current, data.category!]);
      setCategoryInput("");
    } catch {
      setError("Could not create category.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function addLocation(name?: string) {
    const value = (name ?? locationInput).trim();
    if (!value || creatingLocation) return;
    const existing = locations.find((location) => location.name.toLowerCase() === value.toLowerCase());
    if (existing) {
      if (!selectedLocations.some((item) => item.id === existing.id)) setSelectedLocations((current) => [...current, existing]);
      setLocationInput("");
      return;
    }

    setCreatingLocation(true);
    setError("");
    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const data = (await response.json()) as { success?: boolean; location?: Location; error?: string };
      if (!response.ok || !data.success || !data.location) {
        setError(data.error || "Could not create location.");
        return;
      }
      setLocations((current) => current.some((item) => item.id === data.location!.id) ? current : [...current, data.location!].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedLocations((current) => current.some((item) => item.id === data.location!.id) ? current : [...current, data.location!]);
      setLocationInput("");
    } catch {
      setError("Could not create location.");
    } finally {
      setCreatingLocation(false);
    }
  }

  function removeCategory(id: string) {
    setSelectedCategories((current) => current.filter((item) => item.id !== id));
  }

  function removeLocation(id: string) {
    setSelectedLocations((current) => current.filter((item) => item.id !== id));
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
          title: form.title.trim(),
          slug: form.slug.trim(),
          date: form.date || null,
          description: form.description.trim() || null,
          destination_id: form.destination_id || null,
          category_ids: selectedCategories.map((category) => category.id),
          location_ids: selectedLocations.map((location) => location.id),
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
                <input autoFocus value={form.title} onChange={(event) => { const title = event.target.value; setForm((current) => ({ ...current, title, slug: current.slug || makeSlug(title) })); }} placeholder="Anna & James" className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none focus:border-[#171717]" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Slug *</span>
                <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: makeSlug(event.target.value) }))} placeholder="anna-james-da-nang" className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-base outline-none focus:border-[#171717]" />
                <span className="mt-2 block text-[11px] text-[#99958e]">/stories/{form.slug || "your-story"}</span>
              </label>

              <div className="block md:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Categories</span>
                <div className="mt-2 border border-[#d8d3ca] bg-[#fffefa] p-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <button key={category.id} type="button" onClick={() => removeCategory(category.id)} className="inline-flex items-center gap-2 bg-[#ebe7df] px-3 py-2 text-xs hover:bg-[#ded9cf]">
                        {category.name}<span className="text-[#77736c]">×</span>
                      </button>
                    ))}
                    <input
                      value={categoryInput}
                      onChange={(event) => setCategoryInput(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addCategory(); } if (event.key === "Backspace" && !categoryInput && selectedCategories.length) removeCategory(selectedCategories[selectedCategories.length - 1].id); }}
                      placeholder={selectedCategories.length ? "Add another category…" : "Type a category and press Enter…"}
                      className="min-w-[220px] flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                    />
                  </div>
                  {(categoryInput || filteredCategories.length > 0) && (
                    <div className="mt-2 border-t border-[#e6e1d9] pt-2">
                      {filteredCategories.map((category) => <button key={category.id} type="button" onClick={() => void addCategory(category.name)} className="mr-2 mb-2 border border-[#d8d3ca] px-3 py-2 text-xs hover:bg-white">{category.name}</button>)}
                      {categoryInput.trim() && !categories.some((category) => category.name.toLowerCase() === categoryInput.trim().toLowerCase()) && <button type="button" onClick={() => void addCategory()} className="mr-2 mb-2 border border-dashed border-[#aaa59c] px-3 py-2 text-xs hover:bg-white">+ Create “{categoryInput.trim()}”</button>}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-[#99958e]">A story can have multiple categories. Press Enter to select an existing category or create a new one.</p>
              </div>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Destination</span>
                <select value={form.destination_id} onChange={(event) => setForm((current) => ({ ...current, destination_id: event.target.value }))} className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-sm outline-none focus:border-[#171717]">
                  <option value="">Select destination</option>
                  {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                </select>
              </label>

              <div className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Locations</span>
                <div className="mt-2 border border-[#d8d3ca] bg-[#fffefa] p-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((location) => (
                      <button key={location.id} type="button" onClick={() => removeLocation(location.id)} className="inline-flex items-center gap-2 bg-[#ebe7df] px-3 py-2 text-xs hover:bg-[#ded9cf]">
                        {location.name}<span className="text-[#77736c]">×</span>
                      </button>
                    ))}
                    <input
                      value={locationInput}
                      onChange={(event) => setLocationInput(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addLocation(); } if (event.key === "Backspace" && !locationInput && selectedLocations.length) removeLocation(selectedLocations[selectedLocations.length - 1].id); }}
                      placeholder={selectedLocations.length ? "Add another location…" : "Type a location and press Enter…"}
                      className="min-w-[190px] flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                    />
                  </div>
                  {(locationInput || filteredLocations.length > 0) && (
                    <div className="mt-2 border-t border-[#e6e1d9] pt-2">
                      {filteredLocations.map((location) => <button key={location.id} type="button" onClick={() => void addLocation(location.name)} className="mr-2 mb-2 border border-[#d8d3ca] px-3 py-2 text-xs hover:bg-white">{location.name}{location.city ? ` · ${location.city}` : ""}</button>)}
                      {locationInput.trim() && !locations.some((location) => location.name.toLowerCase() === locationInput.trim().toLowerCase()) && <button type="button" onClick={() => void addLocation()} className="mr-2 mb-2 border border-dashed border-[#aaa59c] px-3 py-2 text-xs hover:bg-white">+ Create “{locationInput.trim()}”</button>}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-[#99958e]">A story can happen at multiple venues or places.</p>
              </div>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Date</span>
                <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="mt-2 h-12 w-full border border-[#d8d3ca] bg-[#fffefa] px-4 text-sm outline-none focus:border-[#171717]" />
              </label>
            </div>

            <label className="mt-8 block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">Description / SEO intro</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="A short introduction to this story..." className="mt-2 min-h-36 w-full resize-y border border-[#d8d3ca] bg-[#fffefa] px-4 py-3 text-sm leading-6 outline-none focus:border-[#171717]" />
            </label>
          </section>

          {error && <p className="mt-4 border border-[#e2cfcf] bg-white px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/admin/stories" className="px-2 py-3 text-center text-[11px] uppercase tracking-[0.16em] text-[#77736c] hover:text-[#171717]">Cancel</Link>
            <button type="submit" disabled={saving || creatingCategory || creatingLocation} className="bg-[#171717] px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50">{saving ? "Creating…" : "Create Story →"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
