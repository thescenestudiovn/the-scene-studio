"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSiteMenu from "./components/AdminSiteMenu";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/admin/pages/") ? pathname.split("/").at(-1) ?? "home" : pathname.startsWith("/admin/gallery") ? "gallery" : pathname.startsWith("/admin/stories") ? "stories" : "";

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-[#ddd7cd] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="flex min-h-[64px] items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/admin" className="shrink-0 text-[11px] uppercase tracking-[0.2em]">
            The Scene Studio <span className="text-[#99958e]">/ Admin</span>
          </Link>
          <Link href="/" target="_blank" className="text-[10px] uppercase tracking-[0.14em] text-[#77736c] hover:text-[#171717]">View website ↗</Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-64px)] flex-col lg:flex-row">
        <AdminSiteMenu activeSlug={activeSlug} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
