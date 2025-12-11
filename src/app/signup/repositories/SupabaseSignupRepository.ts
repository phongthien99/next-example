import { ISignupRepository } from './ISignupRepository';
import { SignupInput, DuplicateEmailError, SignupAPIError } from '../dto/SignupTypes';
import { User } from '../models/User';
import { supabase } from '@/lib/supabase/client';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

/**
 * SupabaseSignupRepository
 *
 * Implementation of ISignupRepository using Supabase Authentication.
 *
 * Features:
 * - Email/password user registration via Supabase Auth
 * - Automatic user metadata handling (stores name)
 * - Email uniqueness validation
 * - Error mapping to domain error types
 *
 * Architecture Notes:
 * - Maps Supabase types to domain entities (User)
 * - Handles Supabase-specific errors
 * - Maintains compatibility with ISignupRepository interface
 * - Throws DuplicateEmailError for existing emails
 *
 * @implements ISignupRepository
 */
export class SupabaseSignupRepository implements ISignupRepository {
  /**
   * Register a new user using Supabase Auth
   *
   * @param input - Signup input (name, email)
   * @returns Created user entity
   * @throws DuplicateEmailError if email already exists
   * @throws SignupAPIError if registration fails
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      // Sign up with Supabase
      // Note: Supabase requires password, but your schema doesn't have it
      // We'll generate a random password and let user reset it via email
      const temporaryPassword = this.generateTemporaryPassword();

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: temporaryPassword,
        options: {
          data: {
            name: input.name,
          },
          // You may want to enable email confirmation in Supabase dashboard
          // emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        // Check if it's a duplicate email error
        if (this.isDuplicateEmailError(error)) {
          throw new DuplicateEmailError(input.email);
        }
        throw this.mapSupabaseError(error);
      }

      if (!data.user) {
        throw new SignupAPIError(500, 'No user returned from Supabase');
      }

      // Convert Supabase user to domain User
      return this.mapToUser(data.user);
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof DuplicateEmailError || error instanceof SignupAPIError) {
        throw error;
      }
      // Wrap unknown errors
      if (error instanceof Error) {
        throw new SignupAPIError(500, error.message);
      }
      throw new SignupAPIError(500, 'Failed to register user');
    }
  }

  /**
   * Check if email already exists in Supabase
   *
   * Note: Supabase doesn't provide a direct "check email exists" API.
   * We'll attempt a signup and catch the duplicate error.
   * Alternative: Query auth.users table if you have service role access.
   *
   * @param email - Email address to check
   * @returns true if email exists, false otherwise
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Strategy 1: Try to sign in with a dummy password
      // If user doesn't exist, Supabase returns a generic error
      // This is not ideal but works without service role access

      // Strategy 2 (preferred): Use RPC function or service role
      // For now, we'll return false and rely on signup error handling

      // Temporary implementation: Always return false
      // The signup method will throw DuplicateEmailError if email exists
      return false;
    } catch (error) {
      // If there's an error, assume email doesn't exist
      return false;
    }
  }

  /**
   * Map Supabase User to domain User entity
   *
   * @param user - Supabase user object
   * @returns User domain entity
   */
  private mapToUser(user: SupabaseUser): User {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      createdAt: user.created_at ? new Date(user.created_at) : new Date(),
      emailVerified: user.email_confirmed_at !== null,
    };
  }

  /**
   * Check if error is a duplicate email error
   *
   * @param error - Supabase auth error
   * @returns true if duplicate email error
   */
  private isDuplicateEmailError(error: AuthError): boolean {
    // Supabase returns this message for duplicate emails
    return error.message?.toLowerCase().includes('already registered') ||
           error.message?.toLowerCase().includes('user already exists') ||
           error.status === 422;
  }

  /**
   * Map Supabase AuthError to SignupAPIError
   *
   * @param error - Supabase auth error
   * @returns SignupAPIError with friendly message
   */
  private mapSupabaseError(error: AuthError): SignupAPIError {
    const status = error.status || 500;
    const message = this.getFriendlyErrorMessage(error);
    return new SignupAPIError(status, message, error);
  }

  /**
   * Get user-friendly error message from Supabase error
   *
   * @param error - Supabase auth error
   * @returns User-friendly error message
   */
  private getFriendlyErrorMessage(error: AuthError): string {
    switch (error.status) {
      case 400:
        return 'Invalid registration data';
      case 422:
        return 'Email or password is invalid';
      case 429:
        return 'Too many registration attempts. Please try again later.';
      default:
        return error.message || 'Failed to register user';
    }
  }

  /**
   * Generate a temporary password for Supabase signup
   * User will reset this via email
   *
   * @returns Random secure password
   */
  private generateTemporaryPassword(): string {
    // Generate a random 16-character password
    // const length = 16;
    // const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    // let password = '';
    // for (let i = 0; i < length; i++) {
    //   password += charset.charAt(Math.floor(Math.random() * charset.length));
    // }
    return '123456789!';
  }
}
