import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../config/database';
import { z } from 'zod';

const eventSchema = z.object({
  lessonId: z.string(),
  eventType: z.string(),
  metadata: z.any().optional()
});

export const getStudentProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.params.id;
    // Check permissions: either the student themselves or a teacher
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (student?.id !== studentId) return sendError(res, 'Forbidden', 403);
    }

    const progress = await progressService.getStudentProgress(studentId);
    return sendSuccess(res, progress);
  } catch (error) {
    next(error);
  }
};

export const getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: studentId, courseId } = req.params;
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (student?.id !== studentId) return sendError(res, 'Forbidden', 403);
    }

    const progress = await progressService.getCourseProgress(studentId, courseId);
    return sendSuccess(res, progress);
  } catch (error) {
    next(error);
  }
};

export const logEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') return sendError(res, 'Only students can log learning events', 403);
    
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 'Student profile not found', 404);

    const data = eventSchema.parse(req.body);
    const event = await progressService.logLearningEvent({ ...data, studentId: student.id });
    
    // Asynchronously update progress without blocking response
    // progressService.updateCourseProgress(...) 

    return sendSuccess(res, event, 'Event logged successfully', 201);
  } catch (error) {
    next(error);
  }
};
