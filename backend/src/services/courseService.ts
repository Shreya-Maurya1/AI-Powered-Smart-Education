import { prisma } from '../config/database';

export const getAllCourses = async (filters?: { subjectArea?: string, gradeLevel?: string }) => {
  const where: any = { isPublished: true };
  if (filters?.subjectArea) where.subjectArea = filters.subjectArea;
  if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;

  return await prisma.course.findMany({
    where,
    include: {
      teacher: {
        include: { user: { select: { name: true } } }
      }
    }
  });
};

export const getCourseById = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: { topics: true }
          }
        }
      },
      assessments: true,
      teacher: {
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!course) throw { statusCode: 404, message: 'Course not found' };
  return course;
};

export const enrollStudent = async (studentId: string, courseId: string) => {
  const existing = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId, courseId } }
  });

  if (existing) throw { statusCode: 400, message: 'Already enrolled' };

  return await prisma.studentCourse.create({
    data: { studentId, courseId }
  });
};

export const getEnrolledCourses = async (studentId: string) => {
  return await prisma.studentCourse.findMany({
    where: { studentId },
    include: { course: true }
  });
};
