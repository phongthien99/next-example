/**
 * YAML Exam Repository Implementation
 * Loads exam data from YAML via API and parses on client-side
 */
import { IExamRepository } from "./IExamRepository";
import { Question } from "../models/Question";
import { QuizSession } from "../models/Quiz";
import { QuizSessionInput } from "../dto/ExamTypes";
import { generateUUID } from "@/lib/uuid";
import { parse } from "yaml";

interface YamlQuestion {
  id: number;
  category: string;
  content: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer: string;
  explanation?: string;
}

interface YamlData {
  questions: YamlQuestion[];
}

export class YamlExamRepository implements IExamRepository {
  private questions: Map<number, Question> = new Map();
  private quizSessions: Map<string, QuizSession> = new Map();
  private isInitialized = false;

  constructor() {
    // Load data asynchronously on first use
  }

  /**
   * Initialize repository by loading YAML data via API
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Fetch YAML data from API route
      const response = await fetch('/api/exam/questions');
      console.log('Fetched YAML data response:', response);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      
      const yamlContent = await response.text();
      const data = parse(yamlContent) as YamlData;

      // Convert YAML data to Question objects
      data.questions.forEach((yamlQuestion) => {
        const question: Question = {
          id: yamlQuestion.id,
          category: yamlQuestion.category,
          content: yamlQuestion.content,
          options: yamlQuestion.options.map(option => ({
            id: option.id,
            text: option.text
          })),
          correctAnswer: yamlQuestion.correctAnswer,
          explanation: yamlQuestion.explanation || ''
        };
        this.questions.set(question.id, question);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load YAML data via API:', error);
      throw new Error('Failed to initialize YAML repository');
    }
  }

  /**
   * Retrieves all questions for a quiz
   */
  async getQuestions(quizId?: string): Promise<Question[]> {
    await this.initialize();
    
    // Create fresh copies of questions to avoid shared state
    return Array.from(this.questions.values()).map(question => ({
      ...question,
      options: question.options.map(option => ({ ...option }))
    }));
  }

  /**
   * Retrieves a single question by ID
   */
  async getQuestionById(id: number): Promise<Question | null> {
    await this.initialize();
    
    const question = this.questions.get(id);
    if (!question) return null;

    // Return a fresh copy
    return {
      ...question,
      options: question.options.map(option => ({ ...option }))
    };
  }

  /**
   * Creates a new quiz session
   */
  async createQuizSession(input: QuizSessionInput): Promise<QuizSession> {
    await this.initialize();
    
    const sessionId = generateUUID();
    const now = new Date();
    
    const session: QuizSession = {
      id: sessionId,
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
      updatedAt: now
    };

    this.quizSessions.set(sessionId, session);
    return { ...session };
  }

  /**
   * Retrieves a quiz session by ID
   */
  async getQuizSessionById(id: string): Promise<QuizSession | null> {
    const session = this.quizSessions.get(id);
    return session ? { ...session } : null;
  }

  /**
   * Updates a quiz session
   */
  async updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession> {
    const existingSession = this.quizSessions.get(id);
    if (!existingSession) {
      throw new Error(`Quiz session with ID ${id} not found`);
    }

    const updatedSession = { ...existingSession, ...updates };
    this.quizSessions.set(id, updatedSession);
    return { ...updatedSession };
  }

  /**
   * Saves answer for a question
   */
  async saveAnswer(
    sessionId: string,
    questionId: number,
    selectedOptionId: string
  ): Promise<void> {
    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    session.answers[questionId] = selectedOptionId;
    session.answeredQuestions.add(questionId);
    session.updatedAt = new Date();
  }

  /**
   * Toggles flag status for a question
   */
  async toggleFlag(sessionId: string, questionId: number): Promise<void> {
    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    if (session.flaggedQuestions.has(questionId)) {
      session.flaggedQuestions.delete(questionId);
    } else {
      session.flaggedQuestions.add(questionId);
    }
    session.updatedAt = new Date();
  }

  /**
   * Marks a question as checked (reveals the answer)
   */
  async checkAnswer(sessionId: string, questionId: number): Promise<void> {
    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    session.checkedQuestions.add(questionId);
    session.updatedAt = new Date();
  }

  /**
   * Submits the quiz session
   */
  async submitQuizSession(sessionId: string): Promise<QuizSession> {
    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    const completedSession = {
      ...session,
      endTime: new Date(),
      isCompleted: true,
    };

    this.quizSessions.set(sessionId, completedSession);
    return { ...completedSession };
  }

  /**
   * Deletes a quiz session
   */
  async deleteQuizSession(id: string): Promise<void> {
    const deleted = this.quizSessions.delete(id);
    if (!deleted) {
      throw new Error(`Quiz session with ID ${id} not found`);
    }
  }

  /**
   * Gets all quiz sessions (for admin/debugging purposes)
   */
  async getAllQuizSessions(): Promise<QuizSession[]> {
    return Array.from(this.quizSessions.values()).map(session => ({ ...session }));
  }
}
