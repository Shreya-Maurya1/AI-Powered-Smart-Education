'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { assessmentsApi } from '@/lib/api';
import { Assessment, Attempt } from '@/types';
import { QuizQuestion } from '@/components/shared/QuizQuestion';
import { Spinner } from '@/components/ui/Spinner';
import { Clock, CheckCircle, XCircle, ArrowLeft, Award } from 'lucide-react';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get('assessmentId') || 'assessment-py-quiz-01';

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ attempt: Attempt; score: number; passed: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins default

  useEffect(() => {
    async function load() {
      try {
        const data = await assessmentsApi.getById(assessmentId);
        setAssessment(data);
        if (data.timeLimitMinutes) setTimeLeft(data.timeLimitMinutes * 60);
      } catch {
        // demo fallback
        setAssessment({
          id: assessmentId,
          courseId: 'course-python-001',
          title: 'Python Knowledge Assessment',
          type: 'QUIZ',
          totalMarks: 10,
          passingMarks: 6,
          timeLimitMinutes: 15,
          questions: [
            {
              id: 'q1',
              assessmentId,
              questionText: 'Which keyword is used to define a variable in Python?',
              questionType: 'MCQ',
              options: ['var', 'let', 'No keyword needed', 'define'],
              correctAnswer: 'No keyword needed',
              points: 2,
              orderIndex: 1,
            },
            {
              id: 'q2',
              assessmentId,
              questionText: 'What is the output of print(type(3.14))?',
              questionType: 'MCQ',
              options: ['<class int>', '<class float>', '<class str>', '<class double>'],
              correctAnswer: '<class float>',
              points: 2,
              orderIndex: 2,
            },
            {
              id: 'q3',
              assessmentId,
              questionText: 'Python uses indentation to define code blocks.',
              questionType: 'TRUE_FALSE',
              options: ['True', 'False'],
              correctAnswer: 'True',
              points: 2,
              orderIndex: 3,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessmentId]);

  useEffect(() => {
    if (result || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result, loading]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await assessmentsApi.submit({
        assessmentId,
        answers,
        timeTakenSeconds: (assessment?.timeLimitMinutes || 15) * 60 - timeLeft,
      });
      setResult(res);
    } catch {
      // client grade fallback if backend offline
      let total = 0;
      let score = 0;
      assessment?.questions?.forEach((q) => {
        total += q.points;
        if (answers[q.id] === q.correctAnswer) score += q.points;
      });
      const passed = score >= (assessment?.passingMarks || 6);
      setResult({
        attempt: {
          id: 'attempt-demo',
          studentId: 'student-profile-001',
          assessmentId,
          score,
          totalPossible: total,
          passed,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        score,
        passed,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size="lg" /></div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-20 z-40">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{assessment?.title}</h1>
          <p className="text-xs text-gray-500">{assessment?.questions?.length || 0} Questions • Passing: {assessment?.passingMarks}/{assessment?.totalMarks} pts</p>
        </div>
        {!result && (
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
        )}
      </div>

      {result ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {result.passed ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{result.passed ? 'Congratulations! You Passed!' : 'Needs Improvement'}</h2>
          <p className="text-gray-600">Your Score: <span className="font-bold text-indigo-600">{result.score}</span> / {assessment?.totalMarks} points</p>

          <div className="pt-4 flex justify-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {assessment?.questions?.map((q) => (
            <QuizQuestion
              key={q.id}
              question={q}
              selectedAnswer={answers[q.id]}
              onAnswer={(ans) => handleAnswer(q.id, ans)}
            />
          ))}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md flex items-center gap-2"
            >
              {submitting ? <Spinner size="sm" className="border-white" /> : 'Submit Assessment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <ProtectedRoute allowedRole="STUDENT">
      <Suspense fallback={<div className="py-20 flex justify-center"><Spinner size="lg" /></div>}>
        <AssessmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
