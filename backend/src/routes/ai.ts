import { Router, Request, Response, NextFunction } from 'express';
import { aiServiceClient } from '../services/aiServiceClient';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

router.use(authenticate);

// POST /api/ai/learning
router.post('/learning', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let studentId = req.body.studentId;
    if (!studentId || studentId === 'me') {
      if (req.user?.id) {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (student) {
          studentId = student.id;
        }
      }
    }

    if (!studentId) {
      studentId = 'student-demo';
    }

    const { topic, studentResponse, targetMastery, context } = req.body;
    const response = await aiServiceClient.getLearningDecision(
      studentId,
      topic,
      studentResponse,
      targetMastery || 0.75,
      context || {}
    );

    return sendSuccess(res, response);
  } catch (error: any) {
    return sendError(res, error.message || 'AI Learning Adaptation failed', 500);
  }
});

export default router;
