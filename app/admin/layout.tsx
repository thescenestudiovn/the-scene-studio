import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", color: "#111" }}>
      <header style={{ borderBottom: "1px solid #e8e8e8", background: "#fff", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "none", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" }}>
            The Scene Studio
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/admin" style={navStyle}>Dashboard</Link>
            <Link href="/admin/stories" style={navStyle}>Stories</Link>
            <Link href="/admin/media" style={navStyle}>Media</Link>
            <Link href="/" target="_blank" style={{ ...navStyle, marginLeft: 8, borderLeft: "1px solid #ddd", paddingLeft: 18 }}>View site ↗</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

const navStyle: React.CSSProperties = {
  color: "#555",
  textDecoration: "none",
  fontSize: 13,
  padding: "8px 10px",
};
