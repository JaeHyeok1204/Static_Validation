import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cswnxjwjjavdphznlzeb.supabase.co';
const supabaseAnonKey = 'sb_publishable_66jJ2c5H0EtsO4LyGqrFSA_YeaAqMuw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
