import { Router } from 'express';
import { ProgressController } from './progress.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:bookId', requireAuth, ProgressController.get);
router.put('/:bookId', requireAuth, ProgressController.set);

export default router;