import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService';
import * as masteryService from '../services/masteryService';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../config/database';
import { z } from 'zod';

const eventSchema = z.object({
  lessonId: z.string().optional(),
  topic: z.string().optional(),
  eventType: z.string(),
  metadata: z.any().optional(),
});

export const getStudentProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let studentId = req.params.id;

    if (studentId === 'me' || !studentId) {
      if (req.user?.role !== 'STUDENT') return sendError(res, 'Student profile required', 400);
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return sendError(res, 'Student profile not found', 404);
      studentId = student.id;
    } else if (req.user?.role === 'STUDENT') {
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

    return sendSuccess(res, event, 'Event logged successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getStudentMastery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let studentId = req.params.id;

    if (!studentId || studentId === 'me') {
      if (req.user?.role !== 'STUDENT') return sendError(res, 'Student profile required', 400);
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return sendError(res, 'Student profile not found', 404);
      studentId = student.id;
    }

    const summary = await masteryService.getStudentMasterySummary(studentId);
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const getTeacherAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'TEACHER') return sendError(res, 'Only teachers can access analytics', 403);

    const analytics = await masteryService.getTeacherAnalytics();
    return sendSuccess(res, analytics);
  } catch (error) {
    next(error);
  }
};

export const getTopicDependencies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deps = await masteryService.getTopicDependencies();
    return sendSuccess(res, deps);
  } catch (error) {
    next(error);
  }
};

export const updateStudentMastery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let studentId = req.params.id;
    if (!studentId || studentId === 'me') {
      if (req.user?.role === 'STUDENT') {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (student) studentId = student.id;
      }
    }
    const { topic, masteryScore } = req.body;
    if (!topic || masteryScore === undefined) {
      return sendError(res, 'topic and masteryScore are required', 400);
    }
    const result = await masteryService.updateStudentTopicMastery(studentId, topic, parseFloat(masteryScore));
    return sendSuccess(res, result, 'Mastery updated successfully');
  } catch (error) {
    next(error);
  }
};
