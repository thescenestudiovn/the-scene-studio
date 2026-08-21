import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.thescenestudio.asia",
      },
    ],
  },
};

export default nextConfig;