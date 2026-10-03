"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSiteMenu from "./components/AdminSiteMenu";
import { AdminEditorProvider } from "./components/AdminEditorContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/admin/pages/")
    ? pathname.split("/").at(-1) ?? "home"
    : pathname.startsWith("/admin/gallery")
      ? "gallery"
      : pathname.startsWith("/admin/stories")
        ? "stories"
        : pathname.startsWith("/admin/settings")
          ? "settings"
          : "";

  const topNav = [
    { label: "Stories", href: "/admin/stories", active: pathname.startsWith("/admin/stories") },
    { label: "Gallery", href: "/admin/gallery", active: pathname.startsWith("/admin/gallery") },
    { label: "Settings", href: "/admin/settings", active: pathname.startsWith("/admin/settings") },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-[#ddd7cd] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="flex min-h-[64px] items-center gap-8 px-5 md:px-8">
          <Link href="/admin/pages/home" className="shrink-0 text-[11px] uppercase tracking-[0.2em]">
            The Scene Studio <span className="text-[#99958e]">/ Admin</span>
          </Link>
          <nav aria-label="Admin sections" className="hidden items-stretch gap-7 md:flex">
            {topNav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}
                className={`flex min-h-[64px] items-center border-b text-[10px] uppercase tracking-[0.16em] transition-colors ${item.active ? "border-[#171717] text-[#171717]" : "border-transparent text-[#77736c] hover:text-[#171717]"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <Link href="/" target="_blank" className="text-[10px] uppercase tracking-[0.14em] text-[#77736c] hover:text-[#171717]">View website ↗</Link>
          </div>
        </div>
        <nav aria-label="Admin sections mobile" className="flex overflow-x-auto border-t border-[#e5e0d8] px-5 md:hidden">
          {topNav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}
              className={`shrink-0 border-b px-4 py-3 text-[10px] uppercase tracking-[0.16em] ${item.active ? "border-[#171717] text-[#171717]" : "border-transparent text-[#77736c]"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <AdminEditorProvider>
        <div className="flex min-h-[calc(100dvh-64px)] flex-col lg:flex-row">
          <AdminSiteMenu activeSlug={activeSlug} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </AdminEditorProvider>
    </div>
  );
}
