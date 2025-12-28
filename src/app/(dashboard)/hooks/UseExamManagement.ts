"use client";

/**
 * Application Layer: Exam Management Hook
 * Encapsulates business logic for exam/quiz operations
 */
import { useState, useEffect, useCallback } from "react";
import { useExamRepository } from "../providers/ExamRepositoryProvider";
import { Question } from "../models/Question";
import { QuizSession, QuizProgress } from "../models/Quiz";
import { calculateQuizProgress, toggleQuestionFlag } from "../core/ExamLogic";

interface UseExamManagementResult {
  questions: Question[];
  currentSession: QuizSession | null;
  currentQuestion: Question | null;
  progress: QuizProgress | null;
  isLoading: boolean;
  error: Error | null;
  initializeQuiz: (title: string, totalQuestions: number) => Promise<void>;
  navigateToQuestion: (questionId: number) => void;
  selectAnswer: (questionId: number, optionId: string) => Promise<void>;
  toggleFlag: (questionId: number) => Promise<void>;
  checkAnswer: (questionId: number) => Promise<void>;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  updateTime: (seconds: number) => void;
}

/**
 * Hook for managing exam/quiz session operations
 */
export function useExamManagement(): UseExamManagementResult {
  const repository = useExamRepository();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all questions on mount
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.getQuestions();
      setQuestions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch questions"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Update progress when session changes
  useEffect(() => {
    if (currentSession) {
      setProgress(calculateQuizProgress(currentSession));
    }
  }, [currentSession]);

  // Initialize a new quiz session
  const initializeQuiz = useCallback(
    async (title: string, totalQuestions: number) => {
      try {
        setIsLoading(true);
        const session = await repository.createQuizSession({
          title,
          totalQuestions,
        });
        setCurrentSession(session);

        // Load first question
        if (questions.length > 0) {
          setCurrentQuestion(questions[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize quiz"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository, questions],
  );

  // Navigate to a specific question
  const navigateToQuestion = useCallback(
    (questionId: number) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        setCurrentQuestion(question);
        setCurrentSession((prevSession) => {
          if (!prevSession) return prevSession;
          return {
            ...prevSession,
            currentQuestionIndex: questionId - 1,
          };
        });
      }
    },
    [questions],
  );

  // Select an answer for a question
  const selectAnswer = useCallback(
    async (questionId: number, optionId: string) => {
      setCurrentSession((prevSession) => {
        if (!prevSession) return prevSession;

        try {
          repository.saveAnswer(prevSession.id, questionId, optionId);

          // Update local session state
          const updatedSession = { ...prevSession };
          updatedSession.answers[questionId] = optionId;
          updatedSession.answeredQuestions.add(questionId);
          return updatedSession;
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Failed to save answer"),
          );
          throw err;
        }
      });
    },
    [repository],
  );

  // Toggle flag for a question
  const toggleFlag = useCallback(
    async (questionId: number) => {
      setCurrentSession((prevSession) => {
        if (!prevSession) return prevSession;

        try {
          repository.toggleFlag(prevSession.id, questionId);

          // Update local session state
          const updatedSession = { ...prevSession };
          updatedSession.flaggedQuestions = toggleQuestionFlag(
            prevSession,
            questionId,
          );
          return updatedSession;
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Failed to toggle flag"),
          );
          throw err;
        }
      });
    },
    [repository],
  );

  // Check answer for a question (reveal correct answer)
  const checkAnswer = useCallback(
    async (questionId: number) => {
      setCurrentSession((prevSession) => {
        if (!prevSession) return prevSession;

        try {
          repository.checkAnswer(prevSession.id, questionId);

          // Update local session state
          const updatedSession = { ...prevSession };
          updatedSession.checkedQuestions.add(questionId);
          return updatedSession;
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Failed to check answer"),
          );
          throw err;
        }
      });
    },
    [repository],
  );

  // Pause the quiz
  const pauseQuiz = useCallback(() => {
    setCurrentSession((prevSession) => {
      if (!prevSession) return prevSession;
      return { ...prevSession, isPaused: true };
    });
  }, []);

  // Resume the quiz
  const resumeQuiz = useCallback(() => {
    setCurrentSession((prevSession) => {
      if (!prevSession) return prevSession;
      return { ...prevSession, isPaused: false };
    });
  }, []);

  // Update elapsed time
  const updateTime = useCallback((seconds: number) => {
    setCurrentSession((prevSession) => {
      if (!prevSession) return prevSession;
      return { ...prevSession, timeElapsed: seconds };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
}
