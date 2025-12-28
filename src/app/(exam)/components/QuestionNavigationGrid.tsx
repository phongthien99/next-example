'use client';

import React from 'react';
import { Check, Flag } from 'lucide-react';

interface QuestionNavigationGridProps {
  totalQuestions: number;
  currentQuestionId: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  answeredCount: number;
  onNavigateToQuestion: (questionId: number) => void;
}

export function QuestionNavigationGrid({
  totalQuestions,
  currentQuestionId,
  answeredQuestions,
  flaggedQuestions,
  answeredCount,
  onNavigateToQuestion,
}: QuestionNavigationGridProps) {
  const QuestionButton = ({ number }: { number: number }) => {
    const isActive = number === currentQuestionId;
    const isAnswered = answeredQuestions.has(number);
    const isFlagged = flaggedQuestions.has(number);

    return (
      <button
        onClick={() => onNavigateToQuestion(number)}
        className={`
          w-10 h-10 rounded-lg text-sm font-medium transition-all relative
          ${
            isActive
              ? 'bg-blue-500 text-white shadow-lg transform scale-110'
              : isAnswered
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
          }
          ${isFlagged && !isActive ? 'ring-2 ring-orange-400' : ''}
        `}
      >
        {number}
        {isFlagged && !isActive && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Question Navigation</h3>
          <span className="text-sm text-gray-500">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <QuestionButton key={i + 1} number={i + 1} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm pt-3 border-t">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-orange-500" />
          <span className="text-gray-600">For Review</span>
        </div>
      </div>
    </div>
  );
}
