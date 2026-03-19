
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_column_info', { table_name_input: 'users' })
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: sample, error: sampleError } = await supabase.from('users').select('*').limit(1)
    if (sampleError) {
      console.error('Error fetching sample:', sampleError)
    } else {
      console.log('Sample User keys:', Object.keys(sample[0] || {}))
      console.log('Sample User data:', sample[0])
    }
  } else {
    console.log('Column Info:', data)
  }
}

checkSchema()
