import { getDB } from "../../../../lib/db";

async function ensureSchema(db: ReturnType<typeof getDB>) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      page_type TEXT NOT NULL,
      seo_title TEXT,
      seo_description TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const columns = await db.prepare("PRAGMA table_info(pages)").all();
  const existing = new Set((columns.results ?? []).map((column) => String(column.name)));
  const additions = [
    ["homepage", "INTEGER NOT NULL DEFAULT 0"],
    ["menu_order", "INTEGER NOT NULL DEFAULT 0"],
    ["menu_visibility", "TEXT NOT NULL DEFAULT 'visible'"],
    ["page_status", "TEXT NOT NULL DEFAULT 'online'"],
    ["password", "TEXT"],
    ["show_header_footer", "INTEGER NOT NULL DEFAULT 1"],
    ["noindex", "INTEGER NOT NULL DEFAULT 0"],
    ["social_image", "TEXT"],
  ] as const;

  for (const [name, definition] of additions) {
    if (!existing.has(name)) await db.prepare(`ALTER TABLE pages ADD COLUMN ${name} ${definition}`).run();
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS page_blocks (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      type TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-home','home','Home','home',1,1,0,'visible','online')`),
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-about','about','About','about',1,0,1,'visible','online')`),
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-stories','stories','Stories','page',1,0,2,'visible','online')`),
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-gallery','gallery','Gallery','page',1,0,3,'visible','online')`),
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-film','film','Film','page',1,0,4,'visible','online')`),
    db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,seo_title,seo_description,published,homepage,menu_order,menu_visibility,page_status) VALUES ('page-contact','contact','Contact','contact','Contact — The Scene Studio','Contact The Scene Studio for destination wedding photography and films in Vietnam and beyond.',1,0,5,'visible','online')`),
  ]);

  const homepage = await db.prepare("SELECT id FROM pages WHERE homepage = 1 LIMIT 1").first();
  if (!homepage) await db.prepare("UPDATE pages SET homepage = 1 WHERE slug = 'home'").run();
}

export async function GET() {
  try {
    const db = getDB();
    await ensureSchema(db);
    const pages = await db.prepare(`SELECT * FROM pages ORDER BY menu_order ASC, created_at ASC`).all();
    return Response.json({ success: true, pages: pages.results });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      title?: string;
      slug?: string;
      duplicate_from_id?: string;
    };
    const db = getDB();
    await ensureSchema(db);

    const title = body.title?.trim() || "New Page";
    const baseSlug = (body.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-page");
    let slug = baseSlug;
    let suffix = 2;
    while (await db.prepare("SELECT id FROM pages WHERE slug = ?").bind(slug).first()) {
      slug = `${baseSlug}-${suffix++}`;
    }

    let menuOrder = 0;
    let menuVisibility: "visible" | "hidden" | "footer" = "visible";

    if (body.duplicate_from_id) {
      const source = await db.prepare("SELECT id,menu_order,menu_visibility FROM pages WHERE id = ?").bind(body.duplicate_from_id).first<{ id: string; menu_order: number; menu_visibility: "visible" | "hidden" | "footer" }>();
      if (source) {
        menuOrder = Number(source.menu_order ?? 0) + 1;
        menuVisibility = source.menu_visibility ?? "visible";

        await db.prepare("UPDATE pages SET menu_order = menu_order + 1 WHERE menu_visibility = ? AND menu_order > ?")
          .bind(menuVisibility, Number(source.menu_order ?? 0)).run();
      }
    } else {
      const maxOrder = await db.prepare("SELECT COALESCE(MAX(menu_order), -1) AS max_order FROM pages WHERE menu_visibility = 'visible'").first<{ max_order: number }>();
      menuOrder = Number(maxOrder?.max_order ?? -1) + 1;
    }

    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO pages (id,slug,title,page_type,seo_title,seo_description,published,homepage,menu_order,menu_visibility,page_status,show_header_footer,noindex,menu_config)
      VALUES (?, ?, ?, 'page', NULL, NULL, 1, 0, ?, ?, 'online', 1, 0, '')
    `).bind(id, slug, title, menuOrder, menuVisibility).run();

    if (body.duplicate_from_id) {
      const source = await db.prepare("SELECT id FROM pages WHERE id = ?").bind(body.duplicate_from_id).first<{ id: string }>();
      if (source) {
        const blocks = await db.prepare("SELECT id,type,sort_order,data FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC").bind(source.id).all();
        for (const block of blocks.results ?? []) {
          await db.prepare("INSERT INTO page_blocks (id,page_id,type,sort_order,data) VALUES (?,?,?,?,?)")
            .bind(crypto.randomUUID(), id, block.type, block.sort_order, block.data).run();
        }
      }
    }

    const page = await db.prepare("SELECT * FROM pages WHERE id = ?").bind(id).first();
    return Response.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/pages error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Failed to create page" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as {
      id?: string;
      title?: string;
      slug?: string;
      seo_title?: string | null;
      seo_description?: string | null;
      homepage?: boolean;
      menu_order?: number;
      menu_visibility?: "visible" | "hidden" | "footer";
      page_status?: "online" | "offline" | "password";
      password?: string | null;
      show_header_footer?: boolean;
      noindex?: boolean;
      social_image?: string | null;
      menu_config?: string | null;
      blocks?: Array<{ id?: string; type: string; data?: Record<string, unknown>; sort_order?: number }>;
    };
    if (!body.id) return Response.json({ success: false, error: "id is required" }, { status: 400 });

    const db = getDB();
    await ensureSchema(db);
    const current = await db.prepare("SELECT * FROM pages WHERE id = ?").bind(body.id).first<Record<string, unknown>>();
    if (!current) return Response.json({ success: false, error: "Page not found" }, { status: 404 });

    if (body.slug && body.slug !== current.slug) {
      const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
      const collision = await db.prepare("SELECT id FROM pages WHERE slug = ? AND id != ?").bind(slug, body.id).first();
      if (collision) return Response.json({ success: false, error: "URL slug is already in use" }, { status: 409 });
      body.slug = slug || String(current.slug);
    }

    if (body.homepage === true) {
      await db.prepare("UPDATE pages SET homepage = 0 WHERE id != ?").bind(body.id).run();
    } else if (body.homepage === false && Number(current.homepage) === 1) {
      return Response.json({ success: false, error: "A homepage must always be selected" }, { status: 400 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => { fields.push(`${column} = ?`); values.push(value); };

    if (body.title !== undefined) set("title", body.title.trim() || "Untitled Page");
    if (body.slug !== undefined) set("slug", body.slug);
    if (body.seo_title !== undefined) set("seo_title", body.seo_title);
    if (body.seo_description !== undefined) set("seo_description", body.seo_description);
    if (body.homepage !== undefined) set("homepage", body.homepage ? 1 : 0);
    if (body.menu_order !== undefined) set("menu_order", body.menu_order);
    if (body.menu_visibility !== undefined) set("menu_visibility", body.menu_visibility);
    if (body.page_status !== undefined) {
      set("page_status", body.page_status);
      set("published", body.page_status === "online" ? 1 : 0);
    }
    if (body.password !== undefined) set("password", body.password);
    if (body.show_header_footer !== undefined) set("show_header_footer", body.show_header_footer ? 1 : 0);
    if (body.noindex !== undefined) set("noindex", body.noindex ? 1 : 0);
    if (body.social_image !== undefined) set("social_image", body.social_image);
    if (body.menu_config !== undefined) set("menu_config", body.menu_config ?? "");

    if (fields.length) {
      fields.push("updated_at = CURRENT_TIMESTAMP");
      await db.prepare(`UPDATE pages SET ${fields.join(", ")} WHERE id = ?`).bind(...values, body.id).run();
    }

    if (body.blocks) {
      await db.prepare("DELETE FROM page_blocks WHERE page_id = ?").bind(body.id).run();
      for (let i = 0; i < body.blocks.length; i++) {
        const block = body.blocks[i];
        await db.prepare("INSERT INTO page_blocks (id,page_id,type,sort_order,data) VALUES (?,?,?,?,?)")
          .bind(block.id ?? crypto.randomUUID(), body.id, block.type, block.sort_order ?? i, JSON.stringify(block.data ?? {})).run();
      }
    }

    const page = await db.prepare("SELECT * FROM pages WHERE id = ?").bind(body.id).first();
    return Response.json({ success: true, page });
  } catch (error) {
    console.error("PATCH /api/admin/pages error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Failed to save page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB();
    await ensureSchema(db);
    const page = await db.prepare("SELECT id,homepage FROM pages WHERE id = ?").bind(body.id).first<{ id: string; homepage: number }>();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });
    if (Number(page.homepage) === 1) return Response.json({ success: false, error: "The homepage cannot be deleted" }, { status: 400 });
    await db.prepare("DELETE FROM pages WHERE id = ?").bind(body.id).run();
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/pages error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Failed to delete page" }, { status: 500 });
  }
}
