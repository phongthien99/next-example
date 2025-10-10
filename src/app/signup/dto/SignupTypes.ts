import { z } from "zod";

/**
 * Zod schema for signup input validation
 */
export const SignupInputSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  email: z
    .string({ error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type SignupInput = z.infer<typeof SignupInputSchema>;

/**
 * Zod schema for API response validation
 */
export const SignupOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(), // ISO 8601 string from API
  emailVerified: z.boolean().optional().default(false),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type SignupOutput = z.infer<typeof SignupOutputSchema>;

/**
 * Custom Error: Thrown when input validation fails
 */
export class SignupValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "SignupValidationError";
  }
}

/**
 * Custom Error: Thrown when email already exists in system
 */
export class DuplicateEmailError extends Error {
  constructor(public email: string) {
    super(`Email address ${email} is already registered`);
    this.name = "DuplicateEmailError";
  }
}

/**
 * Custom Error: Thrown when API request fails
 */
export class SignupAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "SignupAPIError";
  }
}
