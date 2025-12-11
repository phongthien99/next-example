import { z } from 'zod';

// Form input schema
export const ResetPasswordInputSchema = z.object({
  password: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters"),
  confirmPassword: z.string()
    .min(4, "Confirmation password must be at least 4 characters")
    .max(128, "Confirmation password must not exceed 128 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// API request schema
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters")
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// API response schema
export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

// Error codes enum
export enum ResetPasswordErrorCode {
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_MISSING = "TOKEN_MISSING",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR"
}

// Custom error class
export class ResetPasswordError extends Error {
  constructor(
    public code: ResetPasswordErrorCode,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ResetPasswordError";
  }
}

// Validation error interface for form state
export interface ValidationError {
  password?: string;
  confirmPassword?: string;
  form?: string;
}
