import { Request, Response } from 'express';
import { BooksService } from './books.service';
import { z } from 'zod';
import logger from '../../utils/logger';
import { supabaseStorage } from '../../services/supabase-storage';

const createBookSchema = z.object({
  title: z.string().min(1),
  color: z.string().nullable().optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export class BooksController {
  static async create(req: Request, res: Response) {
    try {
      const { title, color } = createBookSchema.parse(req.body);
      const book = await BooksService.create(title, color);
      res.status(201).json(book);
    } catch (error: any) {
      logger.error('Erro ao criar livro:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const books = await BooksService.findAll();
      res.json(books);
    } catch (error: any) {
      logger.error('Erro ao listar livros:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const book = await BooksService.findById(req.params.id as string);
      if (!book) return res.status(404).json({ error: 'Book not found' });
      res.json(book);
    } catch (error: any) {
      logger.error(`Erro ao buscar livro ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = updateBookSchema.parse(req.body);
      const book = await BooksService.update(req.params.id as string, data);
      if (!book) return res.status(404).json({ error: 'Book not found' });
      res.json(book);
    } catch (error: any) {
      logger.error(`Erro ao atualizar livro ${req.params.id}:`, error);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateCover(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const bookId = req.params.id as string;
      const ext = req.file.originalname.split('.').pop() || 'png';
      const storagePath = `${bookId}/cover.${ext}`;

      const publicUrl = await supabaseStorage.uploadBuffer(
        'covers',
        storagePath,
        req.file.buffer,
        req.file.mimetype,
      );

      if (!publicUrl) {
        return res.status(500).json({ error: 'Falha ao fazer upload da capa' });
      }

      const book = await BooksService.update(bookId, { cover_image: publicUrl });
      if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
      res.json(book);
    } catch (error: any) {
      logger.error(`Erro ao atualizar capa do livro ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await BooksService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao deletar livro ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
}
