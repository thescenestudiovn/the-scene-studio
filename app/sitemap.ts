import type { MetadataRoute } from "next";
import { destinations } from "../data/destinations";
import { stories } from "../data/stories";

const baseUrl = "https://thescenestudio.asia";

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/destinations`,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/films`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stories`,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    const destinationPages: MetadataRoute.Sitemap =
        destinations.map((destination) => ({
            url: `${baseUrl}/destinations/${destination.country}/${destination.slug}`,
            changeFrequency: "monthly",
            priority: 0.8,
        }));

    const storyPages: MetadataRoute.Sitemap =
        stories.map((story) => ({
            url: `${baseUrl}/stories/${story.slug}`,
            changeFrequency: "monthly",
            priority: 0.8,
        }));

    return [
        ...staticPages,
        ...destinationPages,
        ...storyPages,
    ];
}