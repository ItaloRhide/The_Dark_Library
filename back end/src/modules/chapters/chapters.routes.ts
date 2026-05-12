import { Router } from 'express';
import { ChaptersController } from './chapters.controller';

const router = Router();

router.post('/', ChaptersController.create);
router.get('/:id', ChaptersController.get);
router.patch('/:id', ChaptersController.update);
router.delete('/:id', ChaptersController.delete);

export default router;
