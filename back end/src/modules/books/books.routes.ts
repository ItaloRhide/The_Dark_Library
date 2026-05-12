import { Router } from 'express';
import { BooksController } from './books.controller';
import { upload } from '../../middlewares/upload';

const router = Router();

router.post('/', BooksController.create);
router.get('/', BooksController.list);
router.get('/:id', BooksController.get);
router.patch('/:id', BooksController.update);
router.patch('/:id/cover', upload.single('cover'), BooksController.updateCover);
router.delete('/:id', BooksController.delete);

export default router;
