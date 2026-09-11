/* Testa a conexão com o Supabase (somente leitura). Uso: node scripts/test-supabase-conn.js */
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const url = process.env.SUPABASE_DATABASE_URL;
  if (!url) {
    console.error('SUPABASE_DATABASE_URL não definido no .env');
    process.exit(1);
  }
  console.log('Conectando...');
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query('SELECT current_database() bd, version() v');
  console.log('BD:', r.rows[0].bd, '|', r.rows[0].v.split(' ')[0]);
  const t = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('Tabelas public existentes:', t.rows.map((x) => x.table_name).join(', ') || '(vazio)');
  await c.end();
  console.log('CONEXÃO OK');
})().catch((e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});