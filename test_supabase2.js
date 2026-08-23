const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://asadlmicfgvgeespouan.supabase.co'
const supabaseServiceKey = 'sb_secret_wmKIyEQhaaVd-bXJ_9_43Q_qwkdixDv'

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function test() {
  const { count, error, data } = await supabaseServer
    .from('admin_users')
    .select('*', { count: 'exact', head: true })
  console.log('Error:', JSON.stringify(error))
  console.log('Data:', data)
  console.log('Count:', count)
}

test()