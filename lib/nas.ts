import { getCloudflareContext } from "@opennextjs/cloudflare";

type RuntimeEnv = {
  NAS_UPLOAD_URL?: string;
  NAS_UPLOAD_TOKEN?: string;
};

function getConfig() {
  const { env } = getCloudflareContext();
  const runtimeEnv = env as unknown as RuntimeEnv;

  return {
    url: String(runtimeEnv.NAS_UPLOAD_URL || process.env.NAS_UPLOAD_URL || "").trim(),
    token: String(runtimeEnv.NAS_UPLOAD_TOKEN || process.env.NAS_UPLOAD_TOKEN || "").trim(),
  };
}

export function nasConfigured() {
  const { url, token } = getConfig();
  return Boolean(url && token);
}

export function nasConfigurationError() {
  const { url, token } = getConfig();

  if (!url) return "NAS_UPLOAD_URL is not configured.";
  if (!token) return "NAS_UPLOAD_TOKEN is not configured.";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "NAS_UPLOAD_URL is invalid.";
  }

  if (parsed.protocol !== "https:") {
    return "NAS_UPLOAD_URL must use HTTPS.";
  }

  return null;
}

export function sanitizeNasPath(value: string) {
  const parts = value
    .replaceAll("\\", "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== "." && part !== "..");

  return parts.map((part) => encodeURIComponent(part)).join("/");
}

export async function uploadToNas(path: string, file: File) {
  const { url, token } = getConfig();
  const configurationError = nasConfigurationError();
  if (configurationError) throw new Error(configurationError);

  const cleanPath = sanitizeNasPath(path);
  if (!cleanPath.startsWith("collections/")) {
    throw new Error("NAS upload path must start with collections/");
  }

  const form = new FormData();
  form.set("path", cleanPath);
  form.set("file", file, file.name);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
    cache: "no-store",
  });

  const raw = await response.text();
  let payload: { success?: boolean; error?: string; path?: string } = {};

  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw new Error(`NAS upload returned invalid JSON (${response.status}): ${raw.slice(0, 300)}`);
  }

  if (!response.ok || !payload.success) {
    const detail = payload.error || `HTTP ${response.status}`;
    throw new Error(`NAS upload failed (${response.status}): ${detail}`);
  }

  return payload.path || `/${cleanPath}`;
}
