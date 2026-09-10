/* Teste da divisão de acessos. Uso: node scripts/test-rbac.js */
require('dotenv').config();
const { Client } = require('pg');

const BASE = 'http://localhost:3000';

async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

async function createVerifiedReader() {
  const email = `rbac${Date.now()}@reader.com`;
  const password = 'senha123';
  await call('/auth/register', { method: 'POST', body: { email, password } });
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const r = await client.query(
    "SELECT code FROM verification_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
    [email]
  );
  const code = r.rows[0].code;
  await client.end();
  await call('/auth/verify', { method: 'POST', body: { email, code } });
  const login = await call('/auth/login', { method: 'POST', body: { email, password } });
  return { email, password, token: login.data.token };
}

async function main() {
  // 1. Sem token: deve ser 401
  let r = await call('/books');
  console.log('1. GET /books sem token ->', r.status, '(esperado 401)');

  // Reader verificado
  const { token: readerToken } = await createVerifiedReader();
  console.log('2. Leitor verificando: OK');

  // 3. Reader listando: 200
  r = await call('/books', { token: readerToken });
  console.log('3. GET /books (reader) ->', r.status, '(esperado 200)');

  // 4. Reader tentando criar: 403
  r = await call('/books', { method: 'POST', token: readerToken, body: { title: 'X' } });
  console.log('4. POST /books (reader) ->', r.status, '(esperado 403)');

  // 5. Login admin (do .env)
  const loginAdmin = await call('/auth/login', {
    method: 'POST',
    body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  });
  console.log('5. Login admin:', loginAdmin.status);
  if (loginAdmin.status !== 200) {
    console.log('   (falhou — verifique ADMIN_EMAIL/ADMIN_PASSWORD no .env)');
    process.exit(1);
  }
  const adminToken = loginAdmin.data.token;
  console.log('   Admin role:', loginAdmin.data.user.role, '(esperado owner)');

  // 6. Admin criando: 201
  const title = `Livro RBAC ${Date.now()}`;
  r = await call('/books', { method: 'POST', token: adminToken, body: { title } });
  console.log('6. POST /books (admin) ->', r.status, '(esperado 201)');
  const bookId = r.data?.id;
  if (bookId) {
    const del = await call(`/books/${bookId}`, { method: 'DELETE', token: adminToken });
    console.log('7. DELETE /books (admin) ->', del.status, '(esperado 204)');
  }

  // 8. Reader deletando: 403
  r = await call('/books/00000000-0000-0000-0000-000000000000', { method: 'DELETE', token: readerToken });
  console.log('8. DELETE /books (reader) ->', r.status, '(esperado 403)');

  process.exit(0);
}

main().catch((e) => {
  console.error('ERRO:', e.message);
  process.exit(1);
});