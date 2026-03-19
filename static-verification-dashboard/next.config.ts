import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabling static export to support Server Actions and Middleware
  // output: 'export', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
