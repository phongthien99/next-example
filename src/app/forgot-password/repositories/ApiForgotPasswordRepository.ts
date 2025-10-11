import {
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ForgotPasswordResponseSchema,
  ForgotPasswordAPIError
} from '../dto/ForgotPasswordTypes';
import { IForgotPasswordRepository } from './IForgotPasswordRepository';

/**
 * ApiForgotPasswordRepository - API Implementation
 *
 * Implements IForgotPasswordRepository using external API endpoint.
 * Handles network requests, timeouts, and error responses.
 */
export class ApiForgotPasswordRepository implements IForgotPasswordRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    try {
      const response = await fetch(`${this.baseUrl}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ForgotPasswordAPIError(
          response.status,
          data.message || 'Something went wrong. Please try again.',
          data
        );
      }

      // Validate response with Zod schema
      return ForgotPasswordResponseSchema.parse(data);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof ForgotPasswordAPIError) {
        throw error;
      }
      if (error.name === 'AbortError') {
        throw new ForgotPasswordAPIError(0, 'Request timed out. Please try again.');
      }
      // Network error
      throw new ForgotPasswordAPIError(
        0,
        'Unable to connect. Please check your internet connection.',
        error
      );
    }
  }
}
