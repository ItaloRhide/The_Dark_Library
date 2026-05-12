import { Request, Response } from 'express';
import { ChaptersService } from './chapters.service';
import { z } from 'zod';
import logger from '../../utils/logger';

const createChapterSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
});

const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export class ChaptersController {
  static async create(req: Request, res: Response) {
    try {
      const data = createChapterSchema.parse(req.body);
      const chapter = await ChaptersService.create(data);
      res.status(201).json(chapter);
    } catch (error: any) {
      logger.error('Erro ao criar capítulo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const chapter = await ChaptersService.findById(req.params.id);
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      res.json(chapter);
    } catch (error: any) {
      logger.error(`Erro ao buscar capítulo ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = updateChapterSchema.parse(req.body);
      const chapter = await ChaptersService.update(req.params.id, data);
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      res.json(chapter);
    } catch (error: any) {
      logger.error(`Erro ao atualizar capítulo ${req.params.id}:`, error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ChaptersService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao deletar capítulo ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
}
