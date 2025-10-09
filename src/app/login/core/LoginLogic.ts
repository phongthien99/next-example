// login/core/LoginLogic.ts
import { LoginInputSchema } from "../dto/LoginTypes";
import { ZodError } from "zod";

export function validateLogin(
  input: unknown,
): { success: true; data: any } | { success: false; error: string } {
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
