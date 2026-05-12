import { Request, Response } from 'express';
import { BooksService } from './books.service';
import { z } from 'zod';
import logger from '../../utils/logger';

const createBookSchema = z.object({
  title: z.string().min(1),
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
});

export class BooksController {
  static async create(req: Request, res: Response) {
    try {
      const { title } = createBookSchema.parse(req.body);
      const book = await BooksService.create(title);
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
      const book = await BooksService.findById(req.params.id);
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
      const book = await BooksService.update(req.params.id, data);
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

      const coverUrl = `/uploads/covers/${req.file.filename}`;
      const book = await BooksService.update(req.params.id, { cover_image: coverUrl });
      
      if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
      res.json(book);
    } catch (error: any) {
      logger.error(`Erro ao atualizar capa do livro ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await BooksService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao deletar livro ${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
}
