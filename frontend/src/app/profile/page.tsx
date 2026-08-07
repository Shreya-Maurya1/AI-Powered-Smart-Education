'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { User, Award, Flame, BookOpen, Save } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState('10');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
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
