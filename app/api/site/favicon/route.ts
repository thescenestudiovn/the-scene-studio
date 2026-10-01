import { getSiteSettings } from "../../../../../lib/site-settings";
import { mediaUrl } from "../../../../../lib/media";

export async function GET(request: Request) {
  try {
    const settings = await getSiteSettings();
    const value = settings.favicon || settings.logo;

    if (!value) {
      return new Response("Favicon is not configured", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const target = new URL(mediaUrl(value), request.url);
    return Response.redirect(target, 302);
  } catch (error) {
    console.error("GET /api/site/favicon error:", error);
    return new Response("Failed to load favicon", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
