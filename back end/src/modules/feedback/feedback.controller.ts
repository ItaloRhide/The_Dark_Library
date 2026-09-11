import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../utils/logger';
import { FeedbackService } from './feedback.service';

const submitSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'other']).default('other'),
  message: z.string().trim().min(10).max(5000),
  page: z.string().trim().max(500).nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(['new', 'read', 'resolved']),
});

export class FeedbackController {
  static async submit(req: Request, res: Response) {
    try {
      const parsed = submitSchema.parse(req.body);
      const feedback = await FeedbackService.create({
        userId: req.user!.id,
        userEmail: req.user!.email,
        type: parsed.type,
        message: parsed.message,
        page: parsed.page ?? null,
      });
      res.json(feedback);
    } catch (error: any) {
      logger.error('[Feedback] Erro ao salvar feedback:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const items = await FeedbackService.list();
      res.json(items);
    } catch (error: any) {
      logger.error('[Feedback] Erro ao listar feedbacks:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async setStatus(req: Request, res: Response) {
    try {
      const parsed = statusSchema.parse(req.body);
      const updated = await FeedbackService.setStatus(req.params.id as string, parsed.status);
      if (!updated) return res.status(404).json({ error: 'Feedback not found' });
      res.json(updated);
    } catch (error: any) {
      logger.error('[Feedback] Erro ao atualizar feedback:', error);
      res.status(400).json({ error: error.message });
    }
  }
}