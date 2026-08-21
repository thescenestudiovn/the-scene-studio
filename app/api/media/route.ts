import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

function getMediaUrl(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("path");
  if (!rawPath) return null;

  // Only allow relative media paths. This endpoint must never become an open proxy.
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (cleanPath.includes("..")) return null;

  return `${MEDIA_BASE_URL}${cleanPath}`;
}

export async function GET(request: NextRequest) {
  const url = getMediaUrl(request);

  if (!url) {
    return new Response("Missing or invalid media path", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    // Buffer the response instead of returning the origin ReadableStream.
    // This is more reliable with OpenNext/workerd when proxying through the
    // Worker to the NAS/Tunnel origin, especially for image responses.
    const origin = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
      cf: {
        cacheTtl: 86400,
        cacheEverything: true,
      },
    });

    if (!origin.ok) {
      return new Response(`Media origin returned ${origin.status}`, {
        status: origin.status || 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const contentType = origin.headers.get("content-type") || "application/octet-stream";
    const body = await origin.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch (error) {
    console.error("Media proxy failed:", error);
    return new Response("Media proxy failed", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
