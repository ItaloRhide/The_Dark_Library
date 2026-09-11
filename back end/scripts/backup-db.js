/* Faz backup das 4 tabelas do banco local (books, chapters, users, verification_codes).
   Uso: node scripts/backup-db.js [caminho-saida]
   Gera um .sql pronto para restauração. */
require('dotenv').config();
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PG_DUMP = 'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe';
const TABLES = ['books', 'chapters', 'users', 'verification_codes'];

const outPath = process.argv[2] || path.join(
  __dirname,
  '..',
  'backups',
  `darklibrary_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.sql`
);

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const args = [process.env.DATABASE_URL, '--column-inserts', '--no-owner', '--no-privileges', '-f', outPath];
for (const t of TABLES) args.push('-t', t);

const res = spawnSync(PG_DUMP, args, { encoding: 'utf8' });
if (res.status !== 0) {
  console.error('pg_dump falhou:', res.stderr || res.stdout);
  process.exit(1);
}
console.log('Dump gerado:', outPath);
console.log('Tamanho:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');