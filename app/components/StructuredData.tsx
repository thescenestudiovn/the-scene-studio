export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://thescenestudio.asia/#organization",
                name: "The Scene Studio",
                url: "https://thescenestudio.asia",
                description:
                    "The Scene Studio creates intimate, cinematic photographs and films for destination weddings in Vietnam and worldwide.",
                logo: {
                    "@type": "ImageObject",
                    url: "https://thescenestudio.asia/images/logo.png",
                },
            },
            {
                "@type": "WebSite",
                "@id": "https://thescenestudio.asia/#website",
                url: "https://thescenestudio.asia",
                name: "The Scene Studio",
                publisher: {
                    "@id": "https://thescenestudio.asia/#organization",
                },
            },
            {
                "@type": "ProfessionalService",
                "@id": "https://thescenestudio.asia/#service",
                name: "The Scene Studio",
                url: "https://thescenestudio.asia",
                description:
                    "Destination wedding photography and wedding films in Vietnam and worldwide.",
                provider: {
                    "@id": "https://thescenestudio.asia/#organization",
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
                serviceType: [
                    "Destination Wedding Photography",
                    "Wedding Films",
                ],
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