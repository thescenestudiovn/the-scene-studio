const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

export function mediaUrl(path: string) {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
