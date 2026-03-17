const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cswnxjwjjavdphznlzeb.supabase.co';
const supabaseAnonKey = 'sb_publishable_66jJ2c5H0EtsO4LyGqrFSA_YeaAqMuw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Schema check failed:", error);
        } else {
            console.log("Users table sample data found:", !!data && data.length > 0);
            if (data && data[0]) {
                console.log("Columns names found in 'users' table:");
                console.log(Object.keys(data[0]));
            }
        }
    } catch (e) {
        console.error("Error during execution:", e);
    }
}

checkSchema();
