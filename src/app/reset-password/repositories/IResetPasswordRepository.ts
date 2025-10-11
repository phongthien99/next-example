import { ResetPasswordRequest, ResetPasswordResponse } from '../dto/ResetPasswordTypes';

/**
 * Repository interface for password reset operations
 * Dependency Inversion Principle: hooks depend on this interface, not implementations
 */
export interface IResetPasswordRepository {
  /**
   * Reset user password using token
   * @param request - Password reset request with token and new password
   * @returns Promise resolving to reset response
   * @throws ResetPasswordError on failure
   */
  resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
