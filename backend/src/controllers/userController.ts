import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import * as authService from '../services/authService';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const user = await authService.getUserById(req.user.id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { name } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      include: { student: true, teacher: true }
    });
    
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return sendSuccess(res, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true, student: true }
    });
    return sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'STUDENT' },
      select: { id: true, name: true, email: true, student: true }
    });
    if (!student) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};
