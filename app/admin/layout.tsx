"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["Dashboard", "/admin"],
  ["Destinations", "/admin/destinations"],
  ["Gallery", "/admin/gallery"],
  ["Stories", "/admin/stories"],
  ["Pages", "/admin/pages"],
  ["View Gallery ↗", "/gallery"],
  ["View site ↗", "/"],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", color: "#111" }}>
      <header style={{ borderBottom: "1px solid #e8e8e8", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-brand" onClick={() => setOpen(false)}>
            The Scene Studio
          </Link>

          <nav className="admin-desktop-nav" aria-label="Admin navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={label === "View site ↗" ? { ...navStyle, marginLeft: 8, borderLeft: "1px solid #ddd", paddingLeft: 18 } : navStyle}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="admin-menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {open && (
          <nav className="admin-mobile-nav" aria-label="Mobile admin navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="admin-mobile-link" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {children}

      <style jsx>{`
        .admin-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .admin-brand {
          color: inherit;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .admin-desktop-nav {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          min-width: 0;
        }

        .admin-menu-button,
        .admin-mobile-nav {
          display: none;
        }

        @media (max-width: 900px) {
          .admin-header-inner {
            min-height: 60px;
            padding: 0 18px;
          }

          .admin-desktop-nav {
            display: none;
          }

          .admin-menu-button {
            width: 40px;
            height: 40px;
            padding: 8px;
            border: 0;
            background: transparent;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            cursor: pointer;
          }

          .admin-menu-button span {
            display: block;
            width: 24px;
            height: 1.5px;
            background: #111;
          }

          .admin-mobile-nav {
            display: flex;
            flex-direction: column;
            width: 100%;
            border-top: 1px solid #e8e8e8;
            background: #fff;
            padding: 8px 18px 16px;
          }

          .admin-mobile-link {
            color: #333;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.3;
            padding: 14px 4px;
            border-bottom: 1px solid #eee;
          }

          .admin-mobile-link:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}

const navStyle: React.CSSProperties = {
  color: "#555",
  textDecoration: "none",
  fontSize: 13,
  padding: "8px 10px",
  whiteSpace: "nowrap",
};
