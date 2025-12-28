import { IAuthRepository } from '../interfaces/IAuthRepository';
import { LoginInput } from '../dto/LoginTypes';
import { AuthSession } from '../entities/AuthSession';
import { User } from '../entities/User';
import { supabase } from '@/lib/supabase/client';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

/**
 * SupabaseAuthRepository
 *
 * Implementation of IAuthRepository using Supabase Authentication.
 *
 * Features:
 * - Email/password authentication via Supabase Auth
 * - Automatic session management and persistence
 * - Token refresh handling
 * - Session state synchronization with localStorage
 *
 * Architecture Notes:
 * - Maps Supabase types to domain entities (AuthSession, User)
 * - Handles Supabase-specific errors
 * - Maintains compatibility with IAuthRepository interface
 * - Integrates with existing localStorage session pattern
 *
 * @implements IAuthRepository
 */

export class SupabaseAuthRepository implements IAuthRepository {
  /**
   * Login with email and password using Supabase Auth
   *
   * @param input - Login credentials (email, password)
   * @returns AuthSession with user data and tokens
   * @throws Error if authentication fails
   */
  async login(input: LoginInput): Promise<AuthSession> {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      console.log(data)
      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session || !data.user) {
        throw new Error('No session returned from Supabase');
      }

      // Convert Supabase session to AuthSession
      const authSession = this.mapToAuthSession(data.session, data.user);

      // Persist session to localStorage (for compatibility with existing pattern)
      authSession.save();

      return authSession;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login with Supabase');
    }
  }

  /**
   * Logout user and clear session
   *
   * @throws Error if logout fails
   */
  async logout(): Promise<void> {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } finally {
      // Clear localStorage regardless of Supabase response
      // This ensures local state is cleaned up even if Supabase call fails
      AuthSession.clear();
    }
  }

  /**
   * Get current session
   *
   * Retrieves session from Supabase (which uses localStorage internally)
   * Falls back to checking our localStorage pattern for compatibility
   *
   * @returns Current AuthSession or null if not authenticated
   */
  getCurrentSession(): AuthSession | null {
    try {
      // Fallback: Check our localStorage pattern since getSession() is async
      return AuthSession.load();
    } catch {
      return null;
    }
  }

  /**
   * Refresh authentication token
   *
   * @param _token - Refresh token (not used, Supabase manages this internally)
   * @returns New AuthSession with refreshed tokens
   * @throws Error if refresh fails
   */
  async refreshToken(_token: string): Promise<AuthSession> {
    try {
      // Supabase manages refresh tokens internally
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session || !data.user) {
        throw new Error('Failed to refresh session');
      }

      const authSession = this.mapToAuthSession(data.session, data.user);
      authSession.save();

      return authSession;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Map Supabase Session and User to AuthSession domain entity
   *
   * @param session - Supabase session object
   * @param user - Supabase user object
   * @returns AuthSession domain entity
   */
  private mapToAuthSession(session: Session, user: SupabaseUser): AuthSession {
    // Create User entity from Supabase user
    const domainUser = new User(
      user.id,
      user.email || '',
      user.user_metadata?.name || user.email?.split('@')[0],
      user.created_at ? new Date(user.created_at) : undefined
    );

    // Create AuthSession entity
    return new AuthSession(
      session.access_token,
      domainUser,
      session.expires_at ? new Date(session.expires_at * 1000) : undefined,
      session.refresh_token
    );
  }

  /**
   * Map Supabase AuthError to user-friendly error message
   *
   * @param error - Supabase auth error
   * @returns Error with friendly message
   */
  private mapSupabaseError(error: AuthError): Error {
    // Common Supabase auth error codes
    // switch (error.status) {
    //   case 400:
        return new Error(`[code:${error.code}] ${error.message}`);
      // case 401:
      //   return new Error('Invalid credentials');
      // case 422:
      //   return new Error('Email or password is missing');
      // case 429:
      //   return new Error('Too many login attempts. Please try again later.');
      // default:
      //   return new Error(error.message || 'Authentication failed');
    // }
  }
}
