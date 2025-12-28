"use client";

import React from "react";
import { Question } from "../models/Question";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelectAnswer: (optionId: string) => void;
}

export function QuestionDisplay({
  question,
  selectedAnswer,
  isChecked,
  onSelectAnswer,
}: QuestionDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span className="font-bold text-lg">{question.id}.</span>
          <span className="font-semibold uppercase">Question</span>
        </div>
        <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm mb-4">
          <span className="font-semibold">Category:</span> {question.category}
        </div>
        <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
          {question.content}
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isCorrect = option.id === question.correctAnswer;
          const isSelected = selectedAnswer === option.id;
          const showResult = isChecked;

          let borderColor = "border-gray-200";
          let bgColor = "bg-white";
          let hoverClass = "hover:border-gray-300 hover:bg-gray-50";

          if (showResult) {
            if (isCorrect) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50";
              hoverClass = "";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-red-500";
              bgColor = "bg-red-50";
              hoverClass = "";
            }
          } else if (isSelected) {
            borderColor = "border-blue-500";
            bgColor = "bg-blue-50";
            hoverClass = "";
          }

          return (
            <label
              key={option.id}
              className={`block p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${!showResult ? "cursor-pointer" : "cursor-default"} ${hoverClass}`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => !showResult && onSelectAnswer(option.id)}
                    disabled={showResult}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:cursor-default"
                  />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-700 mr-2">
                    {option.id}.
                  </span>
                  <span className="text-gray-700">{option.text}</span>
                </div>
                {showResult && (
                  <div className="pt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : isSelected ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Explanation - Show only when checked */}
      {isChecked && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Explanation
          </h4>
          <p className="text-blue-800 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
