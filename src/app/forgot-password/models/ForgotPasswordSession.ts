/**
 * ForgotPasswordSession - Domain Model
 *
 * Represents the UI state for the forgot password form
 */
export interface ForgotPasswordSession {
  // Form input
  email: string;

  // Validation state
  fieldError?: string; // Email validation error message

  // Submission state
  isLoading: boolean;
  isSuccess: boolean;
  apiError?: string; // API error message (if request fails)

  // Metadata
  submittedAt?: Date; // Timestamp of last submission attempt
  lastAttemptEmail?: string; // Email from last attempt (for duplicate detection)
}

/**
 * Initial state for forgot password session
 */
export const initialForgotPasswordSession: ForgotPasswordSession = {
  email: '',
  isLoading: false,
  isSuccess: false,
};
