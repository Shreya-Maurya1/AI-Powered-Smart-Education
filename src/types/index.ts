export type Role = 'STUDENT' | 'TEACHER';
export type ContentType = 'TEXT' | 'VIDEO' | 'INTERACTIVE';
export type AssessmentType = 'QUIZ' | 'TEST' | 'PRACTICE';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type EventType =
  | 'LESSON_START'
  | 'LESSON_COMPLETE'
  | 'TOPIC_VIEW'
  | 'ASSESSMENT_START'
  | 'ASSESSMENT_COMPLETE';

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

export interface Progress {
  totalCourses: number;
  completedLessons: number;
  avgScore: number;
  streakDays: number;
  xpPoints: number;
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
