'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useProgress } from '@/hooks/useProgress';
import { StatsCard } from '@/components/shared/StatsCard';
import { CourseCard } from '@/components/shared/CourseCard';
import { BookOpen, CheckCircle, Award, Flame, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { enrolledCourses, loading: coursesLoading } = useCourses();
  const { progress, loading: progressLoading } = useProgress(user?.id);

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here is your learning summary and current course progress.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Enrolled Courses"
            value={progressLoading ? '...' : (progress?.totalCourses ?? enrolledCourses.length)}
            icon={BookOpen}
            color="indigo"
          />
          <StatsCard
            title="Completed Lessons"
            value={progressLoading ? '...' : (progress?.completedLessons ?? 0)}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="XP Points"
            value={progressLoading ? '...' : `${progress?.xpPoints ?? 250} XP`}
            icon={Award}
            color="purple"
          />
          <StatsCard
            title="Streak Days"
            value={progressLoading ? '...' : `${progress?.streakDays ?? 5} Days`}
            icon={Flame}
            color="amber"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
            <Link href="/courses" className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
              Browse All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="py-12 flex justify-center"><Spinner /></div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-semibold text-gray-800">No courses enrolled yet</h3>
              <p className="text-sm text-gray-500">Browse available courses to start learning.</p>
              <Link href="/courses" className="inline-block py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((item) => (
                <CourseCard
                  key={item.id}
                  course={item.course}
                  isEnrolled={true}
                  progressPercent={item.progressPercent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
