export type Role = 'STUDENT' | 'TEACHER';
export type ContentType = 'TEXT' | 'VIDEO' | 'INTERACTIVE';
export type AssessmentType = 'QUIZ' | 'TEST' | 'PRACTICE';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type EventType =
  | 'LESSON_START'
  | 'LESSON_COMPLETE'
  | 'LESSON_COMPLETED'
  | 'TOPIC_VIEW'
  | 'ASSESSMENT_START'
  | 'ASSESSMENT_COMPLETE'
  | 'QUIZ_ATTEMPTED'
  | 'QUESTION_WRONG'
  | 'QUESTION_CORRECT'
  | 'TOPIC_REVISED'
  | 'CODING_ATTEMPT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  grade: string;
  learningStyle: string | null;
  xpPoints: number;
  streakDays: number;
  user: User;
  masteries?: StudentMastery[];
}

export interface Teacher {
  id: string;
  userId: string;
  department: string;
  qualification: string;
  user: User;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  subjectArea: string;
  gradeLevel: string;
  isPublished: boolean;
  teacher: Teacher;
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  contentType: ContentType;
  durationMinutes: number;
  orderIndex: number;
  isPublished: boolean;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  lessonId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  orderIndex: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  type: AssessmentType;
  totalMarks: number;
  passingMarks: number;
  timeLimitMinutes: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  orderIndex: number;
  topic?: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  totalPossible: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds?: number;
  assessment?: Assessment;
}

export interface StudentMastery {
  id: string;
  studentId: string;
  topic: string;
  score: number;
  percent: number;
  updatedAt: string;
}

export interface TopicDependency {
  id: string;
  topic: string;
  prerequisiteTopic: string;
}

export interface RecommendedRevision {
  topic: string;
  currentMastery: number;
  currentMasteryPercent: number;
  reason: string;
  prerequisite: {
    prerequisiteTopic: string;
    prerequisiteScore: number;
    isPrerequisiteSatisfied: boolean;
  } | null;
}

export interface MasterySummary {
  overallMastery: number;
  overallMasteryPercent: number;
  strongTopics: { topic: string; score: number; percent: number }[];
  weakTopics: { topic: string; score: number; percent: number }[];
  recommendedRevisionTopic: RecommendedRevision | null;
  allMasteries: StudentMastery[];
}

export interface LearningEventItem {
  id: string;
  studentId: string;
  lessonId?: string;
  topic?: string;
  eventType: EventType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Progress {
  studentId: string;
  user: User;
  grade: string;
  learningStyle: string;
  totalCourses: number;
  completedLessons: number;
  avgScore: number;
  streakDays: number;
  xpPoints: number;
  masterySummary: MasterySummary;
  enrollments: StudentCourse[];
  recentEvents: LearningEventItem[];
}

export interface TeacherStudentSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  grade: string;
  learningStyle: string;
  xpPoints: number;
  streakDays: number;
  avgScore: number;
  weakTopicsCount: number;
  weakTopics: string[];
  strongTopics: string[];
  totalAttempts: number;
}

export interface TeacherAnalytics {
  totalStudents: number;
  avgClassMastery: number;
  passRate: number;
  totalAttempts: number;
  weakAreas: { topic: string; studentCount: number }[];
  studentSummaries: TeacherStudentSummary[];
  recentEvents: LearningEventItem[];
}

export interface CourseProgress {
  courseId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface StudentCourse {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
  course: Course;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: Role;
  grade?: string;
  learningStyle?: string;
  department?: string;
  qualification?: string;
}
