const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.nzlqlnydsrwcbpufqwob:Madhu%4072011P@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres'
});
pool.query('SELECT NOW()')
  .then(res => { console.log('SUCCESS:', res.rows[0]); process.exit(0); })
  .catch(err => { console.error('ERROR:', err); process.exit(1); });
