'use client';

import React from 'react';
import { Question } from '@/types';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
}

export function QuizQuestion({ question, selectedAnswer, onAnswer, showResult }: QuizQuestionProps) {
  const options: string[] = Array.isArray(question.options) ? question.options : [];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg text-gray-900 leading-snug">
          {question.orderIndex}. {question.questionText}
        </h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded font-medium">
          {question.points} {question.points === 1 ? 'pt' : 'pts'}
        </span>
      </div>

      {question.questionType === 'MCQ' && (
        <div className="space-y-2 pt-2">
          {options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = showResult && option === question.correctAnswer;
            const isWrong = showResult && isSelected && option !== question.correctAnswer;

            let style = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50';
            if (isSelected) style = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium';
            if (isCorrect) style = 'border-green-600 bg-green-50 text-green-900 font-medium';
            if (isWrong) style = 'border-red-600 bg-red-50 text-red-900 font-medium';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !showResult && onAnswer(option)}
                disabled={showResult}
                className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center gap-3 ${style}`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold ${
                  isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.questionType === 'TRUE_FALSE' && (
        <div className="flex gap-4 pt-2">
          {['True', 'False'].map((option) => {
            const isSelected = selectedAnswer === option;
            let style = 'border-gray-200 hover:border-indigo-300';
            if (isSelected) style = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold';

            return (
              <button
                key={option}
                type="button"
                onClick={() => !showResult && onAnswer(option)}
                disabled={showResult}
                className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-all ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {question.questionType === 'SHORT_ANSWER' && (
        <div className="pt-2">
          <input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            disabled={showResult}
            placeholder="Type your answer here..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
