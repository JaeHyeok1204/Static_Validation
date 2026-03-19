import { createClient } from '@supabase/supabase-js';

// PRODUCTION-READY FALLBACK: During dev, if .env.local isn't picked up, 
// we use the actual project URL rather than placeholder to prevent 'Failed to fetch'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cswnxjwjjavdphznlzeb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_66jJ2c5H0EtsO4LyGqrFSA_YeaAqMuw';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("⚠️ NEXT_PUBLIC_SUPABASE_URL is missing from environment. Using hardcoded fallback.");
} else {
  const urlDomain = new URL(supabaseUrl).hostname;
  console.log(`📡 Supabase client initialized for: ${urlDomain}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
