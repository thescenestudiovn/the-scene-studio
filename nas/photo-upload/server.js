const http = require("http");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipelineAsync = promisify(pipeline);

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || "/mnt/md0/media";
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
  throw new Error("AUTH_TOKEN is required");
}

function cleanSegment(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, "-"))
    .filter(Boolean)
    .join(path.sep);
}

function cleanFilename(value) {
  const filename = String(value || "file").replace(/\\/g, "/").split("/").pop();
  return (filename || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || !req.url) {
    return sendJson(res, 404, { error: "Not found" });
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname !== "/upload") {
    return sendJson(res, 404, { error: "Not found" });
  }

  if (req.headers.authorization !== `Bearer ${AUTH_TOKEN}`) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  const contentType = String(req.headers["content-type"] || "");
  if (!/^image\/(jpeg|png|webp|avif)$/i.test(contentType)) {
    return sendJson(res, 415, { error: "Unsupported image type" });
  }

  const relativeDir = cleanSegment(url.searchParams.get("path") || "gallery");
  const filename = cleanFilename(url.searchParams.get("filename") || "file");

  const targetDir = path.resolve(UPLOAD_ROOT, relativeDir);
  const root = path.resolve(UPLOAD_ROOT);

  if (targetDir !== root && !targetDir.startsWith(`${root}${path.sep}`)) {
    return sendJson(res, 400, { error: "Invalid upload path" });
  }

  await fs.promises.mkdir(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, filename);
  const tempPath = `${targetPath}.uploading-${process.pid}-${Date.now()}`;

  try {
    await pipelineAsync(req, fs.createWriteStream(tempPath, { flags: "wx" }));
    await fs.promises.rename(tempPath, targetPath);

    const publicPath = `/${[relativeDir, filename].filter(Boolean).join("/")}`;

    return sendJson(res, 201, {
      ok: true,
      path: publicPath,
      filename,
    });
  } catch (error) {
    await fs.promises.rm(tempPath, { force: true }).catch(() => {});
    console.error("Upload failed:", error);
    return sendJson(res, 500, { error: "Upload failed" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`NAS photo upload service listening on ${HOST}:${PORT}`);
  console.log(`Upload root: ${UPLOAD_ROOT}`);
});
