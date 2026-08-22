# NAS Photo Upload Service

A tiny streaming HTTP upload service for the TerraMaster NAS.

The Next.js app sends the image stream to this service. The service writes directly to the NAS filesystem and returns the public media path. It does not buffer the whole image in memory.

## Environment

```text
HOST=0.0.0.0
PORT=8787
UPLOAD_ROOT=/mnt/md0/media
AUTH_TOKEN=<long-random-secret>
```

`UPLOAD_ROOT` must be the filesystem directory that is already exposed by `media.thescenestudio.asia`.

## Endpoint

```text
POST /upload?path=gallery&filename=image.jpg
Authorization: Bearer <AUTH_TOKEN>
Content-Type: image/jpeg
```

The request body is the raw image bytes.

Successful response:

```json
{
  "ok": true,
  "path": "/gallery/image.jpg",
  "filename": "image.jpg"
}
```

## Docker

Build the ARM64-compatible image on the NAS/container host:

```sh
docker build -t scene-photo-upload /path/to/nas/photo-upload
```

Run it with the media directory mounted:

```sh
docker run -d \
  --name scene-photo-upload \
  --restart unless-stopped \
  -p 8787:8787 \
  -e AUTH_TOKEN='<long-random-secret>' \
  -e UPLOAD_ROOT=/mnt/md0/media \
  -v /mnt/md0/media:/mnt/md0/media \
  scene-photo-upload
```

Only the private network path from the Next.js server to the NAS upload service should be allowed. Do not expose port 8787 publicly.

## Next.js environment

Set these on the Next.js/Cloudflare deployment:

```text
NAS_UPLOAD_URL=http://<private-nas-address>:8787/upload
NAS_UPLOAD_TOKEN=<same-secret-as-AUTH_TOKEN>
```
