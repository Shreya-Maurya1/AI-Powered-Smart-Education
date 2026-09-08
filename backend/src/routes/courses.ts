import { Router } from 'express';
import { getCourses, getCourse, getEnrolled, enroll } from '../controllers/courseController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getCourses);
router.get('/enrolled', authenticate, getEnrolled);
router.get('/:id', getCourse);
router.post('/:id/enroll', authenticate, enroll);

export default router;
