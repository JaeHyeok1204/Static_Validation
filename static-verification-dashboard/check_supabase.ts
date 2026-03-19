
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugData() {
    const { data: users, error } = await supabase.from('users').select('*').limit(3)
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Sample data keys:', Object.keys(users[0] || {}))
        console.log('Sample data:', JSON.stringify(users, null, 2))
    }
}

debugData()
