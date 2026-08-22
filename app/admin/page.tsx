import Link from "next/link";

export default function AdminPage() {
  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 28px 80px" }}>
      <div style={{ maxWidth: 760, marginBottom: 48 }}>
        <p style={{ margin: "0 0 10px", color: "#999", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>The Scene Studio</p>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1, fontWeight: 500, letterSpacing: -1.5 }}>Admin</h1>
        <p style={{ margin: "14px 0 0", color: "#777", fontSize: 15, lineHeight: 1.6 }}>Manage stories and the image library for your website.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
        <AdminCard href="/admin/stories" number="01" title="Stories" description="Create, edit and arrange story content, blocks and galleries." />
        <AdminCard href="/admin/media" number="02" title="Media Library" description="Upload and manage the lightweight web images stored in Cloudflare R2." />
      </div>
    </main>
  );
}

function AdminCard({ href, number, title, description }: { href: string; number: string; title: string; description: string }) {
  return (
    <Link href={href} style={{ display: "block", minHeight: 220, padding: 28, border: "1px solid #e2e2e2", background: "#fff", color: "inherit", textDecoration: "none", transition: "border-color .2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 60, color: "#999", fontSize: 11, letterSpacing: 1.2 }}>{number}<span>↗</span></div>
      <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 500 }}>{title}</h2>
      <p style={{ maxWidth: 480, margin: 0, color: "#777", fontSize: 14, lineHeight: 1.6 }}>{description}</p>
    </Link>
  );
}
