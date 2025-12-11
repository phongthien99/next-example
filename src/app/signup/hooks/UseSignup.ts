'use client';

import { useState } from 'react';
import { useSignupRepository } from '../providers/SignupRepositoryProvider';
import { SignupInput, DuplicateEmailError, SignupAPIError } from '../dto/SignupTypes';
import { SignupSession } from '../models/SignupSession';
import { validate } from '../core/SignupLogic';

/**
 * UseSignup Hook
 *
 * Application layer hook that orchestrates the signup flow.
 * Depends on ISignupRepository interface (Dependency Inversion).
 *
 * Responsibilities:
 * - Manage signup session state
 * - Validate input with domain logic
 * - Check for duplicate emails
 * - Call repository to create user
 * - Handle errors and update state
 */
export function useSignup() {
  const repository = useSignupRepository();

  const [session, setSession] = useState<SignupSession>({
    inProgress: false,
    user: undefined,
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
  });

  /**
   * Signup function
   *
   * @param input - Signup input data (name, email)
   */
  const signup = async (input: SignupInput) => {
    try {
      // Start signup process
      setSession({
        inProgress: true,
        user: undefined,
        error: undefined,
        startedAt: new Date(),
        completedAt: undefined,
      });

      // 1. Validate input with domain logic
      const validatedInput = validate(input);

      // 2. Check if email already exists
      const emailExists = await repository.checkEmailExists(validatedInput.email);
      if (emailExists) {
        throw new DuplicateEmailError(validatedInput.email);
      }

      // 3. Create user via repository
      const user = await repository.signup(validatedInput);

      // 4. Success - update state
      setSession({
        inProgress: false,
        user,
        error: undefined,
        startedAt: session.startedAt,
        completedAt: new Date(),
      });

    } catch (error) {
      // Handle errors
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof DuplicateEmailError) {
        errorMessage = 'This email is already registered. Please log in or use a different email.';
      } else if (error instanceof SignupAPIError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSession({
        inProgress: false,
        user: undefined,
        error: errorMessage,
        startedAt: session.startedAt,
        completedAt: new Date(),
      });
    }
  };

  return {
    signup,
    session,
    isLoading: session.inProgress,
    error: session.error,
    user: session.user,
  };
}
