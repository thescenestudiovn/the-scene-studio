
import type { MetadataRoute } from "next";

const baseUrl =
    "https://thescenestudio.asia";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
