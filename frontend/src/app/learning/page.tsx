'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { aiApi, AdaptiveLearningResponse } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  Target,
  Code,
  FileText,
  HelpCircle,
  Award
} from 'lucide-react';

const SAMPLE_TOPICS = [
  { id: 'Python Recursion', label: 'Python Recursion (Low Mastery ~43%, Mistakes)' },
  { id: 'Python Functions', label: 'Python Functions (Medium Mastery ~82%)' },
  { id: 'Python Variables', label: 'Python Variables (High Mastery ~95% -> ADVANCE)' },
  { id: 'SQL JOIN', label: 'SQL JOIN (Foundational Mastery ~60%)' },
];

function LearningContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTopic = searchParams.get('topic') || 'Python Recursion';

  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agentData, setAgentData] = useState<AdaptiveLearningResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; message?: string; delta?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Fetch initial adaptive decision for topic
  const loadAdaptiveStep = async (topicName: string) => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setSelectedAnswer('');
    try {
      const data = await aiApi.learning({
        studentId: 'me',
        topic: topicName,
      });
      setAgentData(data);
    } catch (err: any) {
      console.error('Error fetching adaptive decision:', err);
      setError(err?.response?.data?.message || 'Failed to connect to Learning Adaptation Agent.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdaptiveStep(selectedTopic);
  }, [selectedTopic]);

  // Submit student response to agent evaluation loop
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await aiApi.learning({
        studentId: 'me',
        topic: selectedTopic,
        studentResponse: selectedAnswer,
      });
      setAgentData(data);
      if (data.evaluation) {
        setFeedback({
          isCorrect: data.evaluation.is_correct,
          message: data.evaluation.feedback || (data.evaluation.is_correct ? 'Correct!' : 'Incorrect.'),
          delta: data.evaluation.knowledge_change,
        });
      }
    } catch (err: any) {
      console.error('Error submitting answer to agent:', err);
      setError('Failed to evaluate answer with AI agent.');
    } finally {
      setSubmitting(false);
    }
  };

  // Continue to next cycle in adaptive re-planning loop
  const handleNextAdaptiveStep = () => {
    loadAdaptiveStep(selectedTopic);
  };

  const decision = agentData?.decision;
  const analysis = agentData?.analysis;
  const actionResult = agentData?.action_result;
  const mastery = agentData?.metadata?.currentMastery ?? 0.50;
  const masteryPercent = Math.round(mastery * 100);

  const getActionBadgeColor = (action?: string) => {
    switch (action) {
      case 'ADVANCE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PRACTICE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'REVISE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ASSESS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CODE':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Adaptive Learning Session
          </h1>
          <p className="text-sm text-gray-500">
            Powered by the multi-node LangGraph Learning Adaptation Agent (Phase 4 Centerpiece)
          </p>
        </div>

        {/* Topic Switcher for Instant Live Testing */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Topic:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SAMPLE_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => loadAdaptiveStep(selectedTopic)}
            title="Reload agent state"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Invoking LangGraph Learning Adaptation Graph...
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Running parallel context fan-out: mastery, history, and memory nodes.
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Connection Warning</h3>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => loadAdaptiveStep(selectedTopic)}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : agentData ? (
        <>
          {/* Agent Decision & Diagnostics Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Active Agent Decision
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${getActionBadgeColor(
                      decision?.action
                    )}`}
                  >
                    Action: {decision?.action}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 font-semibold border border-white/20">
                    Difficulty: {decision?.difficulty}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 font-semibold border border-white/20">
                    Confidence: {Math.round((decision?.confidence ?? 0.85) * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold">{decision?.topic || selectedTopic}</h2>
                <p className="text-sm text-indigo-100 mt-1">{decision?.reason}</p>
              </div>

              {/* Real-time Mastery Meter */}
              <div className="mt-6 pt-4 border-t border-indigo-700/60">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span>Topic Mastery Progression</span>
                  <span className="flex items-center gap-1.5">
                    {feedback?.delta ? (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                          feedback.delta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {feedback.delta > 0 ? `+${feedback.delta}` : feedback.delta}
                      </span>
                    ) : null}
                    <span className="text-base font-bold text-white">{masteryPercent}%</span>
                  </span>
                </div>
                <div className="w-full bg-indigo-950/80 rounded-full h-3 overflow-hidden p-0.5 border border-indigo-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      mastery >= 0.85
                        ? 'bg-emerald-400'
                        : mastery >= 0.70
                        ? 'bg-indigo-400'
                        : mastery >= 0.50
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, masteryPercent))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sub-bar metrics */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-4">
              <div className="flex items-center gap-4">
                <span>
                  <strong>Knowledge Gap:</strong>{' '}
                  {analysis?.knowledge_gap !== undefined ? `${Math.round(analysis.knowledge_gap * 100)}%` : 'N/A'}
                </span>
                <span>
                  <strong>Recent Mistake Telemetry:</strong>{' '}
                  <span className={analysis?.recent_mistakes ? 'text-rose-600 font-bold' : ''}>
                    {analysis?.recent_mistakes ?? 0} errors
                  </span>
                </span>
                <span>
                  <strong>Prerequisite Status:</strong>{' '}
                  {analysis?.prerequisite_satisfied ? (
                    <span className="text-emerald-600 font-semibold">Satisfied</span>
                  ) : (
                    <span className="text-rose-600 font-semibold">Remediation Needed</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                {showLogs ? 'Hide Graph Logs' : 'View Graph Logs'}
              </button>
            </div>

            {showLogs && (
              <div className="bg-gray-900 text-gray-200 p-4 text-xs font-mono border-b border-gray-200 max-h-48 overflow-y-auto space-y-1">
                <div className="text-gray-400 mb-2 font-bold">// LangGraph State Trace & Parallel Fan-In:</div>
                {agentData.metadata?.sessionLogs?.map((log: string, i: number) => (
                  <div key={i} className="text-emerald-400">
                    {log}
                  </div>
                ))}
                <div className="text-gray-400 mt-2 font-bold">// Tool Invocations:</div>
                {agentData.tool_calls_made?.map((t: any, idx: number) => (
                  <div key={idx} className="text-sky-300">
                    &gt; {JSON.stringify(t)}
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Action Workspace */}
            <div className="p-6 md:p-8 space-y-6">
              {/* ACTION: PRACTICE */}
              {decision?.action === 'PRACTICE' && actionResult && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Target className="w-5 h-5 text-amber-600" />
                    Targeted Adaptive Practice: Focus on resolving repeated conceptual errors.
                  </div>

                  <div className="space-y-3">
                    <p className="text-base font-semibold text-gray-900">{actionResult.questionText}</p>

                    <div className="space-y-2 mt-4">
                      {actionResult.options?.map((optionText: string, idx: number) => {
                        const optionKey = optionText.charAt(0);
                        const isSelected = selectedAnswer === optionKey;
                        return (
                          <label
                            key={idx}
                            onClick={() => !feedback && setSelectedAnswer(optionKey)}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-950'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                            } ${feedback ? 'cursor-default' : ''}`}
                          >
                            <input
                              type="radio"
                              name="practiceOption"
                              checked={isSelected}
                              onChange={() => {}}
                              disabled={!!feedback}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{optionText}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Banner upon Evaluation */}
                  {feedback && (
                    <div
                      className={`p-4 rounded-xl border text-sm space-y-2 ${
                        feedback.isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {feedback.isCorrect ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-600" /> Correct! Topic Mastery Updated.
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-rose-600" /> Incorrect. Analyzing error pattern...
                          </>
                        )}
                      </div>
                      <p>{feedback.message}</p>
                      {actionResult.explanation && (
                        <p className="text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                          <strong>Explanation:</strong> {actionResult.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit / Re-plan Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {!feedback ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer || submitting}
                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        {submitting ? <Spinner size="sm" className="border-white" /> : 'Submit to AI Agent'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleNextAdaptiveStep}
                        className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
                      >
                        Continue Adaptive Loop (Re-Plan) <TrendingUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION: REVISE */}
              {decision?.action === 'REVISE' && actionResult && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Concept Remediation & Revision Guide
                  </div>

                  <div className="prose max-w-none text-gray-800 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">{actionResult.title}</h3>
                    <p className="text-sm text-gray-600">{actionResult.summary}</p>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Key Conceptual Anchors
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                        {actionResult.keyPoints?.map((pt: string, i: number) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    {actionResult.exampleCode && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Canonical Python Implementation
                        </h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                          {actionResult.exampleCode}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={handleNextAdaptiveStep}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      I have reviewed this — Proceed to Practice <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION: ADVANCE */}
              {decision?.action === 'ADVANCE' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
                  <Award className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-xl font-bold text-emerald-900">Mastery Milestone Achieved!</h3>
                  <p className="text-sm text-emerald-800 max-w-md mx-auto">
                    Your demonstrated mastery of <strong>{selectedTopic}</strong> is at{' '}
                    <strong>{masteryPercent}%</strong> (above the 85% benchmark). The Learning Adaptation Agent has
                    unlocked the next progression:
                  </p>
                  <div className="inline-block bg-white px-5 py-2.5 rounded-lg border border-emerald-300 font-bold text-emerald-800 text-sm shadow-sm">
                    Next Unlocked: {actionResult?.nextTopic || 'Advanced Concepts'}
                  </div>
                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={() => {
                        const next = actionResult?.nextTopic;
                        if (next) setSelectedTopic(next);
                      }}
                      className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
                    >
                      Begin Next Curriculum Module <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION: CODE */}
              {decision?.action === 'CODE' && actionResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sky-700 font-bold text-sm bg-sky-50 p-3 rounded-lg border border-sky-200">
                    <Code className="w-5 h-5 text-sky-600" />
                    Interactive Coding Challenge
                  </div>
                  <h3 className="font-bold text-gray-900">{actionResult.prompt}</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    {actionResult.starterCode}
                  </pre>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextAdaptiveStep}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
                    >
                      Submit Coding Attempt <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION: EXPLAIN or ASSESS fallback */}
              {['ASSESS', 'EXPLAIN'].includes(decision?.action || '') && (
                <div className="space-y-4">
                  <p className="text-gray-800 text-sm font-medium">{agentData.output}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextAdaptiveStep}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
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
