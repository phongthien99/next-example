/**
 * Domain Model: Question
 * Core business entity representing a quiz question
 */

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  category: string;
  content: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}
