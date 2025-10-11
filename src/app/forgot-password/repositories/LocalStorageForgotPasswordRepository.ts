import {
  ForgotPasswordInput,
  ForgotPasswordResponse
} from '../dto/ForgotPasswordTypes';
import { IForgotPasswordRepository } from './IForgotPasswordRepository';

/**
 * LocalStorageForgotPasswordRepository - LocalStorage Implementation
 *
 * Implements IForgotPasswordRepository for development/offline mode.
 * Simulates API response without actual network call.
 */
export class LocalStorageForgotPasswordRepository implements IForgotPasswordRepository {
  async requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log request (development only)
    console.log('[LocalStorage] Password reset requested for:', input.email);

    // Store in localStorage (for debugging)
    try {
      const requests = JSON.parse(localStorage.getItem('password-reset-requests') || '[]');
      requests.push({
        email: input.email,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('password-reset-requests', JSON.stringify(requests));
    } catch (error) {
      console.warn('[LocalStorage] Failed to store request:', error);
    }

    // Return success response
    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    };
  }
}
