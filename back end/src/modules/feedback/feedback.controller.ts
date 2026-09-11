import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../utils/logger';
import { feedbackService } from './feedback.service';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'other']).default('other'),
  message: z.string().trim().min(10).max(5000),
  page: z.string().trim().max(500).nullable().optional(),
});

export class FeedbackController {
  static async submit(req: Request, res: Response) {
    try {
      const parsed = feedbackSchema.parse(req.body);
      await feedbackService.submit({
        userEmail: req.user!.email,
        userId: req.user!.id,
        type: parsed.type,
        message: parsed.message,
        page: parsed.page ?? null,
      });
      res.json({ ok: true });
    } catch (error: any) {
      logger.error('[Feedback] Erro ao processar feedback:', error);
      res.status(400).json({ error: error.message });
    }
  }
}