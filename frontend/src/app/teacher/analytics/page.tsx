'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { BarChart2, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  return (
    <ProtectedRoute allowedRole="TEACHER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Performance Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Aggregated insights across courses, completion rates, and assessment scores.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
              <span>Overall Completion Rate</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">74.2%</p>
            <p className="text-xs text-green-600 font-semibold">+5.4% from last week</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
              <span>Average Assessment Score</span>
              <BarChart2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">81.5%</p>
            <p className="text-xs text-indigo-600 font-semibold">Across all 5 quizzes</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
              <span>Active Students Today</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">18 / 24</p>
            <p className="text-xs text-purple-600 font-semibold">75% daily engagement</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-gray-900">Course Breakdown</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Introduction to Python Programming</span>
                <span className="text-indigo-600 font-bold">82% Completion</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Mathematics: Algebra & Calculus Fundamentals</span>
                <span className="text-indigo-600 font-bold">65% Completion</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
