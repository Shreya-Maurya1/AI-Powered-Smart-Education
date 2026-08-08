'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { progressApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

function LearningContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonId = searchParams.get('lessonId');

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      progressApi.logEvent({ lessonId, eventType: 'LESSON_START' }).catch(() => {});
    }
  }, [lessonId]);

  const handleComplete = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      await progressApi.logEvent({ lessonId, eventType: 'LESSON_COMPLETE' });
      setCompleted(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!lessonId) {
    return <div className="text-center py-20 text-gray-500">No lesson selected. Select a lesson from a course.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">Active Lesson</span>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Interactive Lesson Viewer</h1>
          <p className="text-sm text-gray-500 mt-1">Lesson ID: {lessonId}</p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-4">
          <p>Welcome to this learning session. In this lesson, you will master core conceptual foundations and key applications.</p>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-900">
            <strong>Key Concept:</strong> Active engagement and continuous self-assessment lead to higher retention rates.
          </div>
          <p>Read through the material carefully and complete the practice check at the end to record your completion event.</p>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
          {completed ? (
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle className="w-5 h-5 text-green-600" /> Lesson Marked as Complete!
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {loading ? <Spinner size="sm" className="border-white" /> : 'Mark as Complete'}
            </button>
          )}

          <button
            onClick={() => router.push('/assessment?assessmentId=assessment-py-quiz-01')}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            Take Quiz <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LearningPage() {
  return (
    <ProtectedRoute allowedRole="STUDENT">
      <Suspense fallback={<div className="py-20 flex justify-center"><Spinner size="lg" /></div>}>
        <LearningContent />
      </Suspense>
    </ProtectedRoute>
  );
}
