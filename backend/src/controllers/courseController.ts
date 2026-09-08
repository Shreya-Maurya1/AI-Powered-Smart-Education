import { Request, Response, NextFunction } from 'express';
import * as courseService from '../services/courseService';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../config/database';

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      subjectArea: req.query.subjectArea as string,
      gradeLevel: req.query.gradeLevel as string
    };
    const courses = await courseService.getAllCourses(filters);
    return sendSuccess(res, courses);
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    return sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

export const getEnrolled = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') {
      return sendError(res, 'Only students can view enrolled courses', 403);
    }
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 'Student profile not found', 404);
    
    const courses = await courseService.getEnrolledCourses(student.id);
    return sendSuccess(res, courses);
  } catch (error) {
    next(error);
  }
};

export const enroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') {
      return sendError(res, 'Only students can enroll in courses', 403);
    }
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 'Student profile not found', 404);

    const enrollment = await courseService.enrollStudent(student.id, req.params.id);
    return sendSuccess(res, enrollment, 'Successfully enrolled in course');
  } catch (error) {
    next(error);
  }
};
