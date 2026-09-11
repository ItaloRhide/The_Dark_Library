/* Verifica os dados importados no Supabase. Uso: node scripts/verify-supabase.js */
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const c = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const t = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('Tabelas:', t.rows.map((x) => x.table_name).join(', '));
  const cnt = await c.query(
    'SELECT (SELECT count(*) FROM books) b,(SELECT count(*) FROM chapters) ch,(SELECT count(*) FROM users) u,(SELECT count(*) FROM verification_codes) vc'
  );
  console.log('COUNTs —', JSON.stringify(cnt.rows[0]));
  const books = await c.query('SELECT id, title, subtitle, color FROM books ORDER BY created_at');
  console.log('\nLivros:');
  books.rows.forEach((r) => console.log(`  ${r.title}${r.subtitle ? ' — ' + r.subtitle : ''} | cor: ${r.color} | ${r.id}`));
  const users = await c.query('SELECT email, role, verified FROM users ORDER BY created_at');
  console.log('\nUsuários:');
  users.rows.forEach((r) => console.log(`  ${r.email} | ${r.role} | verified=${r.verified}`));
  const triggers = await c.query(
    "SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_schema='public' ORDER BY trigger_name"
  );
  console.log('\nTriggers:');
  triggers.rows.forEach((r) => console.log(`  ${r.trigger_name} (${r.event_manipulation})`));
  await c.end();
  console.log('\nVERIFICAÇÃO OK');
})().catch((e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});