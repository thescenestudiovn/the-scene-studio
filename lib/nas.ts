const NAS_UPLOAD_URL = (process.env.NAS_UPLOAD_URL || "").trim();
const NAS_UPLOAD_TOKEN = (process.env.NAS_UPLOAD_TOKEN || "").trim();

export function nasConfigured() {
  return Boolean(NAS_UPLOAD_URL && NAS_UPLOAD_TOKEN);
}

export function nasConfigurationError() {
  if (!NAS_UPLOAD_URL) return "NAS_UPLOAD_URL is not configured.";
  if (!NAS_UPLOAD_TOKEN) return "NAS_UPLOAD_TOKEN is not configured.";

  try {
    const url = new URL(NAS_UPLOAD_URL);
    if (url.protocol !== "https:") {
      return "NAS_UPLOAD_URL must use HTTPS.";
    }
    if (url.hostname === "media.thescenestudio.asia") {
      return "NAS_UPLOAD_URL points to the read-only media CDN. Point it to the private NAS upload API exposed through scene-nas instead.";
    }
  } catch {
    return "NAS_UPLOAD_URL is invalid.";
  }

  return null;
}

export function sanitizeNasPath(value: string) {
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== "." && part !== "..");
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

export async function uploadToNas(path: string, file: File) {
  const configurationError = nasConfigurationError();
  if (configurationError) throw new Error(configurationError);

  const cleanPath = sanitizeNasPath(path);
  if (!cleanPath.startsWith("collections/")) {
    throw new Error("NAS upload path must start with collections/");
  }

  const form = new FormData();
  form.set("path", cleanPath);
  form.set("file", file, file.name);

  const response = await fetch(NAS_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NAS_UPLOAD_TOKEN}`,
    },
    body: form,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  let payload: { success?: boolean; error?: string; path?: string } = {};

  if (contentType.includes("application/json")) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error(`NAS upload returned invalid JSON (${response.status})`);
    }
  }

  if (!response.ok || !payload.success) {
    const detail = payload.error || raw.slice(0, 500) || `HTTP ${response.status}`;
    throw new Error(`NAS upload failed (${response.status}): ${detail}`);
  }

  return payload.path || `/${cleanPath}`;
}
