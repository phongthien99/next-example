"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface QuizNavigationProps {
  currentQuestionId: number;
  totalQuestions: number;
  isChecked: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCheck: () => void;
}

export function QuizNavigation({
  currentQuestionId,
  totalQuestions,
  isChecked,
  onPrevious,
  onNext,
  onCheck,
}: QuizNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={onPrevious}
        disabled={currentQuestionId === 1}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        ← Previous Question
      </button>

      <div className="text-sm text-gray-600">
        Question {currentQuestionId} of {totalQuestions}
      </div>

      {!isChecked ? (
        <button
          onClick={onCheck}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Check Answer
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={currentQuestionId === totalQuestions}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}
