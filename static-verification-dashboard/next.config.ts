import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Explicitly baking environment variables for static export
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://cswnxjwjjavdphznlzeb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_66jJ2c5H0EtsO4LyGqrFSA_YeaAqMuw',
    NEXT_PUBLIC_RESEND_API_KEY: 're_U5iinuid_GwXPZDCJdFLWsA5cQXyaKimN',
  }
};

export default nextConfig;
