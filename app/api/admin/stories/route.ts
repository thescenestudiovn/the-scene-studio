import { getDB } from "@/lib/db";

type CreateStoryBody = {
  title?: string;
  slug?: string;
  location?: string | null;
  date?: string | null;
  category?: string | null;
  description?: string | null;
  destination_id?: string | null;
};

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(`
      SELECT s.id,s.slug,s.title,s.location,s.date,s.category,s.description,s.destination_id,
             s.published,s.created_at,s.updated_at,d.name AS destination_name,d.country AS destination_country
      FROM stories s LEFT JOIN destinations d ON d.id=s.destination_id ORDER BY s.created_at DESC
    `).all();
    return Response.json({ success: true, stories: result.results });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStoryBody;
    const { title, slug, location=null, date=null, category=null, description=null, destination_id=null } = body;
    if (!title || !slug) return Response.json({ success:false, error:"title and slug are required" }, { status:400 });
    const db=getDB(); const id=crypto.randomUUID();
    await db.prepare(`INSERT INTO stories (id,slug,title,location,date,category,description,destination_id,published) VALUES (?,?,?,?,?,?,?,?,0)`)
      .bind(id,slug,title,location,date,category,description,destination_id).run();
    const story=await db.prepare(`SELECT * FROM stories WHERE id=? LIMIT 1`).bind(id).first();
    return Response.json({ success:true, story });
  } catch (error) {
    console.error(error);
    return Response.json({ success:false,error:"Failed to create story" },{status:500});
  }
}

export async function DELETE(request: Request) {
  try {
    const body=(await request.json()) as { id?: string };
    if (!body.id) return Response.json({ success:false,error:"id is required" },{status:400});
    const db=getDB();
    const result=await db.prepare(`DELETE FROM stories WHERE id=?`).bind(body.id).run();
    if (!result.meta.changes) return Response.json({ success:false,error:"Story not found" },{status:404});
    return Response.json({ success:true, deleted:body.id });
  } catch(error) {
    console.error("DELETE /api/admin/stories error:",error);
    return Response.json({ success:false,error:"Failed to delete story" },{status:500});
  }
}
