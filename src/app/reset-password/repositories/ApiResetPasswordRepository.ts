import { IResetPasswordRepository } from './IResetPasswordRepository';
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
  ResetPasswordError,
  ResetPasswordErrorCode
} from '../dto/ResetPasswordTypes';

/**
 * API-based implementation of password reset repository
 * Makes HTTP requests to external password reset API
 */
export class ApiResetPasswordRepository implements IResetPasswordRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || '') {
    if (!baseUrl) {
      throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL environment variable.');
    }
    this.baseUrl = baseUrl;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Password reset failed' }));
        throw new ResetPasswordError(
          this.mapStatusToErrorCode(response.status),
          errorData.message || 'Password reset failed',
          response.status
        );
      }

      const data = await response.json();
      // Validate response with Zod schema
      return ResetPasswordResponseSchema.parse(data);
    } catch (error) {
      if (error instanceof ResetPasswordError) {
        throw error;
      }
      // Network error or other unexpected error
      throw new ResetPasswordError(
        ResetPasswordErrorCode.NETWORK_ERROR,
        'Unable to connect. Please check your internet connection and try again.',
        0
      );
    }
  }

  /**
   * Maps HTTP status codes to application error codes
   * @param status - HTTP status code
   * @returns Corresponding error code
   */
  private mapStatusToErrorCode(status: number): ResetPasswordErrorCode {
    switch (status) {
      case 400:
        return ResetPasswordErrorCode.VALIDATION_ERROR;
      case 401:
        return ResetPasswordErrorCode.TOKEN_INVALID;
      case 409:
        return ResetPasswordErrorCode.TOKEN_INVALID; // Token already used
      case 500:
        return ResetPasswordErrorCode.SERVER_ERROR;
      default:
        return ResetPasswordErrorCode.SERVER_ERROR;
    }
  }
}
