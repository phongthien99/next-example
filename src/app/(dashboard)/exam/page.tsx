"use client";

/**
 * Exam Page - Main Route Component
 * Provides repository context and renders exam/quiz UI
 */
import { useState, useEffect, useCallback } from "react";
import { ExamRepositoryProvider } from "../providers/ExamRepositoryProvider";
import { useExamManagement } from "../hooks/UseExamManagement";
import { Timer } from "../components/Timer";
import { QuestionNavigationGrid } from "../components/QuestionNavigationGrid";
import { QuizActions } from "../components/QuizActions";
import { QuestionDisplay } from "../components/QuestionDisplay";
import { QuizNavigation } from "../components/QuizNavigation";
import { QuizSummary } from "../components/QuizSummary";

function ExamContent() {
  const {
    questions,
    currentSession,
    currentQuestion,
    progress,
    isLoading,
    error,
    initializeQuiz,
    navigateToQuestion,
    selectAnswer,
    toggleFlag,
    checkAnswer,
    pauseQuiz,
    resumeQuiz,
    updateTime,
  } = useExamManagement();

  const [showSummary, setShowSummary] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Initialize quiz on mount
  useEffect(() => {
    if (questions.length > 0 && !currentSession) {
      initializeQuiz(
        "TOEIC Practice Test - Reading & Grammar",
        questions.length,
      );
    }
  }, [questions, currentSession, initializeQuiz]);

  // Update selected answer when navigating to a different question
  useEffect(() => {
    if (currentQuestion && currentSession) {
      const answer = currentSession.answers[currentQuestion.id];
      setSelectedAnswer(answer || null);
    }
  }, [currentQuestion, currentSession]);

  const handleAnswerSelect = async (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswer(optionId);
    await selectAnswer(currentQuestion.id, optionId);
  };

  const handleToggleFlag = async () => {
    if (!currentQuestion) return;
    await toggleFlag(currentQuestion.id);
  };

  const handleTogglePause = () => {
    if (!currentSession) return;
    if (currentSession.isPaused) {
      resumeQuiz();
    } else {
      pauseQuiz();
    }
  };

  const handlePrevious = () => {
    if (!currentQuestion || currentQuestion.id === 1) return;
    navigateToQuestion(currentQuestion.id - 1);
  };

  const handleNext = () => {
    if (!currentQuestion || currentQuestion.id === questions.length) return;
    navigateToQuestion(currentQuestion.id + 1);
  };

  const handleCheck = async () => {
    if (!currentQuestion) return;
    await checkAnswer(currentQuestion.id);
  };

  const handleTimeUpdate = useCallback((_formattedTime: string, seconds: number) => {
    updateTime(seconds);
  }, [updateTime]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading exam</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!currentSession || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Initializing quiz session...</p>
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
              {currentSession.title}
            </h1>
            <Timer
              isPaused={currentSession.isPaused}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Question Navigation Grid */}
        <QuestionNavigationGrid
          totalQuestions={currentSession.totalQuestions}
          currentQuestionId={currentQuestion.id}
          answeredQuestions={currentSession.answeredQuestions}
          flaggedQuestions={currentSession.flaggedQuestions}
          answeredCount={currentSession.answeredQuestions.size}
          onNavigateToQuestion={navigateToQuestion}
        />

        {/* Action Buttons */}
        <QuizActions
          isFlagged={currentSession.flaggedQuestions.has(currentQuestion.id)}
          isPaused={currentSession.isPaused}
          onToggleFlag={handleToggleFlag}
          onTogglePause={handleTogglePause}
          onShowSummary={() => setShowSummary(true)}
        />

        {/* Question Content */}
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isChecked={currentSession.checkedQuestions.has(currentQuestion.id)}
          onSelectAnswer={handleAnswerSelect}
        />

        {/* Navigation Controls */}
        <QuizNavigation
          currentQuestionId={currentQuestion.id}
          totalQuestions={currentSession.totalQuestions}
          isChecked={currentSession.checkedQuestions.has(currentQuestion.id)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onCheck={handleCheck}
        />
      </div>

      {/* Quiz Summary Modal */}
      {progress && (
        <QuizSummary
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          progress={progress}
          answeredQuestions={currentSession.answeredQuestions}
          flaggedQuestions={currentSession.flaggedQuestions}
          onNavigateToQuestion={navigateToQuestion}
        />
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <ExamRepositoryProvider repositoryType="yaml">
      <ExamContent />
    </ExamRepositoryProvider>
  );
}
