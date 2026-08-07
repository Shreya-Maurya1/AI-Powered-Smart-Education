import { prisma } from '../config/database';

export const getAssessmentById = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: true }
  });
  if (!assessment) throw { statusCode: 404, message: 'Assessment not found' };
  return assessment;
};

export const submitAttempt = async (data: { studentId: string; assessmentId: string; answers: Record<string, string>; startedAt: Date; timeTakenSeconds: number }) => {
  const { studentId, assessmentId, answers, startedAt, timeTakenSeconds } = data;

  const assessment = await getAssessmentById(assessmentId);
  
  let score = 0;
  let totalPossible = 0;
  const correctAnswers: Record<string, boolean> = {};

  for (const question of assessment.questions) {
    totalPossible += question.points;
    const studentAnswer = answers[question.id];
    if (studentAnswer && studentAnswer === question.correctAnswer) {
      score += question.points;
      correctAnswers[question.id] = true;
    } else {
      correctAnswers[question.id] = false;
    }
  }

  const passed = score >= assessment.passingMarks;

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

  return { attempt, score, passed, correctAnswers };
};

export const getStudentAttempts = async (studentId: string, assessmentId?: string) => {
  const where: any = { studentId };
  if (assessmentId) where.assessmentId = assessmentId;

  return await prisma.attempt.findMany({
    where,
    include: { assessment: true }
  });
};
