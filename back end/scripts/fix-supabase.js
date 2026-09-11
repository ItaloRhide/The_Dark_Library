/* Limpa contas de teste e habilita RLS nas tabelas. Uso: node scripts/fix-supabase.js */
require('dotenv').config();
const { Client } = require('pg');

const TEST_EMAILS = [
  'testeheader1789053053@reader.com',
  'testecid1789053948@reader.com',
];

(async () => {
  const c = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  await c.query('BEGIN');

  for (const email of TEST_EMAILS) {
    const delCodes = await c.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    const delUser = await c.query('DELETE FROM users WHERE email = $1', [email]);
    console.log(`${email} -> códigos removidos: ${delCodes.rowCount}, usuário removido: ${delUser.rowCount}`);
  }

  for (const table of ['books', 'chapters', 'users', 'verification_codes']) {
    await c.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    console.log(`RLS habilitado em ${table}`);
  }

  await c.query('COMMIT');

  const users = await c.query('SELECT email, role, verified FROM users ORDER BY created_at');
  console.log('\nUsuários restantes:');
  users.rows.forEach((r) => console.log(`  ${r.email} | ${r.role} | verified=${r.verified}`));
  await c.end();
  console.log('\nOK');
})().catch(async (e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});