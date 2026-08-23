const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://asadlmicfgvgeespouan.supabase.co',
  'sb_secret_wmKIyEQhaaVd-bXJ_9_43Q_qwkdixDv'
);
async function run() {
  const res = await supabase.from('admin_users').select('*', { count: 'exact', head: true });
  console.log(JSON.stringify(res.error));
}
run();
