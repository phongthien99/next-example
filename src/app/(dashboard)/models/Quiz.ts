/**
 * Domain Model: Quiz
 * Core business entity representing a quiz session
 */

export interface QuizSession {
  id: string;
  title: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: Record<number, string>; // questionId -> selectedOptionId
  flaggedQuestions: Set<number>;
  answeredQuestions: Set<number>;
  checkedQuestions: Set<number>; // questionId -> questions that have been checked
  timeElapsed: number; // in seconds
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizProgress {
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
  timeElapsed: string; // formatted as HH:MM:SS
}
