const NAS_WEBDAV_URL = process.env.NAS_WEBDAV_URL || "";
const NAS_USERNAME = process.env.NAS_USERNAME || "";
const NAS_PASSWORD = process.env.NAS_PASSWORD || "";

function joinUrl(base: string, path = "") {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

function authHeader() {
  if (!NAS_USERNAME || !NAS_PASSWORD) return undefined;
  return `Basic ${btoa(`${NAS_USERNAME}:${NAS_PASSWORD}`)}`;
}

function requestHeaders(contentType?: string) {
  const headers = new Headers();
  if (contentType) headers.set("Content-Type", contentType);
  const authorization = authHeader();
  if (authorization) headers.set("Authorization", authorization);
  return headers;
}

export function nasConfigured() {
  return Boolean(NAS_WEBDAV_URL && NAS_USERNAME && NAS_PASSWORD);
}

async function ensureNasDirectories(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return;

  let current = "";
  for (const part of parts.slice(0, -1)) {
    current = current ? `${current}/${part}` : part;
    const response = await fetch(joinUrl(NAS_WEBDAV_URL, current), {
      method: "MKCOL",
      headers: requestHeaders(),
    });

    if (!response.ok && response.status !== 405) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `NAS directory creation failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
      );
    }
  }
}

export async function uploadToNas(path: string, file: File) {
  if (!nasConfigured()) {
    throw new Error("NAS upload is not configured. Set NAS_WEBDAV_URL, NAS_USERNAME and NAS_PASSWORD.");
  }

  const cleanPath = sanitizeNasPath(path);
  await ensureNasDirectories(cleanPath);

  const url = joinUrl(NAS_WEBDAV_URL, cleanPath);
  const response = await fetch(url, {
    method: "PUT",
    headers: requestHeaders(file.type || "application/octet-stream"),
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
