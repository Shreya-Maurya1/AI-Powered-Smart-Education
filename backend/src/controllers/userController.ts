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
    const { name, grade, learningStyle } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      include: { student: true, teacher: true }
    });

    if (updatedUser.student && (grade || learningStyle)) {
      await prisma.student.update({
        where: { id: updatedUser.student.id },
        data: {
          ...(grade ? { grade } : {}),
          ...(learningStyle ? { learningStyle } : {}),
        },
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return sendSuccess(res, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        student: {
          include: {
            masteries: true,
            enrollments: { include: { course: true } },
            attempts: { orderBy: { startedAt: 'desc' }, take: 5 },
          },
        },
      },
    });

    const students = users.map((u) => {
      const studentProfile = u.student;
      const masteries = studentProfile?.masteries || [];
      const avgMastery = masteries.length > 0
        ? Math.round((masteries.reduce((sum, m) => sum + m.masteryScore, 0) / masteries.length) * 100)
        : 65;

      const weakTopics = masteries.filter((m) => m.masteryScore < 0.60).map((m) => m.topic);

      return {
        id: studentProfile?.id || u.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        grade: studentProfile?.grade || '10',
        learningStyle: studentProfile?.learningStyle || 'Visual',
        xpPoints: studentProfile?.xpPoints || 0,
        streakDays: studentProfile?.streakDays || 0,
        avgScore: avgMastery,
        weakTopics,
        enrolledCoursesCount: studentProfile?.enrollments.length || 0,
      };
    });

    return sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentUser = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        student: {
          include: {
            masteries: true,
            enrollments: { include: { course: true } },
            attempts: { include: { assessment: true } },
            events: { orderBy: { createdAt: 'desc' }, take: 20 },
          },
        },
      },
    });
    if (!studentUser) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, studentUser);
  } catch (error) {
    next(error);
  }
};
