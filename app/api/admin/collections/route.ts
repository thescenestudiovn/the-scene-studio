import { getDB } from "../../../../lib/db";

export async function GET() {
  try {
    const db = getDB();

    const result = await db
      .prepare(`
        SELECT
          c.id,
          c.title,
          c.slug,
          c.description,
          c.destination_id,
          c.created_at,
          c.updated_at,
          d.name AS destination_name,
          d.country AS destination_country
        FROM collections c
        LEFT JOIN destinations d
          ON d.id = c.destination_id
        ORDER BY c.created_at DESC
      `)
      .all();

    return Response.json({
      success: true,
      collections: result.results,
    });
  } catch (error) {
    console.error("GET /api/admin/collections error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch collections",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      description?: string | null;
      destination_id?: string | null;
    };

    const {
      title,
      slug,
      description = null,
      destination_id = null,
    } = body;

    if (!title || !slug) {
      return Response.json(
        {
          success: false,
          error: "title and slug are required",
        },
        { status: 400 }
      );
    }

    const db = getDB();
    const id = crypto.randomUUID();

    await db
      .prepare(`
        INSERT INTO collections (
          id,
          title,
          slug,
          description,
          destination_id
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        title,
        slug,
        description,
        destination_id
      )
      .run();

    const collection = await db
      .prepare(`
        SELECT
          id,
          title,
          slug,
          description,
          destination_id,
          created_at,
          updated_at
        FROM collections
        WHERE id = ?
      `)
      .bind(id)
      .first();

    return Response.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("POST /api/admin/collections error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create collection",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      slug?: string;
      description?: string | null;
      destination_id?: string | null;
    };

    const {
      id,
      title,
      slug,
      description = null,
      destination_id = null,
    } = body;

    if (!id || !title || !slug) {
      return Response.json(
        {
          success: false,
          error: "id, title and slug are required",
        },
        { status: 400 }
      );
    }

    const db = getDB();

    const result = await db
      .prepare(`
        UPDATE collections
        SET
          title = ?,
          slug = ?,
          description = ?,
          destination_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        title,
        slug,
        description,
        destination_id,
        id
      )
      .run();

    if (!result.meta.changes) {
      return Response.json(
        {
          success: false,
          error: "Collection not found",
        },
        { status: 404 }
      );
    }

    const collection = await db
      .prepare(`
        SELECT
          id,
          title,
          slug,
          description,
          destination_id,
          created_at,
          updated_at
        FROM collections
        WHERE id = ?
      `)
      .bind(id)
      .first();

    return Response.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("PATCH /api/admin/collections error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to update collection",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as {
      id?: string;
    };

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    const db = getDB();

    const result = await db
      .prepare(`
        DELETE FROM collections
        WHERE id = ?
      `)
      .bind(id)
      .run();

    if (!result.meta.changes) {
      return Response.json(
        {
          success: false,
          error: "Collection not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      deleted: id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/collections error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to delete collection",
      },
      { status: 500 }
    );
  }
}
