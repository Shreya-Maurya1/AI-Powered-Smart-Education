import { prisma } from '../config/database';
import { EventType } from '@prisma/client';

export const getStudentProgress = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { enrollments: true, attempts: true }
  });
  if (!student) throw { statusCode: 404, message: 'Student not found' };
  return student;
};

export const getCourseProgress = async (studentId: string, courseId: string) => {
  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId, courseId } }
  });
  if (!enrollment) throw { statusCode: 404, message: 'Not enrolled in this course' };
  return enrollment;
};

export const logLearningEvent = async (data: { studentId: string; lessonId: string; eventType: string; metadata?: any }) => {
  return await prisma.learningEvent.create({
    data: {
      studentId: data.studentId,
      lessonId: data.lessonId,
      eventType: data.eventType as EventType,
      metadata: data.metadata || null
    }
  });
};

export const updateCourseProgress = async (studentId: string, courseId: string) => {
  // Simple implementation: just set progress to a random number for now
  // In a real scenario, this would calculate based on completed lessons/assessments
  const newProgress = Math.min(100, Math.floor(Math.random() * 20) + 10);
  
  return await prisma.studentCourse.update({
    where: { studentId_courseId: { studentId, courseId } },
    data: { progressPercent: newProgress }
  });
};
