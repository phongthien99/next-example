import { ISignupRepository } from './ISignupRepository';
import { SignupInput, DuplicateEmailError, SignupAPIError } from '../dto/SignupTypes';
import { User } from '../models/User';

const STORAGE_KEY = 'signup_users';

/**
 * LocalStorageSignupRepository
 *
 * Repository implementation that uses browser localStorage for user registration.
 * Useful for offline mode or development without API.
 * Implements ISignupRepository interface.
 */
export class LocalStorageSignupRepository implements ISignupRepository {
  /**
   * Register a new user in localStorage
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new SignupAPIError(500, 'localStorage is not available');
      }

      // Get existing users
      const users = this.getUsers();

      // Check for duplicate email (case-insensitive)
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === input.email.toLowerCase()
      );
      if (emailExists) {
        throw new DuplicateEmailError(input.email);
      }

      // Create new user
      const newUser: User = {
        id: this.generateUUID(),
        name: input.name,
        email: input.email.toLowerCase(),
        createdAt: new Date(),
        emailVerified: false,
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

      return newUser;
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        throw error;
      }
      // Handle quota exceeded or other localStorage errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new SignupAPIError(
          507,
          'localStorage quota exceeded. Please clear browser storage.',
          error
        );
      }
      throw new SignupAPIError(
        500,
        'Failed to save user to localStorage',
        error
      );
    }
  }

  /**
   * Check if email exists in localStorage
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const users = this.getUsers();
      return users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  /**
   * Get all users from localStorage
   */
  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Generate a simple UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
