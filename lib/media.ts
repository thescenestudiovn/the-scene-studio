const MEDIA_BASE_URL = "https://media.thescenestudio.asia";

export function mediaUrl(path: string) {
    return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
