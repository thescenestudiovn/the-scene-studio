
export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://the-scene-studio.thescenestudio.workers.dev/#organization",
                name: "The Scene Studio",
                url: "https://the-scene-studio.thescenestudio.workers.dev",
                description:
                    "The Scene Studio creates intimate, cinematic photographs and films for destination weddings in Vietnam and worldwide.",
                logo: {
                    "@type": "ImageObject",
                    url: "https://the-scene-studio.thescenestudio.workers.dev/images/logo.png",
                },
            },
            {
                "@type": "WebSite",
                "@id": "https://the-scene-studio.thescenestudio.workers.dev/#website",
                url: "https://the-scene-studio.thescenestudio.workers.dev",
                name: "The Scene Studio",
                publisher: {
                    "@id":
                        "https://the-scene-studio.thescenestudio.workers.dev/#organization",
                },
            },
            {
                "@type": "Service",
                name: "Destination Wedding Photography",
                provider: {
                    "@id":
                        "https://the-scene-studio.thescenestudio.workers.dev/#organization",
                },
                areaServed: [
                    {
                        "@type": "Country",
                        name: "Vietnam",
                    },
                    {
                        "@type": "Place",
                        name: "Worldwide",
                    },
                ],
                serviceType: "Wedding Photography",
            },
            {
                "@type": "Service",
                name: "Wedding Films",
                provider: {
                    "@id":
                        "https://the-scene-studio.thescenestudio.workers.dev/#organization",
                },
                areaServed: [
                    {
                        "@type": "Country",
                        name: "Vietnam",
                    },
                    {
                        "@type": "Place",
                        name: "Worldwide",
                    },
                ],
                serviceType: "Wedding Videography",
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
            }}
        />
    );
}