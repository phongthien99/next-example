"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { yamlExamLoader } from "@/lib/exam/repositories/YamlExamLoaderRepository";
import type { ExamMeta, Question } from "@/lib/exam/types/ExamSchema";
import { Clock, ChevronLeft, ChevronRight, Flag, Check } from "lucide-react";

interface QuizSession {
  currentQuestionIndex: number;
  answers: Record<number, string>; // questionNumber -> optionId
  flaggedQuestions: Set<number>;
  checkedQuestions: Set<number>;
  wrongAnswers: Set<number>; // Track questions with wrong answers
  timeElapsed: number;
  isPaused: boolean;
}

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [examMeta, setExamMeta] = useState<ExamMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<QuizSession>({
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    checkedQuestions: new Set(),
    wrongAnswers: new Set(),
    timeElapsed: 0,
    isPaused: false,
  });

  // Load exam data
  useEffect(() => {
    async function loadExam() {
      try {
        setIsLoading(true);
        const examData = await yamlExamLoader.loadCompleteExam(examId);
        setExamMeta(examData.meta);
        setQuestions(examData.questions);
      } catch (err) {
        console.error("Failed to load exam:", err);
        setError("Failed to load exam. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (examId) {
      loadExam();
    }
  }, [examId]);

  // Timer
  useEffect(() => {
    if (!session.isPaused && questions.length > 0) {
      const timer = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session.isPaused, questions.length]);

  const currentQuestion = questions[session.currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? session.answers[currentQuestion.questionNumber]
    : null;

  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuestion) return;

    setSession(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.questionNumber]: optionId,
      },
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;

    setSession(prev => {
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(currentQuestion.questionNumber)) {
        newFlagged.delete(currentQuestion.questionNumber);
      } else {
        newFlagged.add(currentQuestion.questionNumber);
      }

      return {
        ...prev,
        flaggedQuestions: newFlagged,
      };
    });
  };

  const handleCheck = () => {
    if (!currentQuestion || !selectedAnswer) return;

    // Check if answer is wrong
    const isWrong = selectedAnswer !== currentQuestion.correctAnswer;

    setSession(prev => {
      const newChecked = new Set(prev.checkedQuestions);
      const newWrong = new Set(prev.wrongAnswers);

      newChecked.add(currentQuestion.questionNumber);

      if (isWrong) {
        newWrong.add(currentQuestion.questionNumber);
      }

      return {
        ...prev,
        checkedQuestions: newChecked,
        wrongAnswers: newWrong,
      };
    });
  };

  const handlePrevious = () => {
    if (session.currentQuestionIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleNext = () => {
    if (session.currentQuestionIndex < questions.length - 1) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handleNavigateToQuestion = (index: number) => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: index,
    }));
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(session.answers).length;
  const isChecked = currentQuestion
    ? session.checkedQuestions.has(currentQuestion.questionNumber)
    : false;
  const isFlagged = currentQuestion
    ? session.flaggedQuestions.has(currentQuestion.questionNumber)
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !examMeta || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error</p>
          <p className="text-gray-600 mt-2">{error || "Exam not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {examMeta.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">
                {formatTime(session.timeElapsed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {answeredCount} / {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((answeredCount / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Question Navigation
          </h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => {
              const isAnswered = session.answers[q.questionNumber] !== undefined;
              const isCurrent = index === session.currentQuestionIndex;
              const isQuestionFlagged = session.flaggedQuestions.has(q.questionNumber);
              const isWrongAnswer = session.wrongAnswers.has(q.questionNumber);
              const isCheckedQuestion = session.checkedQuestions.has(q.questionNumber);

              return (
                <button
                  key={q.id}
                  onClick={() => handleNavigateToQuestion(index)}
                  className={`
                    relative h-10 rounded font-medium text-sm transition-all
                    ${isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2"
                      : isWrongAnswer
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : isCheckedQuestion && isAnswered
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : isAnswered
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {q.questionNumber}
                  {isQuestionFlagged && (
                    <Flag className="h-3 w-3 absolute top-1 right-1 fill-current" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Flag only (Check button moved to answer option on mobile) */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleToggleFlag}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isFlagged
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-white text-gray-700 border hover:bg-gray-50"
              }
            `}
          >
            <Flag className={`h-4 w-4 ${isFlagged ? "fill-current" : ""}`} />
            {isFlagged ? "Flagged" : "Flag"}
          </button>

          {/* Check button on desktop only */}
          {!isChecked && selectedAnswer && (
            <button
              onClick={handleCheck}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Check Answer
            </button>
          )}
        </div>

        {/* Question Display */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestion.questionNumber} of {questions.length}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                {currentQuestion.category}
              </span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 whitespace-pre-wrap">
              {currentQuestion.content}
            </h2>
          </div>

          {/* Passage (if exists) */}
          {currentQuestion.passage && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">
                {currentQuestion.passage.title}
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm">
                {currentQuestion.passage.content}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = isChecked && option.id === currentQuestion.correctAnswer;
              const isWrong = isChecked && isSelected && option.id !== currentQuestion.correctAnswer;

              return (
                <div key={option.id} className="relative">
                  <div
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${isCorrect
                        ? "border-green-500 bg-green-50"
                        : isWrong
                        ? "border-red-500 bg-red-50"
                        : isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={isChecked}
                        className={`flex items-start gap-3 flex-1 ${isChecked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium
                          ${isCorrect
                            ? "bg-green-500 text-white"
                            : isWrong
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                          }
                        `}>
                          {option.id}
                        </span>
                        <span className="flex-1 text-gray-900 pt-1">
                          {option.text}
                        </span>
                      </button>

                      {/* Check button - small circle inside selected answer */}
                      {!isChecked && isSelected && (
                        <button
                          onClick={handleCheck}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
                          title="Check Answer"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation (shown after check) */}
          {isChecked && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Explanation</h3>
              <div className="text-blue-800 text-sm whitespace-pre-wrap">
                {currentQuestion.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={session.currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={session.currentQuestionIndex === questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
