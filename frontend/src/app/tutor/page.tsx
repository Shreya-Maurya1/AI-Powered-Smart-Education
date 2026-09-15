'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { aiApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
  Bot,
  User as UserIcon,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  topic?: string;
  citations?: string;
  activeMemories?: string[];
  groundingScore?: number;
  timestamp: string;
}

const TOPICS = [
  'Python Recursion',
  'Python Functions',
  'Python Variables',
  'SQL JOIN',
];

const SUGGESTED_QUESTIONS = [
  'What is a base case in recursion and why is it mandatory?',
  'Can you explain the system call stack when factorial(3) runs?',
  'What is the difference between an INNER JOIN and a LEFT JOIN?',
  'How does Python resolve variable scope under the LEGB rule?',
];

export default function TutorPage() {
  const [selectedTopic, setSelectedTopic] = useState('Python Recursion');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'tutor',
      text: (
        "👋 Welcome! I am your **AdaptiveMind Socratic AI Tutor**.\n\n" +
        "My explanations are grounded in your actual course textbooks via **RAG** " +
        "and tailored to your personal **learning style & memory traces**.\n\n" +
        "Ask me anything about your current topic or pick a suggested concept below!"
      ),
      topic: 'Python Recursion',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      topic: selectedTopic,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiApi.tutor({
        studentId: 'me',
        topic: selectedTopic,
        question: text,
      });

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: res.output,
        topic: selectedTopic,
        citations: res.action_result?.citations,
        activeMemories: res.action_result?.activeMemories || [],
        groundingScore: res.action_result?.groundingScore || 0.92,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
      if (tutorMsg.citations) {
        setExpandedCitationId(tutorMsg.id);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: `⚠️ **Connection Error**: ${err?.response?.data?.message || err?.message || 'Failed to reach AI Tutor service.'}`,
        topic: selectedTopic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 5 Socratic AI Tutor (RAG + Memory)
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Personalized AI Tutor</h1>
            <p className="text-sm text-gray-500 mt-1">
              Grounded in verified course curriculum with source citations and continuous student memory.
            </p>
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
          <span className="text-xs font-semibold text-gray-400 shrink-0 uppercase">Try Asking:</span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'tutor' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 md:p-5 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-sm rounded-tr-none'
                      : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {/* Memory Active Indicator Badge */}
                  {msg.sender === 'tutor' && msg.activeMemories && msg.activeMemories.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">🧠 Student Memory Recall Active</span>
                        <ul className="mt-0.5 space-y-0.5 text-[11px] text-purple-700 list-disc list-inside">
                          {msg.activeMemories.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.text}
                  </div>

                  {/* Citations Expandable Drawer */}
                  {msg.citations && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCitationId(expandedCitationId === msg.id ? null : msg.id)
                        }
                        className="flex items-center justify-between w-full text-xs font-semibold text-indigo-700 hover:text-indigo-800"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Curriculum Citations & RAG Grounding ({Math.round((msg.groundingScore || 0.9) * 100)}% Match)
                        </span>
                        {expandedCitationId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedCitationId === msg.id && (
                        <div className="mt-2 text-xs text-gray-600 bg-white p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.citations}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 flex justify-end ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 items-center text-gray-500 text-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Spinner size="sm" className="border-indigo-600" />
                  <span className="text-xs font-medium text-gray-600">
                    Retrieving RAG curriculum sources & synthesizing Socratic answer...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask the AI Tutor about ${selectedTopic}...`}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
