import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Production build ke time strict TypeScript check ko bypass karega
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;