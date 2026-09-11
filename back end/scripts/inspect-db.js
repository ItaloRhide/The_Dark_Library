/* Inspeciona o schema e volumes do banco local. Uso: node scripts/inspect-db.js */
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const t = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('TABELAS:', t.rows.map((r) => r.table_name).join(', '));
  const ours = ['books', 'chapters', 'users', 'verification_codes'];
  for (const tab of t.rows.filter((r) => ours.includes(r.table_name))) {
    const col = await c.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
      [tab.table_name]
    );
    console.log(`\n${tab.table_name}:`);
    col.rows.forEach((r) => console.log('  ' + r.column_name + ' ' + r.data_type));
  }
  const cnt = await c.query(
    'SELECT (SELECT count(*) FROM books) b,(SELECT count(*) FROM chapters) ch,(SELECT count(*) FROM users) u,(SELECT count(*) FROM verification_codes) vc'
  );
  console.log('\nCOUNTS:', JSON.stringify(cnt.rows[0]));
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});