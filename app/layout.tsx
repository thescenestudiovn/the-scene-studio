import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://the-scene-studio.thescenestudio.workers.dev"
  ),

  title: {
    default:
      "The Scene Studio — Destination Wedding Photography & Films",
    template: "%s — The Scene Studio",
  },

  description:
    "The Scene Studio creates intimate, cinematic photographs and films for destination weddings in Vietnam and beyond.",

  keywords: [
    "Vietnam wedding photographer",
    "Vietnam wedding videographer",
    "Da Nang wedding photographer",
    "Da Nang wedding videographer",
    "destination wedding Vietnam",
    "destination wedding photographer",
    "intimate wedding Vietnam",
    "wedding photography Vietnam",
    "wedding films Vietnam",
    "The Scene Studio",
  ],

  authors: [
    {
      name: "The Scene Studio",
    },
  ],

  creator: "The Scene Studio",

  verification: {
    google:
      "AVvrDHG767WsbMJRETLTgSMg3wow8t6-u_z1b2igpzI",
  },

  openGraph: {
    type: "website",
    siteName: "The Scene Studio",
    title:
      "The Scene Studio — Destination Wedding Photography & Films",
    description:
      "Intimate, cinematic photographs and films for destination weddings in Vietnam and beyond.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "The Scene Studio — Destination Wedding Photography & Films",
    description:
      "Intimate, cinematic photographs and films for destination weddings in Vietnam and beyond.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id":
                "https://the-scene-studio.thescenestudio.workers.dev/#organization",
              name: "The Scene Studio",
              url: "https://the-scene-studio.thescenestudio.workers.dev",
              description:
                "The Scene Studio creates intimate, cinematic photographs and films for destination weddings in Vietnam and beyond.",
            }),
          }}
        />

        {children}

      </body>
    </html>
  );
}