import { db } from '../../db/connection';
import logger from '../../utils/logger';
import { supabaseStorage } from '../../services/supabase-storage';

export class BooksService {
  static async create(title: string, color?: string | null) {
    const res = await db.query(
      'INSERT INTO books (title, color) VALUES ($1, $2) RETURNING *',
      [title, color || null]
    );
    return res.rows[0];
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM books ORDER BY updated_at DESC');
    return res.rows;
  }

  static async findById(id: string) {
    const bookRes = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    if (bookRes.rows.length === 0) return null;

    const chaptersRes = await db.query(
      'SELECT id, book_id, title, content, order_index, created_at, updated_at FROM chapters WHERE book_id = $1 ORDER BY order_index ASC',
      [id]
    );

    const book = bookRes.rows[0];
    return {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle,
      cover_image: book.cover_image,
      color: book.color,
      created_at: book.created_at,
      updated_at: book.updated_at,
      chapters: chaptersRes.rows,
    };
  }

  static async update(id: string, params: { title?: string; subtitle?: string | null; cover_image?: string | null; color?: string | null }) {
    // Se uma nova capa foi enviada, remove a antiga do Supabase Storage
    if (params.cover_image !== undefined) {
      const oldBook = await db.query('SELECT cover_image FROM books WHERE id = $1', [id]);
      const oldCover = oldBook.rows.length > 0 ? oldBook.rows[0].cover_image : null;
      if (oldCover && oldCover !== params.cover_image) {
        const storagePath = this.publicUrlToStoragePath(oldCover, 'covers');
        if (storagePath) {
          await supabaseStorage.deleteFile('covers', storagePath);
          logger.info(`[BooksService] Capa antiga removida do Storage: ${storagePath}`);
        }
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(params.title);
    }
    if (params.subtitle !== undefined) {
      fields.push(`subtitle = $${idx++}`);
      values.push(params.subtitle === "" ? null : params.subtitle);
    }
    if (params.cover_image !== undefined) {
      fields.push(`cover_image = $${idx++}`);
      values.push(params.cover_image === "" || params.cover_image === undefined ? null : params.cover_image);
    }
    if (params.color !== undefined) {
      fields.push(`color = $${idx++}`);
      values.push(params.color === "" || params.color === undefined ? null : params.color);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE books SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await db.query(query, values);
    return res.rows[0];
  }

  static publicUrlToStoragePath(url: string, bucket: string): string | null {
    const marker = `/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  }

  static async delete(id: string) {
    const bookRes = await db.query('SELECT cover_image FROM books WHERE id = $1', [id]);
    const coverUrl = bookRes.rows.length > 0 ? bookRes.rows[0].cover_image : null;
    if (coverUrl) {
      const storagePath = this.publicUrlToStoragePath(coverUrl, 'covers');
      if (storagePath) {
        await supabaseStorage.deleteFile('covers', storagePath);
        logger.info(`[BooksService] Capa removida do Storage: ${storagePath}`);
      }
    }

    await db.query('DELETE FROM books WHERE id = $1', [id]);
    return true;
  }
}
