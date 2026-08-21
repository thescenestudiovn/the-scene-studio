# NAS media upload

The admin media workflow uses TerraMaster WebDAV for server-side uploads.

## Required Worker secrets

Set these secrets on the Cloudflare Worker:

- `NAS_WEBDAV_URL` — the WebDAV base URL for the NAS share that corresponds to the website media root.
- `NAS_USERNAME` — a NAS account with write permission to that share.
- `NAS_PASSWORD` — the NAS account password.

The TerraMaster WebDAV service supports authenticated file uploads. TerraMaster documents WebDAV as the supported remote file service and recommends HTTPS for remote access.

## Expected mapping

The application stores media paths such as:

`/images/collections/<collection-slug>/<filename>`

`NAS_WEBDAV_URL` should point at the WebDAV share root so that the application can PUT that relative path.

## Admin workflow

1. Open `/admin`.
2. Open **Collections**.
3. Create a collection.
4. Open the collection.
5. Select multiple images in one file picker.
6. Click **Upload to NAS**.
7. The upload route writes the files to NAS and only then creates the corresponding D1 `media` records.
8. Story Editor uses the resulting media records instead of accepting arbitrary file paths.

The public image URL is still served through `/api/media`, so the browser does not need direct cross-origin access to the NAS.
