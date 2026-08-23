const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://asadlmicfgvgeespouan.supabase.co'
const supabaseServiceKey = 'invalid_key_123'

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function test() {
  const { count, error } = await supabaseServer
    .from('admin_users')
    .select('*', { count: 'exact', head: true })
  console.log(JSON.stringify(error))
}

test()