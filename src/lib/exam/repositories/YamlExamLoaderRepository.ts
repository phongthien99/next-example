/**
 * YAML Exam Loader Repository
 * Loads exam data from the new YAML structure in /public/exams/
 */
import { parse } from 'yaml';
import type {
  ExamIndex,
  ExamMeta,
  Part,
  Question,
  LoadExamResponse,
  LoadPartResponse,
} from '../types/ExamSchema';

export class YamlExamLoaderRepository {
  private baseUrl = '/exams';
  private cache = new Map<string, ExamIndex | ExamMeta | Part | Question>();

  /**
   * Load exam index (list of all exams)
   */
  async loadExamIndex(): Promise<ExamIndex> {
    const cacheKey = 'index';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as ExamIndex;
    }

    try {
      const response = await fetch(`${this.baseUrl}/index.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load exam index: ${response.status}`);
      }

      const yamlText = await response.text();
      const data = parse(yamlText) as ExamIndex;

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to load exam index:', error);
      throw new Error('Failed to load exam index');
    }
  }

  /**
   * Load exam metadata
   */
  async loadExamMeta(examId: string): Promise<ExamMeta> {
    const cacheKey = `meta-${examId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as ExamMeta;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${examId}/meta.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load exam meta: ${response.status}`);
      }

      const yamlText = await response.text();
      const data = parse(yamlText) as ExamMeta;

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load exam meta for ${examId}:`, error);
      throw new Error(`Failed to load exam meta for ${examId}`);
    }
  }

  /**
   * Load a specific part
   */
  async loadPart(examId: string, partId: string): Promise<Part> {
    const cacheKey = `part-${examId}-${partId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Part;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${examId}/parts/${partId}.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load part: ${response.status}`);
      }

      const yamlText = await response.text();
      const data = parse(yamlText) as Part;

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load part ${partId} for exam ${examId}:`, error);
      throw new Error(`Failed to load part ${partId}`);
    }
  }

  /**
   * Load a specific question
   */
  async loadQuestion(examId: string, questionId: string): Promise<Question> {
    const cacheKey = `question-${examId}-${questionId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Question;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${examId}/questions/${questionId}.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const yamlText = await response.text();
      const data = parse(yamlText) as Question;

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load question ${questionId} for exam ${examId}:`, error);
      throw new Error(`Failed to load question ${questionId}`);
    }
  }

  /**
   * Load multiple questions
   */
  async loadQuestions(examId: string, questionIds: string[]): Promise<Question[]> {
    try {
      const questions = await Promise.all(
        questionIds.map(qId => this.loadQuestion(examId, qId))
      );
      return questions;
    } catch (error) {
      console.error(`Failed to load questions for exam ${examId}:`, error);
      throw new Error(`Failed to load questions for exam ${examId}`);
    }
  }

  /**
   * Load part with all its questions
   */
  async loadPartWithQuestions(examId: string, partId: string): Promise<LoadPartResponse> {
    try {
      const part = await this.loadPart(examId, partId);
      const questions = await this.loadQuestions(examId, part.questionIds);

      return {
        part,
        questions,
      };
    } catch (error) {
      console.error(`Failed to load part with questions for ${partId}:`, error);
      throw new Error(`Failed to load part with questions for ${partId}`);
    }
  }

  /**
   * Load entire exam with all parts and questions
   */
  async loadCompleteExam(examId: string): Promise<LoadExamResponse> {
    try {
      const meta = await this.loadExamMeta(examId);

      // Load all parts
      const partsPromises = meta.parts.map(partConfig =>
        this.loadPart(examId, partConfig.id)
      );
      const parts = await Promise.all(partsPromises);

      // Load all questions from all parts
      const allQuestionIds = parts.flatMap(part => part.questionIds);
      const questions = await this.loadQuestions(examId, allQuestionIds);

      return {
        meta,
        parts,
        questions,
      };
    } catch (error) {
      console.error(`Failed to load complete exam ${examId}:`, error);
      throw new Error(`Failed to load complete exam ${examId}`);
    }
  }

  /**
   * Load specific parts of an exam
   */
  async loadExamParts(examId: string, partIds: string[]): Promise<LoadExamResponse> {
    try {
      const meta = await this.loadExamMeta(examId);

      // Load specified parts
      const parts = await Promise.all(
        partIds.map(partId => this.loadPart(examId, partId))
      );

      // Load questions for specified parts
      const allQuestionIds = parts.flatMap(part => part.questionIds);
      const questions = await this.loadQuestions(examId, allQuestionIds);

      return {
        meta,
        parts,
        questions,
      };
    } catch (error) {
      console.error(`Failed to load exam parts for ${examId}:`, error);
      throw new Error(`Failed to load exam parts for ${examId}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance
export const yamlExamLoader = new YamlExamLoaderRepository();
