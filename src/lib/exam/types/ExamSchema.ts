/**
 * TypeScript Types for YAML-based Exam System
 * These types match the YAML schema defined in /public/exams/
 */

// ============================================================================
// Exam Index Types
// ============================================================================

export interface ExamIndex {
  version: string;
  lastUpdated: string;
  exams: ExamSummary[];
  examTypes: ExamType[];
  levels: DifficultyLevel[];
}

export interface ExamSummary {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  totalQuestions: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  thumbnail?: string;
}

export interface ExamType {
  id: string;
  name: string;
  description: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  scoreRange?: string;
}

// ============================================================================
// Exam Meta Types
// ============================================================================

export interface ExamMeta {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  version: string;
  duration: number;
  totalTime: number;
  totalParts: number;
  totalQuestions: number;
  passingScore: number;
  maxScore: number;
  scoringRules: ScoringRules;
  parts: PartConfig[];
  generalInstructions?: string;
  settings: ExamSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt?: string;
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  stats?: ExamStats;
}

export interface ScoringRules {
  listening?: SectionScoring;
  reading?: SectionScoring;
}

export interface SectionScoring {
  minScore: number;
  maxScore: number;
  parts: string[];
  totalQuestions: number;
}

export interface PartConfig {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'listening' | 'reading';
  totalQuestions: number;
  timeLimit: number | null;
}

export interface ExamSettings {
  allowReview: boolean;
  showExplanation: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowSkip: boolean;
  showTimer: boolean;
  autoSubmit: boolean;
  allowPause?: boolean;
  showProgress?: boolean;
  saveProgress?: boolean;
}

export interface ExamStats {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}

// ============================================================================
// Part Types
// ============================================================================

export interface Part {
  id: string;
  examId: string;
  order: number;
  title: string;
  description: string;
  type: 'listening' | 'reading';
  totalQuestions: number;
  timeLimit: number | null;
  instructions: string;
  questionIds: string[];
  settings: PartSettings;
  pointsPerQuestion: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartSettings {
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  autoPlayAudio?: boolean;
  allowAudioReplay?: boolean;
  maxAudioReplays?: number;
  showTranscript?: boolean;
  showOptionsText?: boolean;
}

// ============================================================================
// Question Types
// ============================================================================

export interface Question {
  id: string;
  examId: string;
  partId: string;
  questionNumber: number;
  type: QuestionType;
  content: string;
  passage?: Passage;
  assets?: QuestionAssets;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'intermediate' | 'advanced';
  category: string;
  subcategory?: string;
  tags: string[];
  skills: string[];
  grammarPoint?: GrammarPoint;
  readingSkills?: string[];
  relatedQuestions?: RelatedQuestion[];
  passageInfo?: PassageInfo;
  points: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  status: 'draft' | 'published' | 'archived';
}

export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'matching';

export interface Passage {
  id: string;
  type: string;
  title: string;
  content: string;
}

export interface QuestionAssets {
  image?: string;
  audio?: string;
  audioScript?: string;
  video?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  audio?: string | null;
}

export interface GrammarPoint {
  topic: string;
  rule: string;
  commonMistakes?: string[];
}

export interface RelatedQuestion {
  id: string;
  content: string;
}

export interface PassageInfo {
  wordCount: number;
  readingLevel: string;
  genre: string;
}

// ============================================================================
// Quiz Session Types (for runtime usage)
// ============================================================================

export interface QuizSession {
  id: string;
  examId: string;
  title: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  flaggedQuestions: Set<string>;
  answeredQuestions: Set<string>;
  checkedQuestions: Set<string>;
  timeElapsed: number;
  isPaused: boolean;
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  endTime?: Date;
}

export interface QuizProgress {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  checkedCount: number;
  percentComplete: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LoadExamResponse {
  meta: ExamMeta;
  parts: Part[];
  questions: Question[];
}

export interface LoadPartResponse {
  part: Part;
  questions: Question[];
}
