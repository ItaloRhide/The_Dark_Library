import { db } from '../../db/connection';
import fs from 'fs';
import path from 'path';

export class BooksService {
  static async create(title: string) {
    const res = await db.query(
      'INSERT INTO books (title) VALUES ($1) RETURNING *',
      [title]
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
      created_at: book.created_at,
      updated_at: book.updated_at,
      chapters: chaptersRes.rows,
    };
  }

  static async update(id: string, params: { title?: string; subtitle?: string; cover_image?: string | null }) {
    // If a new cover is being uploaded, delete the old one first
    if (params.cover_image !== undefined) {
      const oldBook = await db.query('SELECT cover_image FROM books WHERE id = $1', [id]);
      if (oldBook.rows.length > 0 && oldBook.rows[0].cover_image) {
        const oldCoverPath = oldBook.rows[0].cover_image;
        // ONLY delete if the path is different from the new one
        if (oldCoverPath && oldCoverPath !== params.cover_image && oldCoverPath.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), oldCoverPath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`[Service] Capa antiga removida: ${oldCoverPath}`);
            } catch (err) {
              console.error(`[Service] Erro ao remover capa antiga: ${err}`);
            }
          }
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

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE books SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await db.query(query, values);
    return res.rows[0];
  }

  static async delete(id: string) {
    // Get the book first to find the cover image path
    const bookRes = await db.query('SELECT cover_image FROM books WHERE id = $1', [id]);
    if (bookRes.rows.length > 0 && bookRes.rows[0].cover_image) {
      const coverPath = bookRes.rows[0].cover_image;
      // Ensure it's a local upload path
      if (coverPath.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), coverPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await db.query('DELETE FROM books WHERE id = $1', [id]);
    return true;
  }
}
