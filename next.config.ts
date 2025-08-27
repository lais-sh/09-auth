import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ac.goit.global" },
      { protocol: "https", hostname: "notehub-api.goit.study" },
    ],
  },

  experimental: {
    typedRoutes: true, // опціонально, зручно з App Router
  },

  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
