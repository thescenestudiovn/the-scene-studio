import { NextRequest } from "next/server";

const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path || !path.startsWith("/")) {
    return new Response("Invalid media path", { status: 400 });
  }

  const url = `${MEDIA_BASE_URL}${path}`;

  console.log("MEDIA PROXY:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    console.log("MEDIA RESPONSE:", response.status);

    if (!response.ok) {
      return new Response(`Origin returned ${response.status}`, {
        status: response.status,
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("MEDIA PROXY ERROR:", error);

    return new Response("Media proxy failed", {
      status: 502,
    });
  }
}