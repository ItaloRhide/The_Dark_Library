/* Script de teste temporário do fluxo de auth. Uso: node scripts/test-auth-flow.js */
require('dotenv').config();
const { Client } = require('pg');

const BASE = 'http://localhost:3000';

async function main() {
  const email = `teste${Date.now()}@reader.com`;
  const password = 'senha123';

  // Register
  let res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  console.log('REGISTER:', res.status, JSON.stringify(await res.json()));

  // Pegar o código direto do banco
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const r = await client.query(
    "SELECT code FROM verification_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
    [email]
  );
  const code = r.rows[0].code;
  console.log('CODIGO:', code);
  await client.end();

  // Verify
  res = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  console.log('VERIFY:', res.status, JSON.stringify(await res.json()));

  // Login
  res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const login = await res.json();
  console.log('LOGIN:', res.status, 'token?', !!login.token);
  if (login.user) console.log('USER:', JSON.stringify(login.user));

  // Me (token válido)
  if (login.token) {
    const me = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    console.log('ME:', me.status, JSON.stringify(await me.json()));
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('ERRO:', error.message);
  process.exit(1);
});