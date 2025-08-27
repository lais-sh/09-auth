import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true, 
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ac.goit.global" },
      { protocol: "https", hostname: "notehub-api.goit.study" },
    ],
  },
};

export default nextConfig;
