"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSiteMenu from "./components/AdminSiteMenu";

const NAV_ITEMS = [
  { label: "Admin", href: "/admin", match: (p: string) => p === "/admin" || p.startsWith("/admin/pages") },
  { label: "Stories", href: "/admin/stories", match: (p: string) => p.startsWith("/admin/stories") || p.startsWith("/admin/story") },
  { label: "Gallery", href: "/admin/gallery", match: (p: string) => p.startsWith("/admin/gallery") || p.startsWith("/admin/collections") },
  { label: "Settings", href: "/admin/settings", match: (p: string) => p.startsWith("/admin/settings") },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPagesSection = pathname === "/admin" || pathname.startsWith("/admin/pages");
  const activeSlug = pathname.startsWith("/admin/pages/") ? pathname.split("/").at(-1) ?? "home" : "";

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-[#ddd7cd] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="flex min-h-[64px] items-center justify-between gap-6 px-5 md:px-8">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/admin" className="shrink-0 text-[11px] font-medium uppercase tracking-[0.2em]">
              The Scene Studio <span className="text-[#99958e]">/ Admin</span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map(item => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "border-b-2 border-[#171717] font-medium text-[#171717]"
                        : "text-[#77736c] hover:text-[#171717]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Link href="/" target="_blank" className="text-[10px] uppercase tracking-[0.14em] text-[#77736c] hover:text-[#171717]">
            View website ↗
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-64px)] flex-col lg:flex-row">
        {isPagesSection && <AdminSiteMenu activeSlug={activeSlug} />}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
