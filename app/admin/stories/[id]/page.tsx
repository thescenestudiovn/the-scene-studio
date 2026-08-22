"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mediaUrl } from "../../../../lib/media";

type Media = {
  id: string;
  collection_id?: string | null;
  type?: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type Collection = {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  destination_name: string | null;
  media_count: number;
  cover_path: string | null;
};

type Block = {
  id: string;
  type: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media: Media[];
};

type Story = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  date: string | null;
  category: string | null;
  description: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published: number;
};

const BLOCK_TYPES = [
  ["text", "Text", "Write a text section"],
  ["image", "Image", "One or more images from a collection"],
  ["content", "Content", "Heading, text and supporting content"],
  ["links", "Links", "Add custom links and calls to action"],
  ["blog", "Blog", "Long-form editorial content"],
  ["video", "Video", "Embed a video URL"],
  ["contact", "Contact", "Contact information or enquiry CTA"],
  ["social", "Social", "Social links and profiles"],
  ["others", "Others", "Custom block content"],
  ["flex", "Flex Block", "Flexible custom layout"],
] as const;

export default function StoryEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [story, setStory] = useState<Story | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionMedia, setCollectionMedia] = useState<Media[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaPickerBlock, setMediaPickerBlock] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [storyRes, collectionsRes] = await Promise.all([
        fetch(`/api/admin/stories/${id}`, { cache: "no-store" }),
        fetch("/api/admin/collections", { cache: "no-store" }),
      ]);
      const storyData = (await storyRes.json()) as { success: boolean; story?: Story; blocks?: Block[]; error?: string };
      const collectionData = (await collectionsRes.json()) as { success?: boolean; collections?: Collection[] };
      if (!storyData.success || !storyData.story) throw new Error(storyData.error || "Failed to load story");
      setStory(storyData.story);
      setBlocks(storyData.blocks ?? []);
      setCollections(collectionData.collections ?? []);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to load story");
    } finally {
      setLoading(false);
    }
  }

  async function saveStory(published = story?.published === 1) {
    if (!story) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          slug: story.slug,
          location: story.location,
          date: story.date,
          category: story.category,
          description: story.description,
          destination_id: story.destination_id ?? null,
          seo_title: story.seo_title ?? null,
          seo_description: story.seo_description ?? null,
          published,
        }),
      });
      const data = (await response.json()) as { success: boolean; story?: Story; error?: string };
      if (!response.ok || !data.success || !data.story) throw new Error(data.error || "Failed to save story");
      setStory(data.story);
      setMessage(published ? "Story published." : "Draft saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save story");
    } finally {
      setSaving(false);
    }
  }

  async function addBlock(type: string) {
    const sortOrder = blocks.length;
    const response = await fetch(`/api/admin/stories/${id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, sort_order: sortOrder, title: null, body: null, data: {} }),
    });
    const data = (await response.json()) as { success: boolean; block?: Block; error?: string };
    if (!response.ok || !data.success || !data.block) throw new Error(data.error || "Failed to add block");
    setBlocks((current) => [...current, { ...data.block!, media: [] }]);
    setShowBlockMenu(false);
  }

  async function updateBlock(block: Block, patch: Partial<Block>) {
    const response = await fetch(`/api/admin/stories/${id}/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await response.json()) as { success: boolean; block?: Block; error?: string };
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to update block");
    setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, ...patch } : item));
  }

  async function deleteBlock(blockId: string) {
    if (!window.confirm("Delete this block?")) return;
    const response = await fetch(`/api/admin/stories/${id}/blocks/${blockId}`, { method: "DELETE" });
    const data = (await response.json()) as { success: boolean; error?: string };
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete block");
    setBlocks((current) => current.filter((block) => block.id !== blockId));
  }

  async function openMediaPicker(blockId: string) {
    setMediaPickerBlock(blockId);
    setSelectedMedia([]);
    setSelectedCollection(null);
    setCollectionMedia([]);
  }

  async function chooseCollection(collection: Collection) {
    setSelectedCollection(collection);
    setSelectedMedia([]);
    const response = await fetch(`/api/admin/media?collection_id=${encodeURIComponent(collection.id)}`, { cache: "no-store" });
    const data = (await response.json()) as { success?: boolean; media?: Media[]; error?: string };
    if (!response.ok || data.success === false) throw new Error(data.error || "Failed to load collection photos");
    setCollectionMedia(data.media ?? []);
  }

  function toggleMedia(mediaId: string) {
    setSelectedMedia((current) => current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId]);
  }

  async function attachSelectedMedia() {
    if (!mediaPickerBlock || selectedMedia.length === 0) return;
    const block = blocks.find((item) => item.id === mediaPickerBlock);
    if (!block) return;
    const existing = new Set(block.media.map((item) => item.id));
    const ids = selectedMedia.filter((mediaId) => !existing.has(mediaId));
    for (let index = 0; index < ids.length; index += 1) {
      const response = await fetch(`/api/admin/stories/${id}/blocks/${block.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: ids[index], sort_order: block.media.length + index }),
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to attach photo");
    }
    setMediaPickerBlock(null);
    await load();
  }

  async function removeMedia(blockId: string, mediaId: string) {
    const response = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_id: mediaId }),
    });
    const data = (await response.json()) as { success: boolean; error?: string };
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to remove photo");
    await load();
  }

  if (loading) return <main className="min-h-screen bg-[#f5f2ec] p-10 text-[#171717]">Loading story…</main>;
  if (!story) return <main className="min-h-screen bg-[#f5f2ec] p-10 text-[#171717]">Story not found.</main>;

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-[#ddd7cd] bg-[#f5f2ec]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-5">
            <Link href="/admin/stories" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Stories</Link>
            <span className="hidden h-5 w-px bg-[#d5cfc5] sm:block" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story Editor</p>
              <p className="mt-0.5 max-w-[360px] truncate text-sm font-medium">{story.title || "Untitled story"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] sm:inline-flex ${story.published ? "bg-[#e3eadf] text-[#43543c]" : "bg-[#e9e5de] text-[#6f6a61]"}`}>
              {story.published ? "Published" : "Draft"}
            </span>
            <a href={`/stories/${story.slug}`} target="_blank" rel="noreferrer" className="hidden border border-[#bdb7ad] px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] md:inline-block">Preview</a>
            <button onClick={() => saveStory(false)} disabled={saving} className="border border-[#171717] px-4 py-2.5 text-[10px] uppercase tracking-[0.15em]">Save Draft</button>
            <button onClick={() => saveStory(true)} disabled={saving} className="bg-[#171717] px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-white">Publish</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="px-6 py-10 lg:px-16 lg:py-14">
          <div className="mx-auto max-w-[850px]">
            {message && <div className="mb-8 border border-[#d8d1c7] bg-white px-5 py-3 text-sm text-[#666158]">{message}</div>}

            <div className="mb-12">
              <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story</p>
              <input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} placeholder="Story title" className="w-full border-0 bg-transparent p-0 font-serif text-5xl leading-[1.08] tracking-[-0.04em] outline-none placeholder:text-[#bbb5ab] lg:text-6xl" />
              <p className="mt-5 text-sm text-[#8a857d]">/stories/{story.slug}</p>
            </div>

            <div className="space-y-5">
              {blocks.map((block, index) => (
                <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:p-9">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="rounded-full bg-[#f0ece5] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#68635b]">{BLOCK_TYPES.find((item) => item[0] === block.type)?.[1] ?? block.type}</span>
                    </div>
                    <button onClick={() => deleteBlock(block.id)} className="text-[10px] uppercase tracking-[0.14em] text-[#9a4d42] opacity-0 transition group-hover:opacity-100">Delete</button>
                  </div>

                  <input value={block.eyebrow ?? ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, eyebrow: e.target.value } : item))} onBlur={() => updateBlock(block, { eyebrow: block.eyebrow })} placeholder="Eyebrow / optional" className="mb-3 w-full border-0 border-b border-[#e5e0d8] bg-transparent px-0 py-2 text-[10px] uppercase tracking-[0.18em] outline-none placeholder:text-[#b7b1a7]" />
                  <input value={block.title ?? ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, title: e.target.value } : item))} onBlur={() => updateBlock(block, { title: block.title })} placeholder="Block heading" className="mb-4 w-full border-0 bg-transparent px-0 py-2 font-serif text-3xl outline-none placeholder:text-[#bdb7ad]" />
                  <textarea value={block.body ?? ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, body: e.target.value } : item))} onBlur={() => updateBlock(block, { body: block.body })} placeholder="Start writing…" rows={block.type === "text" || block.type === "blog" ? 8 : 4} className="w-full resize-y border-0 bg-transparent p-0 text-[15px] leading-7 text-[#5f5a53] outline-none placeholder:text-[#bdb7ad]" />

                  {(block.type === "image" || block.type === "content" || block.type === "flex") && (
                    <div className="mt-7 border-t border-[#e7e2da] pt-6">
                      {block.media.length > 0 && <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">{block.media.map((item) => <div key={item.id} className="group/media relative overflow-hidden bg-[#e8e3db]"><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="aspect-[4/3] h-full w-full object-cover" /><button onClick={() => removeMedia(block.id, item.id)} className="absolute right-2 top-2 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white opacity-0 transition group-hover/media:opacity-100">Remove</button></div>)}</div>}
                      <button onClick={() => openMediaPicker(block.id)} className="flex w-full items-center justify-center gap-3 border border-dashed border-[#c8c1b7] bg-[#faf8f4] px-5 py-5 text-[10px] uppercase tracking-[0.16em] text-[#6e6961] transition hover:border-[#171717] hover:bg-white">+ Add photos from Collection</button>
                    </div>
                  )}

                  {block.type !== "image" && block.type !== "content" && block.type !== "flex" && <div className="mt-5 border-t border-[#e7e2da] pt-5 text-xs text-[#989187]">{block.type === "video" ? "Paste your video URL in the content field above." : "Customize this block using its content fields."}</div>}
                </div>
              ))}
            </div>

            <div className="relative mt-8 flex justify-center">
              <button onClick={() => setShowBlockMenu((value) => !value)} className="border border-[#171717] bg-[#171717] px-7 py-4 text-[10px] uppercase tracking-[0.18em] text-white">+ Add Block</button>
              {showBlockMenu && <BlockMenu onSelect={addBlock} />}
            </div>
          </div>
        </section>

        <aside className="border-t border-[#ddd7cd] bg-[#eeebe5] lg:min-h-[calc(100vh-73px)] lg:border-l lg:border-t-0 lg:px-7 lg:py-10">
          <div className="space-y-8">
            <section><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story settings</p><div className="mt-4 space-y-4">
              <Field label="Slug"><input value={story.slug} onChange={(e) => setStory({ ...story, slug: e.target.value })} className="admin-input" /></Field>
              <Field label="Location"><input value={story.location ?? ""} onChange={(e) => setStory({ ...story, location: e.target.value })} className="admin-input" /></Field>
              <Field label="Date"><input type="date" value={story.date ?? ""} onChange={(e) => setStory({ ...story, date: e.target.value })} className="admin-input" /></Field>
              <Field label="Category"><input value={story.category ?? ""} onChange={(e) => setStory({ ...story, category: e.target.value })} className="admin-input" /></Field>
              <Field label="Description"><textarea value={story.description ?? ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={4} className="admin-input resize-y" /></Field>
            </div></section>

            <section className="border-t border-[#d5cfc5] pt-7"><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">SEO</p><div className="mt-4 space-y-4">
              <Field label="SEO title"><input value={story.seo_title ?? ""} onChange={(e) => setStory({ ...story, seo_title: e.target.value })} className="admin-input" /></Field>
              <Field label="SEO description"><textarea value={story.seo_description ?? ""} onChange={(e) => setStory({ ...story, seo_description: e.target.value })} rows={5} className="admin-input resize-y" /></Field>
            </div></section>

            <section className="border-t border-[#d5cfc5] pt-7"><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Destination</p><p className="mt-3 text-sm text-[#666158]">{story.destination_name || "No destination selected"}</p></section>
          </div>
        </aside>
      </div>

      {mediaPickerBlock && <MediaPicker collections={collections} selectedCollection={selectedCollection} media={collectionMedia} selectedMedia={selectedMedia} onChooseCollection={chooseCollection} onToggle={toggleMedia} onClose={() => setMediaPickerBlock(null)} onAttach={attachSelectedMedia} />}
    </main>
  );
}

