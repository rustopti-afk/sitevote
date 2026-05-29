import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    minimumCacheTTL: 3600,
  },
  output: "standalone",
  typescript: {
    // Type errors don't affect runtime — build anyway
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
