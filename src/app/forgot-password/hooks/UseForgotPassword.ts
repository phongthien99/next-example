"use client";

import { useState } from "react";
import {
  ForgotPasswordSession,
  initialForgotPasswordSession,
} from "../models/ForgotPasswordSession";
import {
  ForgotPasswordInput,
  ForgotPasswordAPIError,
} from "../dto/ForgotPasswordTypes";
import { validate } from "../core/ForgotPasswordLogic";
import { useForgotPasswordRepository } from "../providers/ForgotPasswordRepositoryProvider";

/**
 * UseForgotPassword Hook - Application Layer (Use Case)
 *
 * Orchestrates forgot password business flow:
 * - Manages form state
 * - Validates input
 * - Calls repository for API integration
 * - Handles errors and success states
 */
export function useForgotPassword() {
  const repository = useForgotPasswordRepository();
  const [session, setSession] = useState<ForgotPasswordSession>(
    initialForgotPasswordSession,
  );

  const requestReset = async (email: string) => {
    // Clear previous errors
    setSession((prev) => ({
      ...prev,
      fieldError: undefined,
      apiError: undefined,
      isLoading: true,
    }));

    try {
      // Validate input
      const validatedInput: ForgotPasswordInput = validate({ email });

      // Call repository
      const response = await repository.requestPasswordReset(validatedInput);

      // Update state with success
      setSession({
        email: validatedInput.email,
        isLoading: false,
        isSuccess: true,
        submittedAt: new Date(),
        lastAttemptEmail: validatedInput.email,
      });

      return response;
    } catch (error: any) {
      // Handle validation errors
      if (error.name === "ForgotPasswordValidationError") {
        setSession((prev) => ({
          ...prev,
          fieldError: error.message,
          isLoading: false,
        }));
        throw error;
      }

      // Handle API errors
      if (error instanceof ForgotPasswordAPIError) {
        setSession((prev) => ({
          ...prev,
          apiError: error.message,
          isLoading: false,
        }));
        throw error;
      }

      // Unknown errors
      const errorMessage = "An unexpected error occurred. Please try again.";
      setSession((prev) => ({
        ...prev,
        apiError: errorMessage,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  };

  const updateEmail = (email: string) => {
    setSession((prev) => ({
      ...prev,
      email,
      fieldError: undefined, // Clear errors on change
    }));
  };

  const validateEmail = (): boolean => {
    try {
      validate({ email: session.email });
      setSession((prev) => ({ ...prev, fieldError: undefined }));
      return false; // No error
    } catch (error: any) {
      if (error.name === "ForgotPasswordValidationError") {
        setSession((prev) => ({ ...prev, fieldError: error.message }));
        return true; // Has error
      }
      return false;
    }
  };

  const reset = () => {
    setSession(initialForgotPasswordSession);
  };

  return {
    session,
    requestReset,
    updateEmail,
    validateEmail,
    reset,
  };
}
