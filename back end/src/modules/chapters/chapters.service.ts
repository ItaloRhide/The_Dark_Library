import { db } from '../../db/connection';

export interface CreateChapterParams {
  bookId: string;
  title: string;
  orderIndex: number;
}

export interface UpdateChapterParams {
  title?: string;
  content?: string;
  orderIndex?: number;
}

export class ChaptersService {
  static async create(params: CreateChapterParams) {
    const res = await db.query(
      'INSERT INTO chapters (book_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [params.bookId, params.title, params.orderIndex]
    );
    return res.rows[0];
  }

  static async findById(id: string) {
    const res = await db.query('SELECT * FROM chapters WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Optimized for Autosave
   * Only updates provided fields.
   */
  static async update(id: string, params: UpdateChapterParams) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(params.title);
    }
    if (params.content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(params.content);
    }
    if (params.orderIndex !== undefined) {
      fields.push(`order_index = $${idx++}`);
      values.push(params.orderIndex);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE chapters SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const res = await db.query(query, values);
    return res.rows[0];
  }

  static async delete(id: string) {
    await db.query('DELETE FROM chapters WHERE id = $1', [id]);
    return true;
  }
}
