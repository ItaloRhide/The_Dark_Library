import { Router } from 'express';
import { FeedbackController } from './feedback.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, FeedbackController.submit);

export default router;