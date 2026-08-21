import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

function getMediaUrl(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("path");
  if (!rawPath) return null;

  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (cleanPath.includes("..")) return null;

  return `${MEDIA_BASE_URL}${cleanPath}`;
}

async function fetchOrigin(url: string) {
  return fetch(url, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });
}

function responseHeaders(origin: Response) {
  const headers = new Headers();
  headers.set("Content-Type", origin.headers.get("content-type") || "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");

  const contentLength = origin.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return headers;
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
    const origin = await fetchOrigin(url);

    if (!origin.ok) {
      return new Response(`Media origin returned ${origin.status}`, {
        status: origin.status || 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Do not stream the NAS response through OpenNext. Materializing the
    // response body avoids the intermittent 500s seen with the edge adapter
    // when proxying the TNAS/Cloudflare response stream.
    const body = await origin.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: responseHeaders(origin),
    });
  } catch (error) {
    console.error("Media proxy failed", error);
    return new Response("Media proxy failed", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function HEAD(request: NextRequest) {
  const url = getMediaUrl(request);

  if (!url) return new Response(null, { status: 400 });

  try {
    const origin = await fetchOrigin(url);

    if (!origin.ok) {
      return new Response(null, { status: origin.status || 502 });
    }

    return new Response(null, {
      status: 200,
      headers: responseHeaders(origin),
    });
  } catch (error) {
    console.error("Media HEAD proxy failed", error);
    return new Response(null, { status: 502 });
  }
}
