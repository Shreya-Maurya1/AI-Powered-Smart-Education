'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { usersApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { Save, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { progress } = useProgress(user?.id);
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState('10');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await usersApi.updateProfile({ name, grade, learningStyle });
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const masteries = progress?.masterySummary?.allMasteries ?? [
    { id: '1', topic: 'Python Variables', score: 0.95, percent: 95, updatedAt: '' },
    { id: '2', topic: 'Python Functions', score: 0.82, percent: 82, updatedAt: '' },
    { id: '3', topic: 'Control Flow', score: 0.75, percent: 75, updatedAt: '' },
    { id: '4', topic: 'SQL JOIN', score: 0.61, percent: 61, updatedAt: '' },
    { id: '5', topic: 'Calculus Derivatives', score: 0.50, percent: 50, updatedAt: '' },
    { id: '6', topic: 'Python Recursion', score: 0.43, percent: 43, updatedAt: '' },
  ];

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile & Topic Mastery</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account settings and review your topic proficiency.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {getInitials(user?.name || '')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-semibold uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Overall Topic Mastery</p>
            <p className="text-2xl font-bold text-indigo-600">
              {progress?.masterySummary?.overallMasteryPercent ?? 71}%
            </p>
          </div>
        </div>

        {/* Topic Mastery Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-900">Topic Mastery & Performance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {masteries.map((item) => {
              const isHigh = item.percent >= 75;
              const isLow = item.percent < 60;
              const colorClass = isHigh
                ? 'bg-green-600'
                : isLow
                ? 'bg-amber-500'
                : 'bg-indigo-600';

              return (
                <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-900">{item.topic}</span>
                    <span className={isHigh ? 'text-green-700 font-bold' : isLow ? 'text-amber-700 font-bold' : 'text-indigo-700 font-bold'}>
                      {item.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Score: {item.score} / 1.0</span>
                    <span>
                      {isHigh ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Mastered
                        </span>
                      ) : isLow ? (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Revision Needed
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-medium">Developing</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="font-bold text-lg text-gray-900 border-b pb-3">Edit Details</h3>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Learning Style Preference</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="visual">Visual (Diagrams & Videos)</option>
              <option value="auditory">Auditory (Lectures & Audio)</option>
              <option value="reading">Reading & Writing</option>
              <option value="kinesthetic">Kinesthetic (Hands-on Practice)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {saving ? <Spinner size="sm" className="border-white" /> : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
