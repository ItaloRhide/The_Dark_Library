import { Router } from 'express';
import { BooksController } from './books.controller';
import { memoryUpload } from '../../middlewares/upload';
import { requireAuth, requireOwner } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', requireOwner, BooksController.create);
router.get('/', requireAuth, BooksController.list);
router.get('/:id', requireAuth, BooksController.get);
router.patch('/:id', requireOwner, BooksController.update);
router.patch('/:id/cover', requireOwner, memoryUpload.single('cover'), BooksController.updateCover);
router.delete('/:id', requireOwner, BooksController.delete);

export default router;
