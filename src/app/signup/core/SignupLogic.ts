import {
  SignupInput,
  SignupInputSchema,
  SignupValidationError,
} from "../dto/SignupTypes";

/**
 * SignupLogic - Pure Domain Logic
 *
 * Contains pure functions for signup business logic.
 * Framework-independent, can be tested in isolation.
 */

/**
 * Validates signup input data using Zod schema
 *
 * @param data - Unknown input data to validate
 * @returns Validated SignupInput object
 * @throws SignupValidationError if validation fails
 */
export function validate(data: unknown): SignupInput {
  try {
    return SignupInputSchema.parse(data);
  } catch (error) {
    // Extract first validation error from Zod
    if (error && typeof error === "object" && "errors" in error) {
      const firstError = (
        error as { errors: Array<{ path: string[]; message: string }> }
      ).errors?.[0];
      if (firstError) {
        throw new SignupValidationError(
          firstError.path.join("."),
          firstError.message,
        );
      }
    }
    throw new SignupValidationError("unknown", "Validation failed");
  }
}
