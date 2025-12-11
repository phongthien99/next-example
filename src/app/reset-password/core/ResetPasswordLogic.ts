import { z } from "zod";
import {
  ResetPasswordInput,
  ResetPasswordInputSchema,
  ResetPasswordRequest,
  ValidationError,
} from "../dto/ResetPasswordTypes";

/**
 * Validates password reset input
 * Pure function - no side effects
 * @param input - User input from form
 * @returns Validation result with errors object
 */
export function validateResetPasswordInput(input: ResetPasswordInput): {
  isValid: boolean;
  errors: ValidationError;
} {
  try {
    ResetPasswordInputSchema.parse(input);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          const fieldName = err.path[0] as string;
          errors[fieldName as keyof ValidationError] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { form: "Validation failed" } };
  }
}

/**
 * Validates token format (basic client-side check)
 * @param token - Reset token from URL
 * @returns true if token exists and is non-empty
 */
export function validateToken(token: string | null): boolean {
  return token !== null && token.trim().length > 0;
}

/**
 * Transforms form input to API request payload
 * Only sends password (not confirmPassword) to API
 * @param input - Validated form input
 * @param token - Reset token from URL
 * @returns API request payload
 */
export function toResetPasswordRequest(
  input: ResetPasswordInput,
  token: string,
): ResetPasswordRequest {
  return {
    token,
    newPassword: input.password,
  };
}
