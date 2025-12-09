// login/dto/LoginTypes.ts
import { z } from "zod";

// Zod schema cho validation
export const LoginInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type inference từ schema
export type LoginInput = z.infer<typeof LoginInputSchema>;

export interface LoginResponse {
  token: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
