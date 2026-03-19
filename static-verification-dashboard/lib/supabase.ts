import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl.includes('placeholder')) {
  console.warn("⚠️ Supabase URL is using placeholder. Check your .env.local and restart the server.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
