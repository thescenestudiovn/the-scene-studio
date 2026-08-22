import Link from "next/link";

export default function AdminPage() {
  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 28px 80px" }}>
      <div style={{ maxWidth: 760, marginBottom: 48 }}>
        <p style={{ margin: "0 0 10px", color: "#999", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>The Scene Studio</p>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1, fontWeight: 500, letterSpacing: -1.5 }}>Admin</h1>
        <p style={{ margin: "14px 0 0", color: "#777", fontSize: 15, lineHeight: 1.6 }}>Manage the content architecture: destinations, client collections, stories, pages and media.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}>
        <AdminCard href="/admin/destinations" number="01" title="Destinations" description="Shared SEO taxonomy used by Collections and Stories." />
        <AdminCard href="/admin/collections" number="02" title="Collections" description="One client gallery per collection, with its destination and media." />
        <AdminCard href="/admin/stories" number="03" title="Stories" description="Editorial stories built from flexible content blocks." />
        <AdminCard href="/admin/media" number="04" title="Media Library" description="Lightweight web images and video assets stored in Cloudflare R2." />
        <AdminCard href="/admin/pages" number="05" title="Pages" description="Build Home and About from the shared block editor." />
      </div>
    </main>
  );
}

function AdminCard({ href, number, title, description }: { href: string; number: string; title: string; description: string }) {
  return (
    <Link href={href} style={{ display: "block", minHeight: 220, padding: 28, border: "1px solid #e2e2e2", background: "#fff", color: "inherit", textDecoration: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 60, color: "#999", fontSize: 11, letterSpacing: 1.2 }}>{number}<span>↗</span></div>
      <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 500 }}>{title}</h2>
      <p style={{ maxWidth: 480, margin: 0, color: "#777", fontSize: 14, lineHeight: 1.6 }}>{description}</p>
    </Link>
  );
}
