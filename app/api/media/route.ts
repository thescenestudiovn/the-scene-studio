import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

export async function GET(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("path");

  if (!rawPath) {
    return new Response("Missing media path", { status: 400 });
  }

  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const url = new URL(path, MEDIA_BASE_URL);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });

    if (!response.ok || !response.body) {
      return new Response(`Media origin returned ${response.status}`, {
        status: response.status || 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cross-Origin-Resource-Policy", "cross-origin");

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(response.body, { status: 200, headers });
  } catch (error) {
    console.error("Media proxy failed:", error);
    return new Response("Media proxy failed", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
