import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = getDB();
    const result = await db
      .prepare(`
        SELECT id, name, country, country_name, slug
        FROM destinations
        ORDER BY country_name, name
      `)
      .all();

    return Response.json({ success: true, destinations: result.results });
  } catch (error) {
    console.error("GET /api/admin/destinations error:", error);
    return Response.json({ success: false, error: "Failed to fetch destinations" }, { status: 500 });
  }
}
