import { z } from "zod";

/**
 * Zod schema for forgot password input validation
 */
export const ForgotPasswordInputSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

/**
 * Zod schema for API response validation
 */
export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

/**
 * Custom Error: Thrown when input validation fails
 */
export class ForgotPasswordValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ForgotPasswordValidationError";
  }
}

/**
 * Custom Error: Thrown when API request fails
 */
export class ForgotPasswordAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ForgotPasswordAPIError";
  }
}
