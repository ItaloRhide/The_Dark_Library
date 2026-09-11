import { db } from '../../db/connection';

type FeedbackType = 'bug' | 'suggestion' | 'other';
type FeedbackStatus = 'new' | 'read' | 'resolved';

export class FeedbackService {
  static async create(input: {
    userId: string;
    userEmail: string;
    type: FeedbackType;
    message: string;
    page: string | null;
  }) {
    const res = await db.query(
      `INSERT INTO feedback (user_id, user_email, type, message, page)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, message, page, status, created_at`,
      [input.userId, input.userEmail, input.type, input.message, input.page]
    );
    return res.rows[0];
  }

  static async list() {
    const res = await db.query(
      `SELECT f.id,
              f.user_id,
              f.user_email,
              f.type,
              f.message,
              f.page,
              f.status,
              f.created_at
       FROM feedback f
       ORDER BY f.created_at DESC`
    );
    return res.rows;
  }

  static async setStatus(id: string, status: FeedbackStatus) {
    const res = await db.query(
      `UPDATE feedback SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  }
}