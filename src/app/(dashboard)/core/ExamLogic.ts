/**
 * Exam Business Logic
 * Pure functions for quiz/exam validation and business rules
 */
import {
  QuizSessionInputSchema,
  QuizSessionInput,
  AnswerSubmissionSchema,
  AnswerSubmission,
} from "../dto/ExamTypes";
import { QuizSession, QuizProgress } from "../models/Quiz";
import { generateUUID } from "@/lib/uuid";

/**
 * Validates quiz session input data using Zod schema
 * @param input - Unknown input to validate
 * @returns Validated QuizSessionInput
 * @throws ZodError if validation fails
 */
export function validateQuizSessionInput(input: unknown): QuizSessionInput {
  return QuizSessionInputSchema.parse(input);
}

/**
 * Validates answer submission data using Zod schema
 * @param input - Unknown input to validate
 * @returns Validated AnswerSubmission
 * @throws ZodError if validation fails
 */
export function validateAnswerSubmission(input: unknown): AnswerSubmission {
  return AnswerSubmissionSchema.parse(input);
}

/**
 * Creates a new QuizSession entity with initial state
 * @param input - Validated quiz session input data
 * @returns New QuizSession entity
 */
export function createQuizSessionEntity(input: QuizSessionInput): QuizSession {
  const now = new Date();
  return {
    id: generateUUID(),
    title: input.title,
    totalQuestions: input.totalQuestions,
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    answeredQuestions: new Set(),
    checkedQuestions: new Set(),
    timeElapsed: 0,
    isPaused: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculates quiz progress statistics
 * @param session - Current quiz session
 * @returns Quiz progress metrics
 */
export function calculateQuizProgress(session: QuizSession): QuizProgress {
  const answeredCount = session.answeredQuestions.size;
  const unansweredCount = session.totalQuestions - answeredCount;
  const flaggedCount = session.flaggedQuestions.size;

  return {
    totalQuestions: session.totalQuestions,
    answeredCount,
    unansweredCount,
    flaggedCount,
    timeElapsed: formatTime(session.timeElapsed),
  };
}

/**
 * Formats time in seconds to HH:MM:SS format
 * @param totalSeconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Checks if a question is answered
 * @param session - Current quiz session
 * @param questionId - Question ID to check
 * @returns True if question is answered
 */
export function isQuestionAnswered(
  session: QuizSession,
  questionId: number,
): boolean {
  return session.answeredQuestions.has(questionId);
}

/**
 * Checks if a question is flagged for review
 * @param session - Current quiz session
 * @param questionId - Question ID to check
 * @returns True if question is flagged
 */
export function isQuestionFlagged(
  session: QuizSession,
  questionId: number,
): boolean {
  return session.flaggedQuestions.has(questionId);
}

/**
 * Toggles flag status for a question
 * @param session - Current quiz session
 * @param questionId - Question ID to toggle
 * @returns Updated flagged questions set
 */
export function toggleQuestionFlag(
  session: QuizSession,
  questionId: number,
): Set<number> {
  const newFlagged = new Set(session.flaggedQuestions);
  if (newFlagged.has(questionId)) {
    newFlagged.delete(questionId);
  } else {
    newFlagged.add(questionId);
  }
  return newFlagged;
}

/**
 * Checks if a question has been checked (answer revealed)
 * @param session - Current quiz session
 * @param questionId - Question ID to check
 * @returns True if question is checked
 */
export function isQuestionChecked(
  session: QuizSession,
  questionId: number,
): boolean {
  return session.checkedQuestions.has(questionId);
}

/**
 * Validates if question index is within valid range
 * @param questionIndex - Question index to validate
 * @param totalQuestions - Total number of questions
 * @returns True if index is valid
 */
export function isValidQuestionIndex(
  questionIndex: number,
  totalQuestions: number,
): boolean {
  return questionIndex >= 0 && questionIndex < totalQuestions;
}
