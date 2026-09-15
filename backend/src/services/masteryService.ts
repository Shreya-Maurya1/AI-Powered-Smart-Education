import { prisma } from '../config/database';
import { EventType } from '@prisma/client';

export interface MasteryUpdateResult {
  topic: string;
  previousMastery: number;
  newMastery: number;
  change: number;
}

/**
 * Deterministic Mastery Formula:
 * new_mastery = previous_mastery + performance_adjustment - repeated_mistake_penalty
 *
 * performance_adjustment:
 *   - Correct: +0.15 * (1.0 - previous_mastery)  [diminishing gains near 1.0]
 *   - Wrong:   -0.10 * previous_mastery
 *
 * repeated_mistake_penalty:
 *   - 0.05 * (count of recent wrong attempts on topic) [capped at 0.15]
 */
export function calculateNewMastery(
  previousMastery: number,
  isCorrect: boolean,
  recentMistakeCount: number = 0
): number {
  let performanceAdjustment = 0;
  let repeatedMistakePenalty = 0;

  if (isCorrect) {
    performanceAdjustment = 0.15 * (1.0 - previousMastery);
    repeatedMistakePenalty = 0;
  } else {
    performanceAdjustment = -0.10 * previousMastery;
    repeatedMistakePenalty = Math.min(0.15, 0.05 * recentMistakeCount);
  }

  const rawMastery = previousMastery + performanceAdjustment - repeatedMistakePenalty;
  const clampedMastery = Math.max(0.0, Math.min(1.0, rawMastery));
  return Math.round(clampedMastery * 100) / 100;
}

/**
 * Process a quiz attempt, log question events, update deterministic mastery scores.
 */
export async function updateMasteryAfterQuizAttempt(
  studentId: string,
  assessmentId: string,
  answers: Record<string, string>,
  score: number,
  totalPossible: number,
  passed: boolean
): Promise<{ updates: MasteryUpdateResult[]; eventsLogged: number }> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true, course: true },
  });

  if (!assessment) {
    throw { statusCode: 404, message: 'Assessment not found' };
  }

  // 1. Log overall QUIZ_ATTEMPTED event
  await prisma.learningEvent.create({
    data: {
      studentId,
      lessonId: assessment.lessonId || undefined,
      eventType: EventType.QUIZ_ATTEMPTED,
      metadata: {
        assessmentId,
        assessmentTitle: assessment.title,
        score,
        totalPossible,
        passed,
      },
    },
  });

  const topicUpdatesMap = new Map<string, { totalQuestions: number; correctCount: number }>();

  let eventsLogged = 1;

  // 2. Iterate through each question
  for (const question of assessment.questions) {
    const studentAnswer = answers[question.id];
    const isCorrect = studentAnswer !== undefined && studentAnswer === question.correctAnswer;
    const topic = question.topic || assessment.title || 'General';

    // Log individual question event
    await prisma.learningEvent.create({
      data: {
        studentId,
        lessonId: assessment.lessonId || undefined,
        topic,
        eventType: isCorrect ? EventType.QUESTION_CORRECT : EventType.QUESTION_WRONG,
        metadata: {
          assessmentId,
          questionId: question.id,
          questionText: question.questionText,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          points: question.points,
        },
      },
    });
    eventsLogged++;

    const current = topicUpdatesMap.get(topic) || { totalQuestions: 0, correctCount: 0 };
    current.totalQuestions += 1;
    if (isCorrect) current.correctCount += 1;
    topicUpdatesMap.set(topic, current);
  }

  const updates: MasteryUpdateResult[] = [];

  // 3. Update mastery for each affected topic
  for (const [topic, stats] of topicUpdatesMap.entries()) {
    const existingMastery = await prisma.studentMastery.findUnique({
      where: { studentId_topic: { studentId, topic } },
    });

    const previousScore = existingMastery ? existingMastery.masteryScore : 0.50;

    // Count recent wrong events for repeated mistake penalty calculation
    const recentMistakes = await prisma.learningEvent.count({
      where: {
        studentId,
        topic,
        eventType: EventType.QUESTION_WRONG,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
        },
      },
    });

    const isMajorityCorrect = stats.correctCount / stats.totalQuestions >= 0.6;
    const newMastery = calculateNewMastery(previousScore, isMajorityCorrect, recentMistakes);
    const change = Math.round((newMastery - previousScore) * 100) / 100;

    await prisma.studentMastery.upsert({
      where: { studentId_topic: { studentId, topic } },
      update: { masteryScore: newMastery, updatedAt: new Date() },
      create: { studentId, topic, masteryScore: newMastery },
    });

    updates.push({
      topic,
      previousMastery: previousScore,
      newMastery,
      change,
    });
  }

  return { updates, eventsLogged };
}

/**
 * Get comprehensive student mastery analytics.
 */
