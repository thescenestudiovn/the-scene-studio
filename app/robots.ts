
import type { MetadataRoute } from "next";

const baseUrl =
    "https://the-scene-studio.thescenestudio.workers.dev";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
