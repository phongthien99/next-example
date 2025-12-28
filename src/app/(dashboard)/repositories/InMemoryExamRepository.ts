/**
 * In-Memory Exam Repository Implementation
 * Mock data store with simulated async operations
 */
import { IExamRepository } from "./IExamRepository";
import { Question } from "../models/Question";
import { QuizSession } from "../models/Quiz";
import { QuizSessionInput } from "../dto/ExamTypes";
import { generateUUID } from "@/lib/uuid";

export class InMemoryExamRepository implements IExamRepository {
  private questions: Map<number, Question>;
  private quizSessions: Map<string, QuizSession>;

  constructor() {
    this.questions = new Map();
    this.quizSessions = new Map();
    this.seedMockQuestions();
  }

  /**
   * Seeds the repository with mock AWS DevOps exam questions
   */
  private seedMockQuestions(): void {
    const mockQuestions: Question[] = [
      {
        id: 1,
        category: "DOP - SDLC Automation",
        content: `A business has a Go-based on-premises application that needs to be migrated to AWS. The business was excited about the migration and wanted to take advantage of the new opportunities that AWS provided. Its development team desires to enable blue/green deployments. This would allow them to have two identical environments running side-by-side, with one being the current production environment (blue) and the other being a new environment (green) where they could test new features and changes via A/B testing.

Which of the following is the MOST appropriate solution that the DevOps Engineer should implement to meet the requirements?`,
        options: [
          {
            id: "A",
            text: "Host the application code in AWS CodeArtifact. Deploy the application on a fleet of Amazon EC2 instances using AWS CodeDeploy. To distribute the traffic to the EC2 instances, utilize the Application Load Balancer. When modifying the application, store a new version to CodeArtifact and create a new CodeDeploy deployment.",
          },
          {
            id: "B",
            text: "Host the application using Amazon Lightsail. Upload a zipped version of the application on an Amazon S3 bucket. Utilize the bucket to implement new versions of the application. Use Lightsail deployment options to manage the deployment.",
          },
          {
            id: "C",
            text: "Host the application on AWS Elastic Beanstalk. Use the Elastic Beanstalk deployment policies to deploy new versions. Configure the environment to use an Application Load Balancer for traffic distribution.",
          },
          {
            id: "D",
            text: "Host the application in Amazon ECS using Fargate. Implement blue/green deployments using AWS CodeDeploy with ECS. Use an Application Load Balancer to manage traffic shifting between the blue and green environments.",
          },
        ],
        correctAnswer: "D",
        explanation:
          "Option D is correct because Amazon ECS with Fargate combined with AWS CodeDeploy provides native support for blue/green deployments. CodeDeploy can automatically manage traffic shifting between the blue and green task sets using an Application Load Balancer, which exactly matches the requirement for A/B testing and safe deployments. Options A and C lack native blue/green deployment support, while Option B (Lightsail) is not designed for enterprise-scale blue/green deployments.",
      },
      {
        id: 2,
        category: "DOP - Monitoring and Logging",
        content: `Your team is setting up centralized logging for multiple AWS accounts. You need to collect logs from various sources including EC2 instances, Lambda functions, and containers running on ECS.

Which solution provides the most comprehensive and scalable approach for centralized log management?`,
        options: [
          {
            id: "A",
            text: "Use AWS CloudWatch Logs with cross-account log sharing. Create a centralized logging account and use CloudWatch Logs destination to aggregate logs from all accounts.",
          },
          {
            id: "B",
            text: "Deploy Elasticsearch on EC2 instances in a centralized account. Use Logstash agents on all sources to ship logs to the Elasticsearch cluster.",
          },
          {
            id: "C",
            text: "Use Amazon OpenSearch Service (formerly Elasticsearch) with Amazon Kinesis Data Firehose. Configure log sources to send data to Kinesis, which then delivers to OpenSearch.",
          },
          {
            id: "D",
            text: "Set up AWS X-Ray across all accounts and use X-Ray service maps for centralized monitoring and logging.",
          },
        ],
        correctAnswer: "C",
        explanation:
          "Option C is correct because Amazon OpenSearch Service with Kinesis Data Firehose provides a fully managed, scalable solution for centralized logging. Kinesis Firehose can automatically batch, compress, and deliver logs to OpenSearch, handling high throughput and multiple sources efficiently. It also supports data transformation and can integrate with multiple AWS services. Option A works but is less scalable for high-volume logging. Option B requires managing infrastructure. Option D (X-Ray) is for distributed tracing, not comprehensive log aggregation.",
      },
      // Add more mock questions for a full 50-question exam
      ...Array.from({ length: 48 }, (_, i) => ({
        id: i + 3,
        category:
          i % 2 === 0
            ? "DOP - SDLC Automation"
            : "DOP - Monitoring and Logging",
        content: `Sample question ${i + 3} content. This is a placeholder for the actual exam question that would be loaded from a database or API.`,
        options: [
          { id: "A", text: `Option A for question ${i + 3}` },
          { id: "B", text: `Option B for question ${i + 3}` },
          { id: "C", text: `Option C for question ${i + 3}` },
          { id: "D", text: `Option D for question ${i + 3}` },
        ],
        correctAnswer: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
        explanation: `This is a sample explanation for question ${i + 3}. In a real exam, this would contain a detailed explanation of why the correct answer is right and why other options are incorrect.`,
      })),
    ];

    mockQuestions.forEach((question) => {
      this.questions.set(question.id, question);
    });
  }

  /**
   * Simulates network latency (100-300ms random delay)
   */
  private async simulateLatency(): Promise<void> {
    const delay = Math.floor(Math.random() * 200) + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getQuestions(): Promise<Question[]> {
    await this.simulateLatency();
    return Array.from(this.questions.values()).sort((a, b) => a.id - b.id);
  }

  async getQuestionById(id: number): Promise<Question | null> {
    await this.simulateLatency();
    return this.questions.get(id) ?? null;
  }

  async createQuizSession(input: QuizSessionInput): Promise<QuizSession> {
    await this.simulateLatency();

    const now = new Date();
    const newSession: QuizSession = {
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

    this.quizSessions.set(newSession.id, newSession);
    return newSession;
  }

  async getQuizSessionById(id: string): Promise<QuizSession | null> {
    await this.simulateLatency();
    return this.quizSessions.get(id) ?? null;
  }

  async updateQuizSession(
    id: string,
    updates: Partial<QuizSession>,
  ): Promise<QuizSession> {
    await this.simulateLatency();

    const existingSession = this.quizSessions.get(id);
    if (!existingSession) {
      throw new Error(`Quiz session with ID ${id} not found`);
    }

    const updatedSession: QuizSession = {
      ...existingSession,
      ...updates,
      updatedAt: new Date(),
    };

    this.quizSessions.set(id, updatedSession);
    return updatedSession;
  }

  async saveAnswer(
    sessionId: string,
    questionId: number,
    selectedOptionId: string,
  ): Promise<void> {
    await this.simulateLatency();

    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    session.answers[questionId] = selectedOptionId;
    session.answeredQuestions.add(questionId);
    session.updatedAt = new Date();
  }

  async toggleFlag(sessionId: string, questionId: number): Promise<void> {
    await this.simulateLatency();

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

  async checkAnswer(sessionId: string, questionId: number): Promise<void> {
    await this.simulateLatency();

    const session = this.quizSessions.get(sessionId);
    if (!session) {
      throw new Error(`Quiz session with ID ${sessionId} not found`);
    }

    session.checkedQuestions.add(questionId);
    session.updatedAt = new Date();
  }
}
