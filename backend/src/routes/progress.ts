import { Router } from 'express';
import {
  getStudentProgress,
  getCourseProgress,
  logEvent,
  getStudentMastery,
  getTeacherAnalytics,
  getTopicDependencies,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/teacher/analytics', getTeacherAnalytics);
router.get('/dependencies', getTopicDependencies);
router.get('/students/:id/mastery', getStudentMastery);
router.get('/students/:id/courses/:courseId', getCourseProgress);
router.get('/students/:id', getStudentProgress);
router.post('/events', logEvent);

export default router;
