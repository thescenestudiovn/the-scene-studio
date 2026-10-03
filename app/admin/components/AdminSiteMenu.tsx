"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminEditor } from "./AdminEditorContext";
import { BlockEditor } from "../../../components/story/editor/StoryContent";
import MediaPickerModal from "../../../components/story/blocks/image/MediaPickerModal";

type Page = {
    id: string; slug: string; title: string; homepage?: number; menu_order?: number;
    menu_visibility?: "visible" | "hidden" | "footer"; page_status?: "online" | "offline" | "password";
    password?: string | null; show_header_footer?: number; seo_title?: string | null;
    seo_description?: string | null; noindex?: number; social_image?: string | null;
};

function labelForBlock(block: { type: string; variant?: string | null; data?: Record<string, unknown> }) {
    const variant = typeof block.variant === "string" && block.variant ? block.variant : typeof block.data?.variant === "string" ? block.data.variant : "";
    const labels: Record<string, string> = {
        "banner-1": "Banner 1", "banner-2": "Banner 2", "banner-3": "Banner 3", "banner-video": "YouTube Video",
        "info-1": "Info 1", "info-2": "Info 2", "info-3": "Info 3", "testimonial-1": "Testimonial 1",
        "testimonial-2": "Testimonial 2", "testimonial-3": "Testimonial 3", "pricing-1": "Pricing 1", "pricing-2": "Pricing 2",
        "pricing-3": "Pricing 3", "faq-1": "FAQ 1", "faq-2": "FAQ 2", "faq-3": "FAQ 3", "quote-1": "Quote 1",
        "quote-2": "Quote 2", "quote-3": "Quote 3", "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3",
    };
    return labels[variant] ?? (variant ? variant.replace(/-/g, " ") : block.type);
}

