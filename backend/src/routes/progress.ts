import { Router } from 'express';
import { getStudentProgress, getCourseProgress, logEvent } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/students/:id', getStudentProgress);
router.get('/students/:id/courses/:courseId', getCourseProgress);
router.post('/events', logEvent);

export default router;
