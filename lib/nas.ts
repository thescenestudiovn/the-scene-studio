const NAS_WEBDAV_URL = process.env.NAS_WEBDAV_URL || "";
const NAS_USERNAME = process.env.NAS_USERNAME || "";
const NAS_PASSWORD = process.env.NAS_PASSWORD || "";

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function authHeader() {
  if (!NAS_USERNAME || !NAS_PASSWORD) return undefined;
  return `Basic ${btoa(`${NAS_USERNAME}:${NAS_PASSWORD}`)}`;
}

export function nasConfigured() {
  return Boolean(NAS_WEBDAV_URL && NAS_USERNAME && NAS_PASSWORD);
}

export async function uploadToNas(path: string, file: File) {
  if (!nasConfigured()) {
    throw new Error("NAS upload is not configured. Set NAS_WEBDAV_URL, NAS_USERNAME and NAS_PASSWORD.");
  }

  const url = joinUrl(NAS_WEBDAV_URL, path);
  const headers = new Headers();
  headers.set("Content-Type", file.type || "application/octet-stream");
  const authorization = authHeader();
  if (authorization) headers.set("Authorization", authorization);

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: file.stream(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`NAS upload failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }

  return url;
}

export function sanitizeNasPath(value: string) {
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== "." && part !== "..");
  return parts.map((part) => encodeURIComponent(part)).join("/");
}
