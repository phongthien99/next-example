/**
 * Data Transfer Objects and Validation Schemas
 * Defines input/output types and Zod validation for exam/quiz data
 */
import { z } from "zod";

/**
 * Schema for question option
 */
export const QuestionOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  text: z.string().min(1, "Option text is required"),
});

/**
 * Schema for a quiz question
 */
export const QuestionSchema = z.object({
  id: z.number().int().positive("Question ID must be a positive integer"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(1, "Question content is required"),
  options: z.array(QuestionOptionSchema).min(2, "At least 2 options required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().min(1, "Explanation is required"),
});

/**
 * Schema for quiz session input
 */
export const QuizSessionInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required")
    .max(500, "Title too long"),
  totalQuestions: z.number().int().positive("Total questions must be positive"),
});

/**
 * Schema for answer submission
 */
export const AnswerSubmissionSchema = z.object({
  questionId: z.number().int().positive("Invalid question ID"),
  selectedOptionId: z.string().min(1, "Selected option is required"),
});

/**
 * Schema for quiz session state update
 */
export const QuizSessionUpdateSchema = z.object({
  currentQuestionIndex: z.number().int().min(0).optional(),
  answers: z.record(z.string(), z.string()).optional(), // Record<questionId, optionId>
  flaggedQuestions: z.array(z.number().int()).optional(),
  answeredQuestions: z.array(z.number().int()).optional(),
  timeElapsed: z.number().int().min(0).optional(),
  isPaused: z.boolean().optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuizSessionInput = z.infer<typeof QuizSessionInputSchema>;
export type AnswerSubmission = z.infer<typeof AnswerSubmissionSchema>;
export type QuizSessionUpdate = z.infer<typeof QuizSessionUpdateSchema>;
