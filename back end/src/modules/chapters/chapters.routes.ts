import { Router } from 'express';
import { ChaptersController } from './chapters.controller';
import { requireAuth, requireOwner } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', requireOwner, ChaptersController.create);
router.get('/:id', requireAuth, ChaptersController.get);
router.patch('/:id', requireOwner, ChaptersController.update);
router.delete('/:id', requireOwner, ChaptersController.delete);

export default router;
