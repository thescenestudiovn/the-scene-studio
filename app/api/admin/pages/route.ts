import { getDBAsync } from "../../../../lib/db";

async function ensurePagesTable(db: D1Database) {
  try {
    await db.prepare(`ALTER TABLE pages ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`).run();
  } catch {
    // Column already exists
  }
}

export async function GET() {
  try {
    const db = await getDBAsync();
    await ensurePagesTable(db);
    const pages = await db
      .prepare(`SELECT id, slug, title, page_type, seo_title, seo_description, published, sort_order, created_at, updated_at FROM pages ORDER BY sort_order ASC, created_at ASC`)
      .all();
    return Response.json({ success: true, pages: pages.results });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string; slug?: string };
    const rawTitle = (body.title ?? "").trim();
    if (!rawTitle) {
      return Response.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    let slug = (body.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      slug = rawTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (!slug) slug = `page-${Date.now()}`;

    const db = await getDBAsync();
    await ensurePagesTable(db);

    // Check slug uniqueness
    const existing = await db.prepare(`SELECT id FROM pages WHERE slug = ? LIMIT 1`).bind(slug).first();
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 899 + 100)}`;
    }

    const maxOrderRow = await db.prepare(`SELECT MAX(sort_order) as max_order FROM pages`).first<{ max_order: number | null }>();
    const nextOrder = (maxOrderRow?.max_order ?? 0) + 10;

    const id = `page-${crypto.randomUUID()}`;
    await db.prepare(`
      INSERT INTO pages (id, slug, title, page_type, sort_order, published, created_at, updated_at)
      VALUES (?, ?, ?, 'custom', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(id, slug, rawTitle, nextOrder).run();

    const newPage = await db.prepare(`SELECT * FROM pages WHERE id = ?`).bind(id).first();
    return Response.json({ success: true, page: newPage });
  } catch (error) {
    console.error("POST /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to create page" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      slug?: string;
      published?: boolean | number;
      seo_title?: string | null;
      seo_description?: string | null;
      action?: string;
      page_ids?: string[];
      blocks?: Array<{ id?: string; type: string; data?: Record<string, unknown>; sort_order?: number }>;
    };

    const db = await getDBAsync();
    await ensurePagesTable(db);

    // Reorder pages
    if (body.action === "reorder" && Array.isArray(body.page_ids)) {
      for (let i = 0; i < body.page_ids.length; i++) {
        await db.prepare(`UPDATE pages SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .bind((i + 1) * 10, body.page_ids[i])
          .run();
      }
      return Response.json({ success: true });
    }

    if (!body.id) return Response.json({ success: false, error: "id is required" }, { status: 400 });

    const page = await db.prepare(`SELECT id, slug, page_type FROM pages WHERE id = ? LIMIT 1`).bind(body.id).first<{ id: string; slug: string; page_type: string }>();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });

    // Validate slug changes
    let newSlug: string | undefined = undefined;
    if (body.slug !== undefined) {
      const sanitized = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (page.page_type === "home" && sanitized !== "home") {
        return Response.json({ success: false, error: "The homepage slug cannot be changed" }, { status: 400 });
      }
      if (sanitized && sanitized !== page.slug) {
        const conflict = await db.prepare(`SELECT id FROM pages WHERE slug = ? AND id != ? LIMIT 1`).bind(sanitized, page.id).first();
        if (conflict) {
          return Response.json({ success: false, error: `The URL slug '${sanitized}' is already in use` }, { status: 400 });
        }
        newSlug = sanitized;
      }
    }

    if (page.page_type === "home" && body.blocks && body.blocks[0]?.type !== "cover") {
      return Response.json({ success: false, error: "Home must start with a cover block" }, { status: 400 });
    }

    const publishedVal = body.published !== undefined ? (body.published ? 1 : 0) : null;

    await db.prepare(`
      UPDATE pages
      SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description),
        published = COALESCE(?, published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title !== undefined ? body.title.trim() : null,
      newSlug ?? null,
      body.seo_title !== undefined ? body.seo_title : null,
      body.seo_description !== undefined ? body.seo_description : null,
      publishedVal,
      body.id
    ).run();

    if (body.blocks) {
      await db.prepare(`DELETE FROM page_blocks WHERE page_id = ?`).bind(body.id).run();
      for (let i = 0; i < body.blocks.length; i++) {
        const block = body.blocks[i];
        await db.prepare(`INSERT INTO page_blocks (id, page_id, type, sort_order, data) VALUES (?, ?, ?, ?, ?)`).bind(
          block.id ?? crypto.randomUUID(),
          body.id,
          block.type,
          block.sort_order ?? i,
          JSON.stringify(block.data ?? {})
        ).run();
      }
    }

    const updated = await db.prepare(`SELECT * FROM pages WHERE id = ?`).bind(body.id).first();
    return Response.json({ success: true, page: updated });
  } catch (error) {
    console.error("PATCH /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to save page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ success: false, error: "id parameter is required" }, { status: 400 });

    const db = await getDBAsync();
    const page = await db.prepare(`SELECT id, slug, page_type FROM pages WHERE id = ? LIMIT 1`).bind(id).first<{ id: string; slug: string; page_type: string }>();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });

    if (page.page_type === "home" || page.slug === "home") {
      return Response.json({ success: false, error: "The homepage cannot be deleted" }, { status: 400 });
    }

    await db.prepare(`DELETE FROM page_blocks WHERE page_id = ?`).bind(page.id).run();
    await db.prepare(`DELETE FROM pages WHERE id = ?`).bind(page.id).run();

    return Response.json({ success: true, deleted: page.id });
  } catch (error) {
    console.error("DELETE /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to delete page" }, { status: 500 });
  }
}
