import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cswnxjwjjavdphznlzeb.supabase.co';
const supabaseAnonKey = 'sb_publishable_66jJ2c5H0EtsO4LyGqrFSA_YeaAqMuw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Schema check failed:", error);
        } else {
            console.log("Users table sample:", data);
            if (data && data[0]) {
                console.log("Columns:", Object.keys(data[0]));
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkSchema();
