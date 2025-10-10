import { User } from './User';

/**
 * SignupSession Domain Model
 *
 * Represents the state of an ongoing signup process.
 * Used by the application layer to track form submission state.
 */
export interface SignupSession {
  /**
   * Whether signup is currently in progress (form submitted)
   */
  inProgress: boolean;

  /**
   * User data after successful signup
   */
  user?: User;

  /**
   * Error message if signup failed
   */
  error?: string;

  /**
   * Timestamp when signup was initiated
   */
  startedAt?: Date;

  /**
   * Timestamp when signup completed (success or failure)
   */
  completedAt?: Date;
}
