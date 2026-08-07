import { Router } from 'express';
import { getAssessment, submitAssessment, getAttempts } from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/attempts', getAttempts);
router.get('/:id', getAssessment);
router.post('/submit', submitAssessment);

export default router;
