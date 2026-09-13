'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { aiApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import {
  Code,
  Play,
  Lightbulb,
  Terminal,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CodingChallenge {
  id: string;
  title: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  initialCode: string;
}

const CHALLENGES: CodingChallenge[] = [
  {
    id: 'ch-fact',
    title: '1. Factorial with Base Case',
    topic: 'Python Recursion',
    difficulty: 'EASY',
    description: (
      'Write a recursive function `factorial(n)` that returns the factorial of positive integer n.\n' +
      'Be sure to include a termination condition for n <= 1 to avoid a RecursionError.'
    ),
    initialCode: (
      'def factorial(n):\n' +
      '    # 1. Add your base case here:\n' +
      '    \n' +
      '    # 2. Return recursive step:\n' +
      '    return n * factorial(n - 1)\n' +
      '\n' +
      '# Test your function:\n' +
      'print("factorial(5) =", factorial(5))\n'
    ),
  },
  {
    id: 'ch-fib',
    title: '2. Nth Fibonacci Number',
    topic: 'Python Recursion',
    difficulty: 'MEDIUM',
    description: (
      'Write a recursive function `fibonacci(n)` that returns the nth Fibonacci number.\n' +
      'Recall: fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2).'
    ),
    initialCode: (
      'def fibonacci(n):\n' +
      '    # Base cases for n=0 and n=1:\n' +
      '    if n <= 0:\n' +
      '        return 0\n' +
      '    if n == 1:\n' +
      '        return 1\n' +
      '    \n' +
      '    # Recursive relation:\n' +
      '    return fibonacci(n - 1) + fibonacci(n - 2)\n' +
      '\n' +
      'print("fibonacci(6) =", fibonacci(6))\n'
    ),
  },
  {
    id: 'ch-sum',
    title: '3. Recursive List Sum',
    topic: 'Python Recursion',
    difficulty: 'MEDIUM',
    description: (
      'Compute the sum of a list of integers recursively without using the built-in `sum()` function.'
    ),
    initialCode: (
      'def recursive_sum(numbers):\n' +
      '    # If list is empty, return 0\n' +
      '    if not numbers:\n' +
      '        return 0\n' +
      '    # Return first item + sum of rest:\n' +
      '    return numbers[0] + recursive_sum(numbers[1:])\n' +
      '\n' +
      'print("Sum:", recursive_sum([10, 20, 30, 40]))\n'
    ),
  },
];

export default function CodingPage() {
  const [activeChallenge, setActiveChallenge] = useState<CodingChallenge>(CHALLENGES[0]);
  const [code, setCode] = useState<string>(CHALLENGES[0].initialCode);
  const [running, setRunning] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
    success: boolean;
    durationMs: number;
    isSafe: boolean;
  } | null>(null);

  const [mentorFeedback, setMentorFeedback] = useState<{
    feedback: string;
    hint: string;
  } | null>(null);

  const handleSelectChallenge = (ch: CodingChallenge) => {
    setActiveChallenge(ch);
    setCode(ch.initialCode);
    setOutput(null);
    setMentorFeedback(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setMentorFeedback(null);
    try {
      const res = await aiApi.coding({
        studentId: 'me',
        problemDescription: activeChallenge.description,
        topic: activeChallenge.topic,
        studentCode: code,
      });

      const act = res.action_result || {};
      setOutput({
        stdout: act.stdout || '',
        stderr: act.stderr || '',
        success: act.executionSuccess ?? false,
        durationMs: act.durationMs ?? 0,
        isSafe: act.isSafe ?? true,
      });

      if (act.feedback) {
        setMentorFeedback({
          feedback: act.feedback,
          hint: act.hint || '',
        });
      }
    } catch (err: any) {
      setOutput({
        stdout: '',
        stderr: err?.response?.data?.message || err?.message || 'Execution failed.',
        success: false,
        durationMs: 0,
        isSafe: true,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Phase 5 Safe Python Sandbox & Coding Mentor
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Python Coding Studio</h1>
            <p className="text-sm text-gray-500 mt-1">
              Test algorithms in a sandboxed runtime with instant line-by-line AI mentor feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCode(activeChallenge.initialCode);
                setOutput(null);
                setMentorFeedback(null);
              }}
              className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Code
            </button>
          </div>
        </div>

        {/* Challenge Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CHALLENGES.map((ch) => (
            <button
              key={ch.id}
              onClick={() => handleSelectChallenge(ch)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeChallenge.id === ch.id
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {ch.topic}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white text-gray-600 border border-gray-200">
                  {ch.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{ch.title}</h3>
            </button>
          ))}
        </div>

        {/* Problem Description Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-700 shadow-sm flex items-start gap-3">
          <Code className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-gray-900 block">Problem Objective:</span>
            <p className="text-gray-600 leading-relaxed">{activeChallenge.description}</p>
          </div>
        </div>

        {/* Editor & Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Container */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>solution.py</span>
                <span className="text-gray-500 text-[11px]">(Python 3.14 Sandbox)</span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">UTF-8</span>
            </div>

            <div className="relative flex-1 min-h-[350px] p-2 bg-gray-950 font-mono text-sm">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const newCode = code.substring(0, start) + '    ' + code.substring(end);
                    setCode(newCode);
                    setTimeout(() => {
                      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
                spellCheck={false}
                className="w-full h-full min-h-[340px] bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-xs leading-relaxed p-2"
                placeholder="# Write your Python code here..."
              />
            </div>

            {/* Run Button Bar */}
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
              <div className="text-[11px] text-gray-400 font-mono">
                Tab inserts 4 spaces • Sandboxed subprocess
              </div>
              <button
                onClick={handleRunCode}
                disabled={running}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                {running ? <Spinner size="sm" className="border-white" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run in Sandbox
              </button>
            </div>
          </div>

          {/* Execution Output & Mentor Guidance Panel */}
          <div className="space-y-4">
            {/* Terminal Console */}
            <div className="bg-gray-900 text-gray-200 rounded-xl border border-gray-800 shadow-sm overflow-hidden min-h-[220px] flex flex-col">
              <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Terminal Output
                </span>
                {output && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {output.durationMs}ms
                    </span>
                    {output.success ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                        EXIT 0
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-bold border border-red-800">
                        ERROR
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 font-mono text-xs overflow-y-auto flex-1 whitespace-pre-wrap leading-relaxed">
                {output ? (
                  <>
                    {output.stdout && (
                      <div className="text-gray-100 mb-2">{output.stdout}</div>
                    )}
                    {output.stderr && (
                      <div className="text-rose-400 bg-red-950/40 p-2.5 rounded border border-red-900/50">
                        {output.stderr}
                      </div>
                    )}
                    {!output.stdout && !output.stderr && (
                      <div className="text-gray-500 italic">Program finished with no output.</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 italic">
                    Click "Run in Sandbox" to execute Python code safely and view console output here.
                  </div>
                )}
              </div>
            </div>

            {/* AI Mentor Feedback Card */}
            {mentorFeedback && (
              <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Coding Mentor Insights
                </div>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {mentorFeedback.feedback}
                </div>
                {mentorFeedback.hint && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{mentorFeedback.hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
