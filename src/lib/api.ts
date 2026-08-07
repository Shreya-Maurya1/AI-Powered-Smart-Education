import axios from 'axios';
import { getToken, clearAuth } from './auth';
import type {
  ApiResponse,
  AuthResponse,
  Course,
  Assessment,
  Attempt,
  Progress,
  CourseProgress,
  User,
  StudentCourse,
  RegisterData
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then(r => r.data.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then(r => r.data.data),
  me: () => apiClient.get<ApiResponse<User>>('/auth/me').then(r => r.data.data),
};

// Courses
export const coursesApi = {
  list: (filters?: { subjectArea?: string; gradeLevel?: string }) =>
    apiClient.get<ApiResponse<Course[]>>('/courses', { params: filters }).then(r => r.data.data),
  getById: (id: string) => apiClient.get<ApiResponse<Course>>(`/courses/${id}`).then(r => r.data.data),
  enroll: (courseId: string) => apiClient.post<ApiResponse<StudentCourse>>(`/courses/${courseId}/enroll`).then(r => r.data.data),
  enrolled: () => apiClient.get<ApiResponse<StudentCourse[]>>('/courses/enrolled').then(r => r.data.data),
};

// Assessments
export const assessmentsApi = {
  getById: (id: string) => apiClient.get<ApiResponse<Assessment>>(`/assessments/${id}`).then(r => r.data.data),
  submit: (data: { assessmentId: string; answers: Record<string, string>; timeTakenSeconds: number; startedAt?: string }) =>
    apiClient.post<ApiResponse<{ attempt: Attempt; score: number; passed: boolean }>>('/assessments/submit', {
      ...data,
      startedAt: data.startedAt || new Date().toISOString()
    }).then(r => r.data.data),
  attempts: () => apiClient.get<ApiResponse<Attempt[]>>('/assessments/attempts').then(r => r.data.data),
};

// Progress
export const progressApi = {
  student: (studentId: string) => apiClient.get<ApiResponse<Progress>>(`/progress/students/${studentId}`).then(r => r.data.data),
  course: (studentId: string, courseId: string) =>
    apiClient.get<ApiResponse<CourseProgress>>(`/progress/students/${studentId}/courses/${courseId}`).then(r => r.data.data),
  logEvent: (data: { lessonId: string; eventType: string; metadata?: Record<string, unknown> }) =>
    apiClient.post<ApiResponse<unknown>>('/progress/events', data).then(r => r.data.data),
};

// Users
export const usersApi = {
  me: () => apiClient.get<ApiResponse<User>>('/users/me').then(r => r.data.data),
  updateProfile: (data: Partial<{ name: string; grade: string; learningStyle: string }>) =>
    apiClient.put<ApiResponse<User>>('/users/me', data).then(r => r.data.data),
  students: () => apiClient.get<ApiResponse<User[]>>('/users/students').then(r => r.data.data),
  getStudent: (id: string) => apiClient.get<ApiResponse<User>>(`/users/students/${id}`).then(r => r.data.data),
};

export default apiClient;
