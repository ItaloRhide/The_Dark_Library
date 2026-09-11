import { db } from '../../db/connection';

export class ProgressService {
  static async find(userId: string, bookId: string) {
    const res = await db.query(
      'SELECT chapter_id, char_offset, updated_at FROM reading_progress WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  static async set(
    userId: string,
    bookId: string,
    chapterId: string | null,
    charOffset: number
  ) {
    const res = await db.query(
      `INSERT INTO reading_progress (user_id, book_id, chapter_id, char_offset)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET
         chapter_id = EXCLUDED.chapter_id,
         char_offset = EXCLUDED.char_offset,
         updated_at = NOW()
       RETURNING chapter_id, char_offset, updated_at`,
      [userId, bookId, chapterId, charOffset]
    );
    return res.rows[0];
  }
}