function SettingsPanel({ page, onClose, onSaved, onDelete, onDuplicate }: {
    page: Page; onClose: () => void; onSaved: (page: Page) => void; onDelete: () => void; onDuplicate: () => void;
}) {
    const [draft, setDraft] = useState(page);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [socialPickerOpen, setSocialPickerOpen] = useState(false);
    useEffect(() => setDraft(page), [page]);
    const update = (patch: Partial<Page>) => setDraft(current => ({ ...current, ...patch }));

    async function save() {
        setSaving(true); setMessage("");
        try {
            const response = await fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                id: page.id, title: draft.title, slug: draft.slug, seo_title: draft.seo_title ?? null, seo_description: draft.seo_description ?? null,
                menu_visibility: draft.menu_visibility ?? "visible", page_status: draft.page_status ?? "online", password: draft.password ?? null,
                show_header_footer: draft.show_header_footer !== 0, noindex: draft.noindex === 1, social_image: draft.social_image ?? null,
            })});
            const data = await response.json() as { success?: boolean; page?: Page; error?: string };
            if (!response.ok || !data.success || !data.page) throw new Error(data.error || "Could not save page settings");
            onSaved(data.page); setMessage("Saved.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save page settings"); }
        finally { setSaving(false); }
    }

    async function setHomepage() {
        setSaving(true); setMessage("");
        try {
            const response = await fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id, homepage: true }) });
            const data = await response.json() as { success?: boolean; page?: Page; error?: string };
            if (!response.ok || !data.success || !data.page) throw new Error(data.error || "Could not set homepage");
            onSaved(data.page); setMessage("Homepage updated.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not set homepage"); }
        finally { setSaving(false); }
    }

    return <div className="absolute inset-0 z-[80] bg-[#fbfaf7]" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
        <aside className="h-full w-full max-w-[272px] overflow-y-auto border-r border-[#d8d3ca] bg-[#fbfaf7] p-3">
            <div className="flex items-start justify-between gap-3 border-b border-[#e5e0d8] pb-4">
                <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">Page Settings</p><h2 className="mt-1 font-serif text-xl leading-tight">{page.title}</h2></div>
                <button type="button" onClick={onClose} className="text-lg text-[#77736c]" aria-label="Close settings">×</button>
            </div>
            <section className="space-y-4 border-b border-[#e5e0d8] py-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">General</p>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Page Name<input className="border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.title} onChange={event => update({ title: event.target.value })} /></label>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Page Status<select className="border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.page_status ?? "online"} onChange={event => update({ page_status: event.target.value as Page["page_status"] })}><option value="online">Online</option><option value="offline">Offline</option></select></label>
                <label className="flex items-center justify-between gap-4 border border-[#d8d3ca] bg-white p-3 text-xs">Show Page Header and Footer<input type="checkbox" checked={draft.show_header_footer !== 0} onChange={event => update({ show_header_footer: event.target.checked ? 1 : 0 })} /></label>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Menu Visibility<select className="border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.menu_visibility ?? "visible"} onChange={event => update({ menu_visibility: event.target.value as Page["menu_visibility"] })}><option value="visible">Visible</option><option value="hidden">Hidden</option><option value="footer">Only show in footer</option></select></label>
            </section>
            <section className="space-y-4 border-b border-[#e5e0d8] py-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">SEO</p>
                <div className="border border-[#d8d3ca] bg-white p-4"><p className="text-[9px] uppercase tracking-[0.14em] text-[#8a857d]">Search Preview</p><p className="mt-3 text-sm font-medium">{draft.seo_title || draft.title}</p><p className="mt-1 text-xs text-[#6f6a61]">https://thescenestudio.asia/{draft.slug}</p><p className="mt-2 text-xs leading-5 text-[#77736c]">{draft.seo_description || "Add a page description for search results."}</p></div>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">URL Slug<input className="border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.slug} onChange={event => update({ slug: event.target.value })} /></label>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Page Title<input className="border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.seo_title ?? ""} onChange={event => update({ seo_title: event.target.value })} placeholder="Title in search results and browser" /></label>
                <label className="grid gap-2 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">Page Description<textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm normal-case tracking-normal text-[#171717]" value={draft.seo_description ?? ""} onChange={event => update({ seo_description: event.target.value })} /></label>
                <label className="flex items-center justify-between gap-4 border border-[#d8d3ca] bg-white p-3 text-xs">Hide Page from Search Engines<input type="checkbox" checked={draft.noindex === 1} onChange={event => update({ noindex: event.target.checked ? 1 : 0 })} /></label>
            </section>
            <section className="space-y-4 border-b border-[#e5e0d8] py-6">\n                <p className="text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">Social</p>\n                <div className="border border-dashed border-[#cfc9bf] bg-white p-4">\n                    <button type="button" onClick={() => setSocialPickerOpen(true)} className="flex min-h-28 w-full items-center justify-center text-center text-[10px] uppercase tracking-[0.14em] text-[#77736c] hover:bg-[#fbfaf7]">\n                        {draft.social_image ? "Change social image" : <>Drag photo here<br /><span className="mt-2 block text-[#aaa49a]">Or choose from Client Gallery / My Computer</span></>}\n                    </button>\n                    {draft.social_image && <p className="mt-3 truncate text-[10px] text-[#77736c]">{draft.social_image}</p>}\n                </div>\n                <p className="text-[10px] leading-5 text-[#aaa49a]">Used when this page is shared on Facebook, Twitter and other social networks.</p>\n            </section>\n            <MediaPickerModal open={socialPickerOpen} required={1} selectedIds={[]} collectionId="" onClose={() => setSocialPickerOpen(false)} onDone={(_collectionId, _mediaIds, selectedMedia) => { update({ social_image: selectedMedia[0]?.path ?? null }); setSocialPickerOpen(false); }} />\n            {message && <p className="py-4 text-xs text-[#666158]">{message}</p>}
            <div className="sticky bottom-0 -mx-5 mt-2 flex flex-wrap gap-2 border-t border-[#e5e0d8] bg-[#fbfaf7] p-5 sm:-mx-7 sm:px-7">
                <button type="button" onClick={setHomepage} disabled={saving || Number(page.homepage) === 1} className="border border-[#d8d3ca] px-3 py-2.5 text-[9px] uppercase tracking-[0.12em] disabled:opacity-40">{Number(page.homepage) === 1 ? "Homepage" : "Set as Homepage"}</button>
                <button type="button" onClick={onDuplicate} disabled={saving} className="border border-[#d8d3ca] px-3 py-2.5 text-[9px] uppercase tracking-[0.12em]">Duplicate Page</button>
                <button type="button" onClick={onDelete} disabled={saving || Number(page.homepage) === 1} className="border border-[#b8a7a0] px-3 py-2.5 text-[9px] uppercase tracking-[0.12em] text-[#7a4d43] disabled:opacity-40">Delete Page</button>
                <button type="button" onClick={save} disabled={saving} className="ml-auto bg-[#171717] px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-white disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            </div>
        </aside>
    </div>;
}

