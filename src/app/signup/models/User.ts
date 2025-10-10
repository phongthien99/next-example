/**
 * User Domain Model
 *
 * Represents a registered user entity in the system.
 * This is a pure domain model with no framework dependencies.
 */
export interface User {
  /**
   * Unique identifier for the user
   * - Assigned by API on successful registration
   * - Optional during signup process
   */
  id?: string;

  /**
   * User's full name
   * - Required
   * - Length: 2-100 characters
   * - Trimmed of whitespace
   */
  name: string;

  /**
   * User's email address
   * - Required
   * - Must be unique across all users
   * - Stored in lowercase
   * - Valid email format (RFC 5322)
   */
  email: string;

  /**
   * Timestamp of account creation
   * - Assigned by system on registration
   */
  createdAt: Date;

  /**
   * Email verification status
   * - Initially false on signup
   * - Updated by separate email verification flow
   */
  emailVerified?: boolean;
}
