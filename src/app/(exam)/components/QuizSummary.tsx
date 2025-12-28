'use client';

import React from 'react';
import { X, CheckCircle2, Circle, Flag } from 'lucide-react';
import { QuizProgress } from '../models/Quiz';

interface QuizSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  progress: QuizProgress;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigateToQuestion: (questionId: number) => void;
}

export function QuizSummary({
  isOpen,
  onClose,
  progress,
  answeredQuestions,
  flaggedQuestions,
  onNavigateToQuestion,
}: QuizSummaryProps) {
  if (!isOpen) return null;

  const handleQuestionClick = (questionId: number) => {
    onNavigateToQuestion(questionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Summary</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{progress.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{progress.answeredCount}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">{progress.unansweredCount}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{progress.flaggedCount}</div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Time Elapsed</div>
            <div className="text-2xl font-bold font-mono text-gray-800">{progress.timeElapsed}</div>
          </div>

          {/* Question Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Question Status</h3>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: progress.totalQuestions }, (_, i) => {
                const questionId = i + 1;
                const isAnswered = answeredQuestions.has(questionId);
                const isFlagged = flaggedQuestions.has(questionId);

                return (
                  <button
                    key={questionId}
                    onClick={() => handleQuestionClick(questionId)}
                    className={`
                      relative p-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        isAnswered
                          ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {questionId}
                    {isFlagged && (
                      <Flag className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Continue Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
