import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../utils/logger';
import { ProgressService } from './progress.service';

const setProgressSchema = z.object({
  chapterId: z.string().nullable().optional(),
  charOffset: z.number().int().min(0).default(0),
});

export class ProgressController {
  static async get(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const bookId = req.params.bookId as string;
      const progress = await ProgressService.find(userId, bookId);
      if (!progress) return res.status(404).json({ error: 'Progress not found' });
      res.json(progress);
    } catch (error: any) {
      logger.error(`Erro ao buscar progresso do livro ${req.params.bookId}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  static async set(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const bookId = req.params.bookId as string;
      const parsed = setProgressSchema.parse(req.body);
      const progress = await ProgressService.set(
        userId,
        bookId,
        parsed.chapterId ?? null,
        parsed.charOffset
      );
      res.json(progress);
    } catch (error: any) {
      logger.error(`Erro ao salvar progresso do livro ${req.params.bookId}:`, error);
      res.status(400).json({ error: error.message });
    }
  }
}