
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, birth_date')
    .limit(5)
  
  if (error) {
    console.error('Error fetching users:', error)
  } else {
    console.log('Sample Users:', JSON.stringify(data, null, 2))
  }
}

debugUsers()
