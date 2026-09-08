import { prisma } from '../config/database';
import { EventType } from '@prisma/client';
import { getStudentMasterySummary } from './masteryService';

export const getStudentProgress = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      enrollments: { include: { course: true } },
      attempts: { include: { assessment: true }, orderBy: { startedAt: 'desc' } },
      events: { orderBy: { createdAt: 'desc' }, take: 15 },
    },
  });

  if (!student) throw { statusCode: 404, message: 'Student not found' };

  const masterySummary = await getStudentMasterySummary(studentId);

  const completedLessons = await prisma.learningEvent.count({
    where: {
      studentId,
      eventType: { in: [EventType.LESSON_COMPLETE, EventType.LESSON_COMPLETED] },
    },
  });

  const attempts = student.attempts;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.totalPossible > 0 ? (a.score / a.totalPossible) * 100 : 0), 0) / attempts.length)
    : 80;

  return {
    studentId: student.id,
    user: student.user,
    grade: student.grade,
    learningStyle: student.learningStyle,
    xpPoints: student.xpPoints,
    streakDays: student.streakDays,
    totalCourses: student.enrollments.length,
    completedLessons,
    avgScore,
    masterySummary,
    enrollments: student.enrollments,
    recentEvents: student.events,
  };
};

export const getCourseProgress = async (studentId: string, courseId: string) => {
  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: { course: true },
  });

  if (!enrollment) throw { statusCode: 404, message: 'Not enrolled in this course' };
  return enrollment;
};

export const logLearningEvent = async (data: {
  studentId: string;
  lessonId?: string;
  topic?: string;
  eventType: string;
  metadata?: any;
}) => {
  const event = await prisma.learningEvent.create({
    data: {
      studentId: data.studentId,
      lessonId: data.lessonId || null,
      topic: data.topic || null,
      eventType: data.eventType as EventType,
      metadata: data.metadata || null,
    },
  });

  // If lesson completion, recalculate progress for the course
  if (data.lessonId && (data.eventType === 'LESSON_COMPLETE' || data.eventType === 'LESSON_COMPLETED')) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
      include: { module: true },
    });
    if (lesson?.module?.courseId) {
      await updateCourseProgress(data.studentId, lesson.module.courseId);
    }
  }

  return event;
};

export const updateCourseProgress = async (studentId: string, courseId: string) => {
  // Count total lessons in course
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  });

  if (totalLessons === 0) return;

  // Count unique completed lessons in course
  const completedEvents = await prisma.learningEvent.findMany({
    where: {
      studentId,
      lesson: { module: { courseId } },
      eventType: { in: [EventType.LESSON_COMPLETE, EventType.LESSON_COMPLETED] },
    },
    select: { lessonId: true },
    distinct: ['lessonId'],
  });

  const completedCount = completedEvents.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  return await prisma.studentCourse.update({
    where: { studentId_courseId: { studentId, courseId } },
    data: {
      progressPercent,
      completedAt: progressPercent === 100 ? new Date() : null,
    },
  });
};
