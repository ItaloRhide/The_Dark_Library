import { Router } from 'express';
import { FeedbackController } from './feedback.controller';
import { requireOwner, requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, FeedbackController.submit);
router.get('/', requireOwner, FeedbackController.list);
router.patch('/:id', requireOwner, FeedbackController.setStatus);

export default router;