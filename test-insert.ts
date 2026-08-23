import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function test() {
  const { data, error } = await supabase.from('generated_pseudos').insert([
    { pseudo: 'TestPseudo123', keywords: ['test'] }
  ]).select()
  console.log('Error:', error)
  console.log('Data:', data)
}

test()
