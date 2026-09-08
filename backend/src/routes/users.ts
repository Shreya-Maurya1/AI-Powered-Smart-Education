import { Router } from 'express';
import { getMe, updateMe, getStudents, getStudentById } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);

router.get('/students', requireRole('TEACHER'), getStudents);
router.get('/students/:id', requireRole('TEACHER'), getStudentById);

export default router;
