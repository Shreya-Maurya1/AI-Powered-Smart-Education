'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Search, UserCheck } from 'lucide-react';

interface MockStudent {
  id: string;
  name: string;
  email: string;
  grade: string;
  learningStyle: string;
  xpPoints: number;
  avgScore: number;
}

const mockStudents: MockStudent[] = [
  { id: '1', name: 'Arjun Mehta', email: 'student@adaptivemind.dev', grade: '10', learningStyle: 'Visual', xpPoints: 250, avgScore: 85 },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', grade: '10', learningStyle: 'Auditory', xpPoints: 410, avgScore: 92 },
  { id: '3', name: 'Rohan Gupta', email: 'rohan@example.com', grade: '11', learningStyle: 'Kinesthetic', xpPoints: 180, avgScore: 68 },
  { id: '4', name: 'Ananya Verma', email: 'ananya@example.com', grade: '10', learningStyle: 'Reading', xpPoints: 320, avgScore: 88 },
];

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="TEACHER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">View registered students, their grade levels, learning styles, and performance.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Learning Style</th>
                  <th className="px-6 py-3">XP Points</th>
                  <th className="px-6 py-3">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      {student.name}
                    </td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4">Grade {student.grade}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-semibold">
                        {student.learningStyle}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-purple-700">{student.xpPoints} XP</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${student.avgScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {student.avgScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
