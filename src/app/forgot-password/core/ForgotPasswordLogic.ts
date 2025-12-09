import { ZodError } from "zod";
import {
  ForgotPasswordInput,
  ForgotPasswordInputSchema,
  ForgotPasswordValidationError,
} from "../dto/ForgotPasswordTypes";

/**
 * ForgotPasswordLogic - Pure Domain Logic
 *
 * Contains pure functions for forgot password business logic.
 * Framework-independent, can be tested in isolation.
 */

/**
 * Validates forgot password input data using Zod schema
 *
 * @param data - Unknown input data to validate
 * @returns Validated ForgotPasswordInput object
 * @throws ForgotPasswordValidationError if validation fails
 */
export function validate(data: unknown): ForgotPasswordInput {
  try {
    return ForgotPasswordInputSchema.parse(data);
  } catch (error) {
    // Extract first validation error from Zod

    if (error instanceof ZodError) {
      // Lấy error message đầu tiên
      const firstError = error.issues[0];
      throw new ForgotPasswordValidationError(
        firstError.path.join("."),
        firstError.message,
      );
    }
    throw new ForgotPasswordValidationError("unknown", "Validation failed");
  }
}
