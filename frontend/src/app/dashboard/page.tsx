'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useProgress } from '@/hooks/useProgress';
import { StatsCard } from '@/components/shared/StatsCard';
import { CourseCard } from '@/components/shared/CourseCard';
import {
  BookOpen,
  CheckCircle,
  Award,
  Flame,
  ArrowRight,
  Brain,
  TrendingUp,
  AlertTriangle,
  Activity,
  RotateCcw,
  Code2
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { enrolledCourses, loading: coursesLoading } = useCourses();
  const { progress, loading: progressLoading } = useProgress(user?.id);

  const masterySummary = progress?.masterySummary;
  const overallMastery = masterySummary?.overallMasteryPercent ?? 71;
  const recommended = masterySummary?.recommendedRevisionTopic;
  const strongTopics = masterySummary?.strongTopics ?? [];
  const weakTopics = masterySummary?.weakTopics ?? [];
  const recentEvents = progress?.recentEvents ?? [];

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Personalized Learning Dashboard • Real-time Progress Tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tutor"
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl text-indigo-700 font-semibold text-xs transition-colors"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Ask Tutor</span>
            </Link>
            <Link
              href="/coding"
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-700 font-semibold text-xs transition-colors"
            >
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Code Lab</span>
            </Link>
          </div>
        </div>

        {/* Current Active Goal Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Active Learning Goal
              </span>
              <span className="text-xs text-indigo-300 font-medium">Recommended Milestone</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">Master SQL JOINs & Advanced Relational Queries</h2>
            <p className="text-xs text-indigo-200">
              Target: <span className="font-semibold text-white">≥ 85% Mastery</span> • Current Progress: <span className="font-semibold text-amber-300">65% (Intermediate)</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tutor?topic=SQL%20JOIN"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" /> Tutor Help
            </Link>
            <Link
              href="/learning"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              Resume Journey <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Overall Topic Mastery"
            value={progressLoading ? '...' : `${overallMastery}%`}
            icon={Brain}
            color="indigo"
            description="Based on quiz & practice results"
          />
          <StatsCard
            title="Completed Lessons"
            value={progressLoading ? '...' : (progress?.completedLessons ?? 0)}
            icon={CheckCircle}
            color="green"
            description="Lessons finished"
          />
          <StatsCard
            title="XP Points"
            value={progressLoading ? '...' : `${progress?.xpPoints ?? 250} XP`}
            icon={Award}
            color="purple"
            description="Earned from quizzes & activity"
          />
          <StatsCard
            title="Streak Days"
            value={progressLoading ? '...' : `${progress?.streakDays ?? 5} Days`}
            icon={Flame}
            color="amber"
            description="Active learning streak"
          />
        </div>

        {/* Recommended Revision & Mastery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Revision Banner */}
          <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>Recommended Topic Revision</span>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-2.5 py-1 rounded-full">
                Suggested Focus
              </span>
            </div>

            {recommended ? (
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-xl text-gray-900">{recommended.topic}</h3>
                  <span className="text-sm font-bold text-amber-700">
                    Mastery: {recommended.currentMasteryPercent}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{recommended.reason}</p>

                {recommended.prerequisite && (
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs space-y-1">
                    <div className="font-semibold text-gray-800">
                      Prerequisite: {recommended.prerequisite.prerequisiteTopic}
                    </div>
                    <div className="text-gray-600">
                      Prerequisite Score: Math.round({recommended.prerequisite.prerequisiteScore * 100})% • Status:{' '}
                      <span
                        className={
                          recommended.prerequisite.isPrerequisiteSatisfied
                            ? 'text-green-700 font-semibold'
                            : 'text-amber-700 font-semibold'
                        }
                      >
                        {recommended.prerequisite.isPrerequisiteSatisfied
                          ? 'Satisfied (Ready to Revise)'
                          : 'Needs Review First'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href={`/learning?lessonId=lesson-py-01-02`}
                    className="inline-flex items-center gap-2 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition-colors"
                  >
                    Revise Topic Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Great job! You have no critical weak topics requiring immediate revision.
              </p>
            )}
          </div>

          {/* Mastery Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base">Topic Insights</h3>
                <Link href="/profile" className="text-xs text-indigo-600 font-semibold hover:underline">
                  Full Breakdown
                </Link>
              </div>

              {/* Strong Topics */}
              <div className="space-y-2 mt-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" /> Strong Topics (≥ 75%)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strongTopics.length > 0 ? (
                    strongTopics.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200"
                      >
                        {t.topic} ({t.percent}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">None yet</span>
                  )}
                </div>
              </div>

              {/* Weak Topics */}
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Weak Topics (&lt; 60%)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.length > 0 ? (
                    weakTopics.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200"
                      >
                        {t.topic} ({t.percent}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-green-600 font-medium">All topics &ge; 60%!</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Calculated from recent assessments & practice</span>
                <span className="font-semibold text-gray-700">Live Metric</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses & Learning Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
              <Link
                href="/courses"
                className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                Browse All Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {coursesLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-semibold text-gray-800">No courses enrolled yet</h3>
                <p className="text-sm text-gray-500">Browse available courses to start learning.</p>
                <Link
                  href="/courses"
                  className="inline-block py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold text-sm"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* Learning Events Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900 text-base">Recent Learning Events</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No learning events recorded yet.</p>
              ) : (
                recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center font-semibold text-gray-800">
                      <span className="text-indigo-600 font-bold">{evt.eventType}</span>
                      <span className="text-gray-400 font-normal">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {evt.topic && <p className="text-gray-600">Topic: {evt.topic}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
