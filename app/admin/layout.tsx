"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const groups = [
  {
    label: "Content",
    links: [
      ["Stories", "/admin/stories"],
      ["Pages", "/admin/pages"],
    ],
  },
  {
    label: "Library",
    links: [
      ["Media", "/admin/gallery"],
      ["Destinations", "/admin/destinations"],
    ],
  },
  {
    label: "System",
    links: [["Settings", "/admin/settings"]],
  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-[#ddd7cd] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[64px] max-w-[1500px] items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/admin" className="shrink-0 text-[11px] uppercase tracking-[0.2em]" onClick={() => setOpen(false)}>
            The Scene Studio <span className="text-[#99958e]">/ Admin</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Admin navigation">
            {groups.map((group) => (
              <div key={group.label} className="flex items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#aaa59c]">{group.label}</span>
                {group.links.map(([label, href]) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link key={href} href={href} className={`text-[11px] transition-colors ${active ? "text-[#171717]" : "text-[#77736c] hover:text-[#171717]"}`}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <span className="h-4 w-px bg-[#d8d3ca]" />
            <Link href="/" target="_blank" className="text-[10px] uppercase tracking-[0.14em] text-[#77736c] hover:text-[#171717]">
              View site ↗
            </Link>
          </nav>

          <button type="button" className="flex h-9 w-9 flex-col justify-center gap-1.5 lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(value => !value)}>
            <span className="h-px w-6 bg-[#171717]" />
            <span className="h-px w-6 bg-[#171717]" />
            <span className="h-px w-6 bg-[#171717]" />
          </button>
        </div>

        {open && (
          <nav className="border-t border-[#ddd7cd] bg-white px-5 py-4 lg:hidden" aria-label="Mobile admin navigation">
            <Link href="/admin" className="block border-b border-[#eeeae3] py-3 text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
            {groups.map(group => (
              <div key={group.label} className="border-b border-[#eeeae3] py-3 last:border-0">
                <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#aaa59c]">{group.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} className="py-1 text-sm" onClick={() => setOpen(false)}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/" target="_blank" className="block pt-3 text-[10px] uppercase tracking-[0.14em] text-[#77736c]" onClick={() => setOpen(false)}>View site ↗</Link>
          </nav>
        )}
      </header>

      {children}
    </div>
  );
}
