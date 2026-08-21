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

async function serveMedia(request: NextRequest) {
  const url = getMediaUrl(request);

  if (!url) {
    return new Response("Missing or invalid media path", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    // Keep this as a normal Worker fetch. The previous implementation used
    // Cloudflare-specific `cf` fetch options, which can fail under the
    // OpenNext runtime. The NAS endpoint already sits behind Cloudflare.
    const origin = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "image/*,*/*;q=0.8" },
      cache: "no-store",
    });

    if (!origin.ok) {
      return new Response(`Media origin returned ${origin.status}`, {
        status: origin.status || 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const contentType = origin.headers.get("content-type") || "application/octet-stream";

    // Buffer the body so OpenNext/workerd does not have to forward the
    // origin ReadableStream directly to the browser.
    const body = await origin.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
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

export async function GET(request: NextRequest) {
  return serveMedia(request);
}

// Explicit HEAD support: some browsers/proxies probe image URLs before GET.
// We still fetch the origin to verify the resource exists, but don't send its body.
export async function HEAD(request: NextRequest) {
  const url = getMediaUrl(request);

  if (!url) {
    return new Response(null, { status: 400 });
  }

  try {
    const origin = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "image/*,*/*;q=0.8" },
      cache: "no-store",
    });

    if (!origin.ok) {
      return new Response(null, { status: origin.status || 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", origin.headers.get("content-type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cross-Origin-Resource-Policy", "cross-origin");

    const length = origin.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new Response(null, { status: 200, headers });
  } catch (error) {
    console.error("Media HEAD proxy failed:", error);
    return new Response(null, { status: 502 });
  }
}
