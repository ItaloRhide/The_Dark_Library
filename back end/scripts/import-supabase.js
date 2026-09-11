/* Importa o backup local para o Supabase. Uso: node scripts/import-supabase.js
   Usa o último arquivo em backups/ e a SUPABASE_DATABASE_URL do .env */
require('dotenv').config();
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PSQL = 'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe';

const backupsDir = path.join(__dirname, '..', 'backups');
const files = fs
  .readdirSync(backupsDir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => ({ name: f, mtime: fs.statSync(path.join(backupsDir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  console.error('Nenhum backup encontrado em backups/.');
  process.exit(1);
}

const url = process.env.SUPABASE_DATABASE_URL;
if (!url) {
  console.error('SUPABASE_DATABASE_URL não definido no .env');
  process.exit(1);
}

const dumpPath = path.join(backupsDir, files[0].name);
console.log('Importando:', files[0].name);
console.log('Para Supabase (aguarde)...');

const res = spawnSync(
  PSQL,
  [url, '-v', 'ON_ERROR_STOP=1', '-q', '-f', dumpPath],
  { encoding: 'utf8', timeout: 120000 }
);

console.log(res.stdout || '');
if (res.status !== 0) {
  console.error('FALHOU na importação.');
  console.error(res.stderr || res.stdout);
  process.exit(1);
}
if (res.stderr) console.log(res.stderr);
console.log('IMPORTAÇÃO CONCLUÍDA COM SUCESSO');