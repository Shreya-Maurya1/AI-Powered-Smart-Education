import { prisma } from '../config/database';
import { updateMasteryAfterQuizAttempt } from './masteryService';

export const getAssessmentById = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: true, course: true }
  });
  if (!assessment) throw { statusCode: 404, message: 'Assessment not found' };
  return assessment;
};

export const submitAttempt = async (data: {
  studentId: string;
  assessmentId: string;
  answers: Record<string, string>;
  startedAt: Date;
  timeTakenSeconds: number;
}) => {
  const { studentId, assessmentId, answers, startedAt, timeTakenSeconds } = data;

  const assessment = await getAssessmentById(assessmentId);

  let score = 0;
  let totalPossible = 0;
  const correctAnswersMap: Record<string, boolean> = {};

  for (const question of assessment.questions) {
    totalPossible += question.points;
    const studentAnswer = answers[question.id];
    if (studentAnswer !== undefined && studentAnswer === question.correctAnswer) {
      score += question.points;
      correctAnswersMap[question.id] = true;
    } else {
      correctAnswersMap[question.id] = false;
    }
  }

  const passed = score >= assessment.passingMarks;

  // 1. Create Attempt record
  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      assessmentId,
      answers: answers as any,
      score,
      totalPossible,
      passed,
      startedAt,
      completedAt: new Date(),
      timeTakenSeconds
    }
  });

  // 2. Trigger Mastery Calculation & Learning Event Emission
  const masteryResult = await updateMasteryAfterQuizAttempt(
    studentId,
    assessmentId,
    answers,
    score,
    totalPossible,
    passed
  );

  // 3. Award XP & update streak for student
  const xpEarned = passed ? 50 : 20;
  await prisma.student.update({
    where: { id: studentId },
    data: {
      xpPoints: { increment: xpEarned },
    },
  });

  return {
    attempt,
    score,
    totalPossible,
    passed,
    correctAnswersMap,
    xpEarned,
    masteryUpdates: masteryResult.updates,
    eventsLogged: masteryResult.eventsLogged
  };
};

export const getStudentAttempts = async (studentId: string, assessmentId?: string) => {
  const where: any = { studentId };
  if (assessmentId) where.assessmentId = assessmentId;

  return await prisma.attempt.findMany({
    where,
    include: { assessment: true },
    orderBy: { startedAt: 'desc' }
  });
};
