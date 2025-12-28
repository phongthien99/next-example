/**
 * Repository Interface: IExamRepository
 * Defines the contract for exam/quiz data access operations
 * Follows Repository Pattern and Dependency Inversion Principle
 */
import { Question } from "../models/Question";
import { QuizSession } from "../models/Quiz";
import { QuizSessionInput } from "../dto/ExamTypes";

export interface IExamRepository {
  /**
   * Retrieves all questions for a quiz
   * @param quizId - Optional quiz ID filter
   * @returns Promise resolving to array of questions
   */
  getQuestions(quizId?: string): Promise<Question[]>;

  /**
   * Retrieves a single question by ID
   * @param id - Question ID
   * @returns Promise resolving to question or null if not found
   */
  getQuestionById(id: number): Promise<Question | null>;

  /**
   * Creates a new quiz session
   * @param input - Quiz session creation data
   * @returns Promise resolving to created quiz session
   */
  createQuizSession(input: QuizSessionInput): Promise<QuizSession>;

  /**
   * Retrieves a quiz session by ID
   * @param id - Quiz session UUID
   * @returns Promise resolving to quiz session or null if not found
   */
  getQuizSessionById(id: string): Promise<QuizSession | null>;

  /**
   * Updates quiz session state
   * @param id - Quiz session UUID
   * @param updates - Partial quiz session updates
   * @returns Promise resolving to updated quiz session
   */
  updateQuizSession(
    id: string,
    updates: Partial<QuizSession>,
  ): Promise<QuizSession>;

  /**
   * Saves answer for a question
   * @param sessionId - Quiz session UUID
   * @param questionId - Question ID
   * @param selectedOptionId - Selected option ID
   * @returns Promise resolving when answer is saved
   */
  saveAnswer(
    sessionId: string,
    questionId: number,
    selectedOptionId: string,
  ): Promise<void>;

  /**
   * Toggles flag status for a question
   * @param sessionId - Quiz session UUID
   * @param questionId - Question ID
   * @returns Promise resolving when flag is toggled
   */
  toggleFlag(sessionId: string, questionId: number): Promise<void>;

  /**
   * Marks a question as checked (reveals the answer)
   * @param sessionId - Quiz session UUID
   * @param questionId - Question ID
   * @returns Promise resolving when question is marked as checked
   */
  checkAnswer(sessionId: string, questionId: number): Promise<void>;
}
