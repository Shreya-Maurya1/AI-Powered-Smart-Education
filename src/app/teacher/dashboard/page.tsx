'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/shared/StatsCard';
import { Users, BookOpen, BarChart2, Award, PlusCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRole="TEACHER">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard 👨‍🏫</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}. Monitor student performance and manage curriculum.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard title="Total Students" value={24} icon={Users} color="indigo" />
          <StatsCard title="Active Courses" value={2} icon={BookOpen} color="green" />
          <StatsCard title="Avg Class Score" value="78%" icon={BarChart2} color="purple" />
          <StatsCard title="Assessments Graded" value={142} icon={Award} color="amber" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/teacher/students" className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-medium transition-colors">
                <span>View Student Roster & Progress</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </Link>
              <Link href="/teacher/analytics" className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-medium transition-colors">
                <span>View Class Performance Analytics</span>
                <BarChart2 className="w-4 h-4 text-indigo-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-900">Recent Class Activity</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span>Arjun Mehta completed "Python Basics Quiz"</span>
                <span className="text-xs text-gray-400">10m ago</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span>New student registered in Grade 10</span>
                <span className="text-xs text-gray-400">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