export default function AdminSiteMenu({ activeSlug }: { activeSlug: string }) {
    const { editor } = useAdminEditor();
    const [pages, setPages] = useState<Page[]>([]);
    const [settingsPage, setSettingsPage] = useState<Page | null>(null);
    const [loadingPages, setLoadingPages] = useState(true);

    const loadPages = useCallback(async () => {
        const response = await fetch("/api/admin/pages", { cache: "no-store" });
        const data = await response.json() as { success?: boolean; pages?: Page[] };
        if (response.ok && data.success) setPages(data.pages ?? []);
        setLoadingPages(false);
    }, []);
    useEffect(() => { void loadPages(); }, [loadPages]);

    async function addPage() {
        const title = window.prompt("Page Name", "New Page");
        if (!title?.trim()) return;
        const response = await fetch("/api/admin/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim() }) });
        if (response.ok) {
            const data = await response.json() as { page?: Page };
            await loadPages();
            if (data.page) window.location.href = "/admin/pages/" + data.page.slug;
        }
    }
    async function duplicatePage(page: Page) {
        const response = await fetch("/api/admin/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: page.title + " Copy", duplicate_from_id: page.id }) });
        if (response.ok) {
            const data = await response.json() as { page?: Page };
            await loadPages();
            if (data.page) window.location.href = "/admin/pages/" + data.page.slug;
        }
    }
    async function deletePage(page: Page) {
        if (Number(page.homepage) === 1) return;
        if (!window.confirm('Delete "' + page.title + '"? This cannot be undone.')) return;
        const response = await fetch("/api/admin/pages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id }) });
        if (response.ok) {
            setSettingsPage(null); await loadPages();
            if (activeSlug === page.slug) window.location.href = "/admin/pages/home";
        } else {
            const data = await response.json() as { error?: string }; window.alert(data.error || "Could not delete page");
        }
    }
    async function reorderPage(draggedId: string, targetId: string) {
        if (draggedId === targetId) return;
        const current = [...pages]; const from = current.findIndex(page => page.id === draggedId); const to = current.findIndex(page => page.id === targetId);
        if (from < 0 || to < 0) return;
        const [moved] = current.splice(from, 1); current.splice(to, 0, moved); setPages(current);
        await Promise.all(current.map((page, index) => fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id, menu_order: index }) })));
    }

    const editorType = editor?.block.type ?? "";
    const editorIsText = editorType === "text" || editorType.startsWith("text-");

    if (editor && !editorIsText) {
        return <aside data-admin-block-editor className="relative z-40 flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[340px] lg:overflow-hidden lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-[#e5e0d8] px-5 py-4"><div className="flex items-center justify-between gap-3"><button type="button" onClick={editor.onClose} className="text-[9px] uppercase tracking-[0.16em] text-[#77736c] hover:text-[#171717]">← Pages</button></div><p className="mt-5 text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">Edit block</p><h2 className="mt-1 font-serif text-2xl leading-tight">{labelForBlock(editor.block)}</h2></div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{(() => {
                const variant = typeof editor.block.variant === "string" ? editor.block.variant : typeof editor.block.data?.variant === "string" ? editor.block.data.variant : "";
                const bannerVariants = [["banner-1", "Banner 1"], ["banner-2", "Banner 2"], ["banner-3", "Banner 3"]] as const;
                const isBanner = editor.block.type === "content" && bannerVariants.some(([id]) => id === variant);
                return <div className="grid gap-4">{isBanner && <section className="border border-[#d8d3ca] bg-white p-3"><p className="mb-3 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Banner style</p><div className="grid grid-cols-2 gap-2">{bannerVariants.map(([id, label]) => <button key={id} type="button" onClick={() => editor.onUpdate(editor.block, { variant: id })} className={variant === id ? "min-h-10 border border-[#171717] bg-[#171717] px-2 py-2 text-left text-[9px] uppercase tracking-[0.1em] text-white transition" : "min-h-10 border border-[#d8d3ca] bg-[#fbfaf7] px-2 py-2 text-left text-[9px] uppercase tracking-[0.1em] text-[#625e57] transition hover:border-[#99938b] hover:bg-white"}>{label}</button>)}</div></section>}<div className="overflow-hidden border border-[#d8d3ca] bg-white"><BlockEditor storyId={editor.storyId} block={editor.block} blocks={editor.blocks} onBlocksChange={editor.onBlocksChange} onUpdate={editor.onUpdate} /></div></div>;
            })()}</div>
        </aside>;
    }

    return <>
        <aside className="relative z-40 flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[272px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <nav aria-label="Site menu" className="px-3 py-4">
                <div className="mb-3 flex items-center justify-between px-2"><p className="text-[9px] uppercase tracking-[0.16em] text-[#aaa49a]">Site Menu</p><button type="button" onClick={addPage} className="text-[9px] uppercase tracking-[0.12em] text-[#77736c] hover:text-[#171717]">+ Add Page</button></div>
                {loadingPages ? <p className="px-2 py-4 text-[10px] text-[#aaa49a]">Loading…</p> : pages.filter(page => page.menu_visibility !== "hidden" && page.menu_visibility !== "footer").map(page => (
                    <div key={page.id} draggable onDragStart={event => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/page-id", page.id); }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void reorderPage(event.dataTransfer.getData("text/page-id"), page.id); }} className="group flex items-center gap-1">
                        <Link href={"/admin/pages/" + page.slug} aria-current={activeSlug === page.slug ? "page" : undefined} className={activeSlug === page.slug ? "flex min-w-0 flex-1 items-center gap-2 bg-[#eeece6] px-3 py-2.5 text-xs text-[#171717]" : "flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-xs text-[#6f6a61] transition-colors hover:bg-[#f2f0eb]"}>
                            <span className="w-4 shrink-0 text-center text-[#8a857d]">☰</span><span className="truncate">{page.title}</span>{Number(page.homepage) === 1 && <span className="ml-auto shrink-0 text-[8px] uppercase tracking-[0.1em] text-[#aaa49a]">Homepage</span>}
                        </Link>
                        <button type="button" onClick={() => setSettingsPage(page)} aria-label={"Settings for " + page.title} title="Page settings" className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-[#8a857d] opacity-70 hover:bg-[#f2f0eb] hover:text-[#171717]">⚙</button>
                    </div>
                ))}
            </nav>
            <nav aria-label="Pages not in site menu" className="border-t border-[#e5e0d8] px-3 py-4">
                <p className="px-2 pb-2 text-[9px] uppercase tracking-[0.16em] text-[#aaa49a]">Not in menu</p>
                <p className="px-3 py-2 text-[10px] leading-5 text-[#aaa49a]">Pages hidden from the site menu appear here.</p>
            </nav>
        </aside>
        {settingsPage && <SettingsPanel page={settingsPage} onClose={() => setSettingsPage(null)} onSaved={page => { setSettingsPage(page); void loadPages(); }} onDelete={() => void deletePage(settingsPage)} onDuplicate={() => void duplicatePage(settingsPage)} />}
    </>;
}
