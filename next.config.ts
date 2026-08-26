import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silences the workspace-root inference warning when a stray lockfile exists
  // above the project directory.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Cloudinary hosts every uploaded product/hero image. Unsplash only serves
    // the seeded sample catalogue so the UI is testable before any upload.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Next.js 16 requires an explicit allowlist. 85 is used by the hero,
    // 90 by the product detail image; everything else falls back to 75.
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