function BlockMenu({ onSelect }: { onSelect: (type: string) => void }) {
  return <div className="absolute bottom-full z-20 mb-3 grid w-[min(760px,calc(100vw-48px))] grid-cols-2 gap-px border border-[#d7d1c8] bg-[#d7d1c8] p-px shadow-xl md:grid-cols-3 lg:grid-cols-5">{BLOCK_TYPES.map(([type, title, description]) => <button key={type} onClick={() => onSelect(type)} className="bg-white p-4 text-left transition hover:bg-[#f6f2eb]"><span className="block text-xs font-medium">{title}</span><span className="mt-1 block text-[10px] leading-4 text-[#8a857d]">{description}</span></button>)}</div>;
}

function MediaPicker({ collections, selectedCollection, media, selectedMedia, onChooseCollection, onToggle, onClose, onAttach }: { collections: Collection[]; selectedCollection: Collection | null; media: Media[]; selectedMedia: string[]; onChooseCollection: (collection: Collection) => void; onToggle: (id: string) => void; onClose: () => void; onAttach: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="flex h-[min(850px,92vh)] w-full max-w-6xl flex-col overflow-hidden bg-[#f7f5f0] text-[#171717] shadow-2xl">
    <div className="flex items-center justify-between border-b border-[#ddd7cd] bg-white px-6 py-5"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story Media</p><h2 className="mt-1 font-serif text-2xl">{selectedCollection ? selectedCollection.title : "Choose a Collection"}</h2></div><button onClick={onClose} className="text-xl text-[#77736c]">×</button></div>
    <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
      {!selectedCollection ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{collections.map((collection) => <button key={collection.id} onClick={() => onChooseCollection(collection)} className="group overflow-hidden border border-[#ddd7cd] bg-white text-left transition hover:border-[#171717]"><div className="aspect-[4/3] overflow-hidden bg-[#e5e0d8]">{collection.cover_path ? <img src={mediaUrl(collection.cover_path)} alt={collection.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.15em] text-[#aaa49a]">No cover</div>}</div><div className="p-4"><p className="text-sm font-medium">{collection.title}</p><p className="mt-1 text-xs text-[#89847b]">{collection.destination_name || "No destination"} · {collection.media_count} photos</p></div></button>)}</div> : <div><button onClick={() => onChooseCollection(null as unknown as Collection)} className="mb-5 text-[10px] uppercase tracking-[0.16em] text-[#77736c]">← All Collections</button><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{media.map((item) => { const selected = selectedMedia.includes(item.id); return <button key={item.id} onClick={() => onToggle(item.id)} className={`relative overflow-hidden bg-[#e5e0d8] text-left ${selected ? "ring-2 ring-[#171717] ring-offset-2" : ""}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="aspect-[4/3] h-full w-full object-cover" />{selected && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] text-sm text-white">✓</span>}</button>; })}</div>{media.length === 0 && <div className="border border-dashed border-[#c8c1b7] p-16 text-center text-sm text-[#77736c]">This collection has no photos yet.</div>}</div>}
    </div>
    {selectedCollection && <div className="flex items-center justify-between border-t border-[#ddd7cd] bg-white px-6 py-4"><p className="text-xs text-[#77736c]">{selectedMedia.length} photo{selectedMedia.length === 1 ? "" : "s"} selected</p><button onClick={onAttach} disabled={!selectedMedia.length} className="bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-30">Add Selected Photos</button></div>}
  </div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[#858078]">{label}</span>{children}</label>; }
