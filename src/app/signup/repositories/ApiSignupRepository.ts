import { ISignupRepository } from "./ISignupRepository";
import {
  SignupInput,
  SignupOutputSchema,
  DuplicateEmailError,
  SignupAPIError,
} from "../dto/SignupTypes";
import { User } from "../models/User";

/**
 * ApiSignupRepository
 *
 * Repository implementation that uses external API for user registration.
 * Implements ISignupRepository interface.
 */
export class ApiSignupRepository implements ISignupRepository {
  private baseUrl: string;

  /**
   * @param baseUrl - Base URL for API (from environment variable)
   */
  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user via API
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      // Handle duplicate email (409 Conflict)
      if (response.status === 409) {
        throw new DuplicateEmailError(input.email);
      }

      // Handle validation errors (400 Bad Request)
      if (response.status === 400) {
        const errorData = await response.json();
        throw new SignupAPIError(
          400,
          errorData.error || "Validation failed",
          errorData.details,
        );
      }

      // Handle other errors
      if (!response.ok) {
        throw new SignupAPIError(
          response.status,
          `Signup failed with status ${response.status}`,
        );
      }

      // Parse and validate response
      const data = await response.json();
      const validated = SignupOutputSchema.parse(data);

      // Convert to User domain model
      return {
        id: validated.id,
        name: validated.name,
        email: validated.email,
        createdAt: new Date(validated.createdAt),
        emailVerified: validated.emailVerified,
      };
    } catch (error) {
      if (
        error instanceof DuplicateEmailError ||
        error instanceof SignupAPIError
      ) {
        throw error;
      }
      // Network error or unexpected failure
      throw new SignupAPIError(
        500,
        "Network error or unexpected failure",
        error,
      );
    }
  }

  /**
   * Check if email exists via API
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/signup/check-email?email=${encodeURIComponent(email)}`,
      );
      if (!response.ok) return false;
      const data = await response.json();
      return data.exists === true;
    } catch {
      // Fail silently for email check
      return false;
    }
  }
}
