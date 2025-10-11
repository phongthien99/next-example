"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResetPasswordRepository } from "../providers/ResetPasswordRepositoryProvider";
import {
  ResetPasswordInput,
  ResetPasswordError,
  ResetPasswordErrorCode,
  ValidationError,
} from "../dto/ResetPasswordTypes";
import {
  validateResetPasswordInput,
  toResetPasswordRequest,
  validateToken,
} from "../core/ResetPasswordLogic";

/**
 * Custom hook for password reset functionality
 * Orchestrates validation, API calls, and navigation
 * @param token - Reset token from URL
 * @returns Password reset state and actions
 */
export function useResetPassword(token: string | null) {
  const router = useRouter();
  const repository = useResetPasswordRepository();
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  /**
   * Validates input in real-time without submitting
   * Used for instant feedback on blur or input change
   */
  const validateInput = (input: ResetPasswordInput) => {
    const validation = validateResetPasswordInput(input);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const mutation = useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      // Client-side validation
      const validation = validateResetPasswordInput(input);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error("Validation failed");
      }

      // Token validation
      if (!validateToken(token)) {
        throw new ResetPasswordError(
          ResetPasswordErrorCode.TOKEN_MISSING,
          "Reset token is missing or invalid",
          0,
        );
      }

      // Clear validation errors
      setValidationErrors({});

      // Transform and submit to API
      const request = toResetPasswordRequest(input, token!);
      return repository.resetPassword(request);
    },
    onSuccess: (response) => {
      // Success: redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error) => {
      // Error handling is managed by the component
      // Error state is available via mutation.error
    },
  });

  return {
    submitReset: mutation.mutate,
    validateInput,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    validationErrors,
    clearValidationErrors: () => setValidationErrors({}),
  };
}
