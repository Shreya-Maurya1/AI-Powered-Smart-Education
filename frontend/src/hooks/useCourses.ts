'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course, StudentCourse } from '@/types';
import { coursesApi } from '@/lib/api';

export function useCourses(filters?: { subjectArea?: string; gradeLevel?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.list(filters);
      setCourses(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [filters?.subjectArea, filters?.gradeLevel]);

  const fetchEnrolled = useCallback(async () => {
    try {
      const data = await coursesApi.enrolled();
      setEnrolledCourses(data || []);
    } catch {
      // ignore
    }
  }, []);

  const enroll = useCallback(async (courseId: string) => {
    try {
      const res = await coursesApi.enroll(courseId);
      await fetchEnrolled();
      return res;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Enrollment failed');
    }
  }, [fetchEnrolled]);

  useEffect(() => {
    fetchCourses();
    fetchEnrolled();
  }, [fetchCourses, fetchEnrolled]);

  return {
    courses,
    enrolledCourses,
    loading,
    error,
    refetch: fetchCourses,
    enroll,
  };
}
