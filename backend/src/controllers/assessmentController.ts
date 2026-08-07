import { Request, Response, NextFunction } from 'express';
import * as assessmentService from '../services/assessmentService';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../config/database';
import { z } from 'zod';

const submitSchema = z.object({
  assessmentId: z.string(),
  answers: z.record(z.string(), z.string()),
  startedAt: z.string().transform(val => new Date(val)),
  timeTakenSeconds: z.number()
});

export const getAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);
    return sendSuccess(res, assessment);
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') return sendError(res, 'Only students can submit assessments', 403);

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 'Student profile not found', 404);

    const data = submitSchema.parse(req.body);
    const result = await assessmentService.submitAttempt({ ...data, studentId: student.id });
    return sendSuccess(res, result, 'Assessment submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAttempts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') return sendError(res, 'Only students can view attempts', 403);

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 'Student profile not found', 404);

    const attempts = await assessmentService.getStudentAttempts(student.id, req.query.assessmentId as string);
    return sendSuccess(res, attempts);
  } catch (error) {
    next(error);
  }
};
