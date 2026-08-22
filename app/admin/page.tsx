import Link from "next/link";

export default function AdminPage() {
  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ marginBottom: 8, opacity: 0.55, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>
          The Scene Studio
        </p>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <p style={{ marginTop: 12, opacity: 0.65 }}>
          Manage stories and the media library.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <Link
          href="/admin/stories"
          style={{ display: "block", padding: 24, border: "1px solid #ddd", color: "inherit", textDecoration: "none" }}
        >
          <h2 style={{ marginTop: 0 }}>Stories</h2>
          <p style={{ marginBottom: 0, opacity: 0.65 }}>Edit stories, blocks and galleries.</p>
        </Link>

        <Link
          href="/admin/media"
          style={{ display: "block", padding: 24, border: "1px solid #ddd", color: "inherit", textDecoration: "none" }}
        >
          <h2 style={{ marginTop: 0 }}>Media Library</h2>
          <p style={{ marginBottom: 0, opacity: 0.65 }}>Upload and manage images stored in Cloudflare R2.</p>
        </Link>
      </div>
    </main>
  );
}
