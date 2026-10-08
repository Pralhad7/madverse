const { initDB } = require('./backend/db/init');
initDB().then(() => {
  console.log('Successfully initialized Supabase Postgres DB!');
  process.exit(0);
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
