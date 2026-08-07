import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import assessmentRoutes from './assessments';
import progressRoutes from './progress';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/progress', progressRoutes);
router.use('/users', userRoutes);

export default router;
