import {
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "../dto/ForgotPasswordTypes";

/**
 * IForgotPasswordRepository - Repository Interface (Dependency Inversion Principle)
 *
 * Defines the contract for forgot password operations.
 * This interface enables DIP by allowing high-level modules (hooks) to depend on
 * an abstraction rather than concrete implementations.
 *
 * ## Available Implementations:
 * - `ApiForgotPasswordRepository`: External API integration (production)
 * - `LocalStorageForgotPasswordRepository`: Development/offline mode
 *
 * ## Benefits:
 * - **Testability**: Easy to mock for unit tests
 * - **Flexibility**: Swap implementations without changing business logic
 * - **Maintainability**: API changes don't affect application layer
 *
 * ## Usage:
 * ```tsx
 * const repository = useForgotPasswordRepository(); // Returns IForgotPasswordRepository
 * const response = await repository.requestPasswordReset({ email: 'user@example.com' });
 * ```
 */
export interface IForgotPasswordRepository {
  /**
   * Request a password reset for the given email address
   *
   * @param input - Validated forgot password input (must pass ForgotPasswordInputSchema)
   * @returns Promise resolving to API response with success message
   * @throws ForgotPasswordAPIError on API failures (4xx, 5xx status codes)
   * @throws Error on network failures (timeout, connection refused)
   *
   * @example
   * ```tsx
   * try {
   *   const response = await repository.requestPasswordReset({ email: 'user@example.com' });
   *   console.log(response.message); // "Reset link sent"
   * } catch (error) {
   *   if (error instanceof ForgotPasswordAPIError) {
   *     console.error('API error:', error.statusCode, error.message);
   *   }
   * }
   * ```
   */
  requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResponse>;
}