export async function getStudentMasterySummary(studentId: string) {
  const masteries = await prisma.studentMastery.findMany({
    where: { studentId },
    orderBy: { masteryScore: 'asc' },
  });

  if (masteries.length === 0) {
    return {
      overallMastery: 0.5,
      overallMasteryPercent: 50,
      strongTopics: [],
      weakTopics: [],
      recommendedRevisionTopic: null,
      allMasteries: [],
    };
  }

  const totalScore = masteries.reduce((sum, m) => sum + m.masteryScore, 0);
  const overallMastery = Math.round((totalScore / masteries.length) * 100) / 100;
  const overallMasteryPercent = Math.round(overallMastery * 100);

  const strongTopics = masteries
    .filter((m) => m.masteryScore >= 0.75)
    .map((m) => ({ topic: m.topic, score: m.masteryScore, percent: Math.round(m.masteryScore * 100) }));

  const weakTopics = masteries
    .filter((m) => m.masteryScore < 0.60)
    .map((m) => ({ topic: m.topic, score: m.masteryScore, percent: Math.round(m.masteryScore * 100) }));

  // Deterministic lowest mastery topic recommendation with prerequisite lookup
  let recommendedRevisionTopic = null;
  const lowestMasteryItem = masteries[0]; // sorted ascending

  if (lowestMasteryItem) {
    const dependency = await prisma.topicDependency.findFirst({
      where: { topic: lowestMasteryItem.topic },
    });

    let prerequisiteStatus = null;
    if (dependency) {
      const prereqMastery = await prisma.studentMastery.findUnique({
        where: { studentId_topic: { studentId, topic: dependency.prerequisiteTopic } },
      });
      prerequisiteStatus = {
        prerequisiteTopic: dependency.prerequisiteTopic,
        prerequisiteScore: prereqMastery ? prereqMastery.masteryScore : 0,
        isPrerequisiteSatisfied: prereqMastery ? prereqMastery.masteryScore >= 0.70 : false,
      };
    }

    recommendedRevisionTopic = {
      topic: lowestMasteryItem.topic,
      currentMastery: lowestMasteryItem.masteryScore,
      currentMasteryPercent: Math.round(lowestMasteryItem.masteryScore * 100),
      prerequisite: prerequisiteStatus,
      reason: `Lowest mastery topic (${Math.round(lowestMasteryItem.masteryScore * 100)}%). Recommending targeted practice.`,
    };
  }

  return {
    overallMastery,
    overallMasteryPercent,
    strongTopics,
    weakTopics,
    recommendedRevisionTopic,
    allMasteries: masteries.map((m) => ({
      id: m.id,
      topic: m.topic,
      score: m.masteryScore,
      percent: Math.round(m.masteryScore * 100),
      updatedAt: m.updatedAt,
    })),
  };
}

/**
 * Get class-wide teacher analytics derived from student mastery & events.
 */
export async function getTeacherAnalytics() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      masteries: true,
      attempts: {
        include: { assessment: true },
        orderBy: { startedAt: 'desc' },
      },
      events: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const allMasteries = await prisma.studentMastery.findMany();
  const allEvents = await prisma.learningEvent.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate overall class average mastery
  const totalMasterySum = allMasteries.reduce((acc, curr) => acc + curr.masteryScore, 0);
  const avgClassMastery = allMasteries.length > 0
    ? Math.round((totalMasterySum / allMasteries.length) * 100)
    : 70;

  // Weak areas aggregate across students (topic mastery < 0.60)
  const weakTopicCountMap = new Map<string, number>();
  allMasteries.forEach((m) => {
    if (m.masteryScore < 0.60) {
      weakTopicCountMap.set(m.topic, (weakTopicCountMap.get(m.topic) || 0) + 1);
    }
  });

  const weakAreas = Array.from(weakTopicCountMap.entries())
    .map(([topic, count]) => ({ topic, studentCount: count }))
    .sort((a, b) => b.studentCount - a.studentCount);

  // Student summary roster with actual computed masteries
  const studentSummaries = students.map((s) => {
    const sMasteries = s.masteries;
    const avgScore = sMasteries.length > 0
      ? Math.round((sMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / sMasteries.length) * 100)
      : 50;

    const weakList = sMasteries.filter((m) => m.masteryScore < 0.60).map((m) => m.topic);
    const strongList = sMasteries.filter((m) => m.masteryScore >= 0.75).map((m) => m.topic);

    return {
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      grade: s.grade,
      learningStyle: s.learningStyle || 'Visual',
      xpPoints: s.xpPoints,
      streakDays: s.streakDays,
      avgScore,
      weakTopicsCount: weakList.length,
      weakTopics: weakList,
      strongTopics: strongList,
      totalAttempts: s.attempts.length,
    };
  });

  const totalAttempts = await prisma.attempt.count();
  const passedAttempts = await prisma.attempt.count({ where: { passed: true } });
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 80;

  return {
    totalStudents: students.length,
    avgClassMastery,
    passRate,
    totalAttempts,
    weakAreas,
    studentSummaries,
    recentEvents: allEvents.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      topic: e.topic,
      eventType: e.eventType,
      createdAt: e.createdAt,
      metadata: e.metadata,
    })),
  };
}

/**
 * Get topic dependencies graph.
 */
export async function getTopicDependencies() {
  return await prisma.topicDependency.findMany({
    orderBy: { topic: 'asc' },
  });
}

/**
 * Directly update or set a student's topic mastery score (used by AI Learning Adaptation Agent).
 */
export async function updateStudentTopicMastery(
  studentId: string,
  topic: string,
  newMastery: number
): Promise<{ topic: string; previousMastery: number; newMastery: number; change: number }> {
  const existing = await prisma.studentMastery.findUnique({
    where: { studentId_topic: { studentId, topic } },
  });

  const previousMastery = existing ? existing.masteryScore : 0.50;
  const clampedMastery = Math.max(0.0, Math.min(1.0, Math.round(newMastery * 100) / 100));
  const change = Math.round((clampedMastery - previousMastery) * 100) / 100;

  await prisma.studentMastery.upsert({
    where: { studentId_topic: { studentId, topic } },
    update: { masteryScore: clampedMastery, updatedAt: new Date() },
    create: { studentId, topic, masteryScore: clampedMastery },
  });

  return { topic, previousMastery, newMastery: clampedMastery, change };
}
