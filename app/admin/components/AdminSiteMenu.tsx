"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PageItem = {
    id: string;
    slug: string;
    title: string;
    page_type: string;
    published: number;
    sort_order: number;
    seo_title?: string | null;
    seo_description?: string | null;
};

export default function AdminSiteMenu({ activeSlug }: { activeSlug: string }) {
    const router = useRouter();
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Add page modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState("");
    const [newPageSlug, setNewPageSlug] = useState("");
    const [creating, setCreating] = useState(false);
    const [addError, setAddError] = useState("");

    // Settings modal state
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<PageItem | null>(null);
    const [settingTitle, setSettingTitle] = useState("");
    const [settingSlug, setSettingSlug] = useState("");
    const [settingPublished, setSettingPublished] = useState(true);
    const [settingSeoTitle, setSettingSeoTitle] = useState("");
    const [settingSeoDescription, setSettingSeoDescription] = useState("");
    const [savingSettings, setSavingSettings] = useState(false);
    const [deletingPage, setDeletingPage] = useState(false);
    const [settingsError, setSettingsError] = useState("");

    // Drag-and-drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const loadPages = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/pages", { cache: "no-store" });
            const data = (await response.json()) as { success?: boolean; pages?: PageItem[] };
            if (data.success && data.pages) {
                setPages(data.pages);
            }
        } catch (error) {
            console.error("Failed to load pages:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPages();
    }, [loadPages]);

    // Auto-generate slug when title changes in Add Page modal
    function handleNewTitleChange(title: string) {
        setNewPageTitle(title);
        const generated = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        setNewPageSlug(generated);
    }

    async function handleCreatePage(e: React.FormEvent) {
        e.preventDefault();
        if (!newPageTitle.trim()) {
            setAddError("Please enter a page title.");
            return;
        }
        setCreating(true);
        setAddError("");
        try {
            const response = await fetch("/api/admin/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newPageTitle, slug: newPageSlug }),
            });
            const data = (await response.json()) as { success?: boolean; page?: PageItem; error?: string };
            if (!response.ok || !data.success || !data.page) {
                throw new Error(data.error || "Failed to create page");
            }
            setIsAddModalOpen(false);
            setNewPageTitle("");
            setNewPageSlug("");
            await loadPages();
            router.push(`/admin/pages/${data.page.slug}`);
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Failed to create page");
        } finally {
            setCreating(false);
        }
    }

    function openPageSettings(page: PageItem) {
        setEditingPage(page);
        setSettingTitle(page.title);
        setSettingSlug(page.slug);
        setSettingPublished(page.published === 1);
        setSettingSeoTitle(page.seo_title || "");
        setSettingSeoDescription(page.seo_description || "");
        setSettingsError("");
        setIsSettingsModalOpen(true);
    }

    async function handleSaveSettings(e: React.FormEvent) {
        e.preventDefault();
        if (!editingPage) return;
        setSavingSettings(true);
        setSettingsError("");
        try {
            const response = await fetch("/api/admin/pages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingPage.id,
                    title: settingTitle,
                    slug: settingSlug,
                    published: settingPublished,
                    seo_title: settingSeoTitle,
                    seo_description: settingSeoDescription,
                }),
            });
            const data = (await response.json()) as { success?: boolean; error?: string; page?: PageItem };
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to save page settings");
            }
            setIsSettingsModalOpen(false);
            await loadPages();
            if (data.page && data.page.slug !== editingPage.slug && activeSlug === editingPage.slug) {
                router.push(`/admin/pages/${data.page.slug}`);
            }
        } catch (err) {
            setSettingsError(err instanceof Error ? err.message : "Failed to save settings");
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleDeletePage() {
        if (!editingPage) return;
        if (editingPage.page_type === "home" || editingPage.slug === "home") {
            alert("The homepage cannot be deleted.");
            return;
        }
        if (!confirm(`Are you sure you want to delete the page "${editingPage.title}"? This cannot be undone.`)) {
            return;
        }
        setDeletingPage(true);
        setSettingsError("");
        try {
            const response = await fetch(`/api/admin/pages?id=${editingPage.id}`, {
                method: "DELETE",
            });
            const data = (await response.json()) as { success?: boolean; error?: string };
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete page");
            }
            setIsSettingsModalOpen(false);
            await loadPages();
            if (activeSlug === editingPage.slug) {
                router.push("/admin/pages/home");
            }
        } catch (err) {
            setSettingsError(err instanceof Error ? err.message : "Failed to delete page");
        } finally {
            setDeletingPage(false);
        }
    }

    async function reorderPages(newOrder: PageItem[]) {
        setPages(newOrder);
        try {
            await fetch("/api/admin/pages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reorder",
                    page_ids: newOrder.map((p) => p.id),
                }),
            });
        } catch (err) {
            console.error("Failed to persist page order:", err);
            await loadPages();
        }
    }

    function movePage(index: number, direction: -1 | 1) {
        const targetIndex = index + direction;
        // Don't move before home (index 0) or beyond bounds
        if (targetIndex < 1 || targetIndex >= pages.length) return;
        const updated = [...pages];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        void reorderPages(updated);
    }

    function handleDragStart(index: number) {
        setDraggedIndex(index);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index || index === 0) return;
        setDragOverIndex(index);
    }

    function handleDrop(e: React.DragEvent, dropIndex: number) {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex || dropIndex === 0) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        const updated = [...pages];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, movedItem);
        setDraggedIndex(null);
        setDragOverIndex(null);
        void reorderPages(updated);
    }

    return (
        <>
            <aside className="flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[280px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
                {/* Header with Title + Settings Button + Add Page */}
                <div className="flex items-center justify-between border-b border-[#e5e0d8] px-5 py-4">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Website</p>
                        <h2 className="mt-0.5 font-serif text-2xl text-[#171717]">Pages</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Link
                            href="/admin/settings"
                            title="Global Website Settings"
                            className="flex h-7 w-7 items-center justify-center rounded border border-[#d8d3ca] bg-white text-[#6f6a61] hover:bg-[#eeece6] hover:text-[#171717] transition-colors"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddModalOpen(true);
                                setAddError("");
                            }}
                            title="Add new page"
                            className="flex items-center gap-1 rounded border border-[#171717] bg-[#171717] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-medium text-white hover:bg-neutral-800 transition-colors"
                        >
                            <span className="text-xs leading-none">+</span>
                            <span>Add</span>
                        </button>
                    </div>
                </div>

                {/* Pages List */}
                <nav aria-label="Site pages" className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="flex items-center justify-between px-2 pb-2 text-[9px] uppercase tracking-[0.16em] text-[#aaa49a]">
                        <span>Menu Pages</span>
                        <span className="text-[8px] lowercase text-[#bbb5ab]">reorderable</span>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-xs text-[#8a857d]">Loading pages…</div>
                    ) : pages.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#8a857d]">No pages found</div>
                    ) : (
                        <div className="space-y-1">
                            {pages.map((item, index) => {
                                const isActive = activeSlug === item.slug || (activeSlug === "" && item.slug === "home");
                                const isHome = item.slug === "home" || item.page_type === "home";
                                const isDragging = draggedIndex === index;
                                const isOver = dragOverIndex === index;

                                return (
                                    <div
                                        key={item.id}
                                        draggable={!isHome}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={() => {
                                            setDraggedIndex(null);
                                            setDragOverIndex(null);
                                        }}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`group relative flex items-center justify-between rounded px-2.5 py-2 text-xs transition-all ${
                                            isDragging ? "opacity-30" : "opacity-100"
                                        } ${isOver ? "border-t-2 border-[#171717]" : ""} ${
                                            isActive
                                                ? "bg-[#eeece6] text-[#171717] font-medium shadow-sm"
                                                : "text-[#555047] hover:bg-[#f2f0eb]"
                                        }`}
                                    >
                                        {/* Left Side: Drag/Move Controls + Page Link */}
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            {/* Order controls */}
                                            {!isHome ? (
                                                <div className="flex items-center gap-0.5 text-[#aaa49a] opacity-30 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        disabled={index <= 1}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            movePage(index, -1);
                                                        }}
                                                        title="Move up"
                                                        className="p-0.5 hover:text-[#171717] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-[9px]"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={index === pages.length - 1}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            movePage(index, 1);
                                                        }}
                                                        title="Move down"
                                                        className="p-0.5 hover:text-[#171717] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-[9px]"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="w-4 text-center text-[10px] text-[#8a857d]">⌂</span>
                                            )}

                                            {/* Page Title & Slug Link */}
                                            <Link
                                                href={`/admin/pages/${item.slug}`}
                                                className="flex min-w-0 flex-1 items-center gap-2 truncate"
                                            >
                                                <span className="truncate">{item.title}</span>
                                                {item.published === 0 && (
                                                    <span className="shrink-0 rounded bg-[#e8e4dc] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[#77736c]">
                                                        Draft
                                                    </span>
                                                )}
                                            </Link>
                                        </div>

                                        {/* Right Side: Page Settings Button (Gear ⚙️) */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openPageSettings(item);
                                                }}
                                                title={`Settings: ${item.title}`}
                                                className="flex h-6 w-6 items-center justify-center rounded text-[#8a857d] hover:bg-white hover:text-[#171717] hover:shadow-sm transition-all"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </nav>

                {/* Footer Quick Links */}
                <div className="border-t border-[#e5e0d8] p-3 text-[10px] text-[#8a857d]">
                    <div className="flex items-center justify-between px-2">
                        <span>Total pages: {pages.length}</span>
                        <Link href="/admin/settings" className="hover:text-[#171717] underline">
                            Site Settings →
                        </Link>
                    </div>
                </div>
            </aside>

            {/* ADD NEW PAGE MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg border border-[#d8d3ca] bg-[#fbfaf7] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Page Builder</p>
                                <h3 className="mt-0.5 font-serif text-xl text-[#171717]">Add New Page</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-lg text-[#8a857d] hover:text-[#171717]"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePage} className="mt-5 space-y-4">
                            {addError && (
                                <p className="rounded bg-red-50 p-2.5 text-xs text-red-600">{addError}</p>
                            )}

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1.5 font-medium">
                                    Page Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g. Services, Team, Journal, Films"
                                    value={newPageTitle}
                                    onChange={(e) => handleNewTitleChange(e.target.value)}
                                    className="w-full rounded border border-[#d8d3ca] bg-white px-3 py-2 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1.5 font-medium">
                                    URL Slug
                                </label>
                                <div className="flex items-center rounded border border-[#d8d3ca] bg-white px-3 py-2 text-sm text-[#171717] focus-within:border-[#171717]">
                                    <span className="text-xs text-[#8a857d] select-none">/</span>
                                    <input
                                        type="text"
                                        placeholder="page-slug"
                                        value={newPageSlug}
                                        onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                                        className="w-full bg-transparent pl-1 text-sm focus:outline-none"
                                    />
                                </div>
                                <p className="mt-1 text-[10px] text-[#8a857d]">
                                    Page will be accessible at: thescenestudio.asia/{newPageSlug || "..."}
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e0d8]">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="rounded border border-[#d8d3ca] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#6f6a61] hover:bg-[#eeece6]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newPageTitle.trim()}
                                    className="rounded bg-[#171717] px-5 py-2 text-xs uppercase tracking-[0.12em] text-white hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    {creating ? "Creating…" : "Create Page"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAGE SETTINGS MODAL */}
            {isSettingsModalOpen && editingPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-lg border border-[#d8d3ca] bg-[#fbfaf7] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Page Settings</p>
                                <h3 className="mt-0.5 font-serif text-xl text-[#171717]">{editingPage.title}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSettingsModalOpen(false)}
                                className="text-lg text-[#8a857d] hover:text-[#171717]"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
                            {settingsError && (
                                <p className="rounded bg-red-50 p-2.5 text-xs text-red-600">{settingsError}</p>
                            )}

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1.5 font-medium">
                                    Page Navigation Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={settingTitle}
                                    onChange={(e) => setSettingTitle(e.target.value)}
                                    className="w-full rounded border border-[#d8d3ca] bg-white px-3 py-2 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1.5 font-medium">
                                    URL Slug
                                </label>
                                <div className={`flex items-center rounded border border-[#d8d3ca] px-3 py-2 text-sm ${
                                    editingPage.slug === "home" ? "bg-[#f2f0eb] text-[#8a857d]" : "bg-white text-[#171717] focus-within:border-[#171717]"
                                }`}>
                                    <span className="text-xs text-[#8a857d] select-none">/</span>
                                    <input
                                        type="text"
                                        disabled={editingPage.slug === "home"}
                                        value={settingSlug}
                                        onChange={(e) => setSettingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                                        className="w-full bg-transparent pl-1 text-sm focus:outline-none disabled:cursor-not-allowed"
                                    />
                                </div>
                                {editingPage.slug === "home" ? (
                                    <p className="mt-1 text-[10px] text-[#8a857d]">The homepage slug is fixed and cannot be changed.</p>
                                ) : (
                                    <p className="mt-1 text-[10px] text-[#8a857d]">Public URL: thescenestudio.asia/{settingSlug}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1.5 font-medium">
                                    Publishing Status
                                </label>
                                <div className="flex items-center gap-4 text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="publishedStatus"
                                            checked={settingPublished}
                                            onChange={() => setSettingPublished(true)}
                                            className="accent-[#171717]"
                                        />
                                        <span>Published (Live on website)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="publishedStatus"
                                            checked={!settingPublished}
                                            onChange={() => setSettingPublished(false)}
                                            className="accent-[#171717]"
                                        />
                                        <span>Draft (Hidden)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-[#e5e0d8] pt-4">
                                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a857d] mb-3 font-medium">
                                    Search Engine Optimization (SEO)
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1 font-medium">
                                            SEO Title
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={`${settingTitle} — The Scene Studio`}
                                            value={settingSeoTitle}
                                            onChange={(e) => setSettingSeoTitle(e.target.value)}
                                            className="w-full rounded border border-[#d8d3ca] bg-white px-3 py-2 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6f6a61] mb-1 font-medium">
                                            SEO Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Page summary for search engines and social shares"
                                            value={settingSeoDescription}
                                            onChange={(e) => setSettingSeoDescription(e.target.value)}
                                            className="w-full rounded border border-[#d8d3ca] bg-white px-3 py-2 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone: Delete Page */}
                            {editingPage.slug !== "home" && editingPage.page_type !== "home" && (
                                <div className="border-t border-[#e5e0d8] pt-4">
                                    <div className="flex items-center justify-between rounded border border-red-200 bg-red-50/50 p-3">
                                        <div>
                                            <p className="text-xs font-medium text-red-800">Delete this page</p>
                                            <p className="text-[10px] text-red-600">Permanently removes this page and all its blocks.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDeletePage}
                                            disabled={deletingPage}
                                            className="rounded border border-red-300 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deletingPage ? "Deleting…" : "Delete Page"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e0d8]">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsModalOpen(false)}
                                    className="rounded border border-[#d8d3ca] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#6f6a61] hover:bg-[#eeece6]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings || !settingTitle.trim()}
                                    className="rounded bg-[#171717] px-5 py-2 text-xs uppercase tracking-[0.12em] text-white hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    {savingSettings ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}