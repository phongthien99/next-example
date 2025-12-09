// login/usecases/LoginLogic.ts
import { LoginInputSchema, LoginInput } from "../dto/LoginTypes";
import { ZodError } from "zod";

/**
 * Login Validation Logic
 *
 * Pure function for validating login input
 * Used ONLY by UI components (Presentation layer)
 *
 * Architecture notes:
 * - This is a HELPER function for UI layer
 * - NOT used by hooks or lower layers
 * - Component validates → Hook executes
 *
 * @param input - Raw user input from form
 * @returns Validation result with data or error
 *
 * @example
 * ```tsx
 * // In component (UI layer)
 * const validation = validateLogin({ email, password });
 * if (!validation.success) {
 *   showError(validation.error);
 *   return;
 * }
 * // Pass validated data to hook
 * login(validation.data);
 * ```
 */
export function validateLogin(
  input: unknown,
): { success: true; data: LoginInput } | { success: false; error: string } {
  try {
    const validatedData = LoginInputSchema.parse(input);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      // Lấy error message đầu tiên
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
}
