# NAS photo upload

This version does **not** use `cloudflared`, a custom init script, Docker, or a daemon on the NAS.

It uses the TerraMaster Web Server that is already serving `/mnt/md0/public/WEB`.

## NAS path

The discovered upload directory is:

```text
/mnt/md0/public/WEB/_upload
```

Deploy `upload.php` to:

```text
/mnt/md0/public/WEB/_upload/upload.php
```

The uploaded images will be written below that directory, for example:

```text
/mnt/md0/public/WEB/_upload/gallery/example.jpg
```

and should therefore be publicly reachable as:

```text
https://media.thescenestudio.asia/_upload/gallery/example.jpg
```

## One-time NAS setup

Create a token file outside the public web directory:

```sh
sudo sh -c 'umask 077; printf "%s" "REPLACE_WITH_LONG_RANDOM_TOKEN" > /mnt/md0/public/.scene_upload_token'
```

Then copy `upload.php` into `/mnt/md0/public/WEB/_upload/`.

The token is never stored in the web directory.

## Endpoint

```text
POST https://media.thescenestudio.asia/_upload/upload.php?path=gallery&filename=image.jpg
Authorization: Bearer <same-token>
Content-Type: image/jpeg
```

The request body is the raw image stream. The PHP endpoint writes it directly to the NAS without loading the entire image into memory.

## Next.js environment

Set these deployment variables:

```text
NAS_UPLOAD_URL=https://media.thescenestudio.asia/_upload/upload.php
NAS_UPLOAD_TOKEN=<same-token-as-/mnt/md0/public/.scene_upload_token>
```

No Cloudflare Tunnel is required for the upload path.

## Important

This assumes `media.thescenestudio.asia` already maps to `/mnt/md0/public/WEB`. Verify the public URL with a small test image before enabling production uploads.
