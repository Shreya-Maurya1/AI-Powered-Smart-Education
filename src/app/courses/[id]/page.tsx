'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { coursesApi } from '@/lib/api';
import { Course } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { BookOpen, Clock, CheckCircle, PlayCircle, HelpCircle, ArrowLeft } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await coursesApi.getById(id);
        setCourse(data);
        const enrolledList = await coursesApi.enrolled();
        setIsEnrolled(enrolledList.some((e) => e.courseId === id));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesApi.enroll(id);
      setIsEnrolled(true);
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRole="STUDENT">
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute allowedRole="STUDENT">
        <div className="text-center py-20">Course not found.</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {course.subjectArea}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Grade {course.gradeLevel}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{course.description}</p>
            </div>

            <div className="w-full md:w-auto">
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full md:w-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> Enrolled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Course Modules & Lessons</h2>

          {course.modules?.length === 0 ? (
            <p className="text-gray-500 text-sm">No modules available yet.</p>
          ) : (
            course.modules?.map((module, mIdx) => (
              <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
                  <span>Module {mIdx + 1}: {module.title}</span>
                  <span className="text-xs text-gray-500 font-normal">{module.lessons?.length || 0} Lessons</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {module.lessons?.map((lesson) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.durationMinutes} mins</span>
                            <span>{lesson.contentType}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/learning?lessonId=${lesson.id}`}
                        className="py-1.5 px-3 bg-indigo-50 text-indigo-700 font-semibold rounded text-xs hover:bg-indigo-100 transition-colors"
                      >
                        Start Lesson
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
