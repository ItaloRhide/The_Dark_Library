const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl });
const BUCKET = 'covers';
const COVERS_DIR = path.join(__dirname, '..', 'uploads', 'covers');

function getContentType(filePath) {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id, cover_image FROM books WHERE cover_image IS NOT NULL AND cover_image != \'\'');
    if (rows.length === 0) { console.log('[migrate-covers] Nenhuma capa encontrada no banco.'); return; }

    console.log(`[migrate-covers] ${rows.length} livro(s) com capa local. Iniciando upload...`);

    for (const book of rows) {
      const coverPath = book.cover_image;
      if (!coverPath.startsWith('/uploads/')) { console.log(`[migrate-covers] Livro ${book.id} já usa URL externa (${coverPath}). Pulando.`); continue; }

      const localFile = path.join(__dirname, '..', coverPath);
      if (!fs.existsSync(localFile)) { console.warn(`[migrate-covers] Arquivo local não encontrado: ${localFile}. Pulando.`); continue; }

      const fileName = path.basename(localFile);
      const fileBuffer = fs.readFileSync(localFile);
      const contentType = getContentType(localFile);
      const storagePath = `${book.id}/${fileName}`;

      console.log(`[migrate-covers] Upload: ${fileName} → ${storagePath}`);

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, { contentType, upsert: true });

      if (uploadErr) { console.error(`[migrate-covers] ERRO upload ${fileName}:`, uploadErr.message); continue; }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) { console.error(`[migrate-covers] ERRO: não conseguiu URL pública para ${storagePath}`); continue; }

      await client.query('UPDATE books SET cover_image = $1 WHERE id = $2', [publicUrl, book.id]);
      console.log(`[migrate-covers] ✅ ${book.id}: ${coverPath} → ${publicUrl}`);
    }

    console.log('[migrate-covers] Migração concluída.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error('[migrate-covers] FATAL:', err.message); process.exit(1); });
