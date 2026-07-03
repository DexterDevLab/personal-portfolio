import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where supported (20-30% smaller than WebP), WebP as fallback
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
