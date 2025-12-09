"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { IAuthRepository } from "../interfaces/IAuthRepository";

/**
 * Hook to access Auth Repository from Context
 *
 * This hook must be used within AuthProvider
 *
 * @returns IAuthRepository instance
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const authRepo = useAuthRepository();
 *   await authRepo.login(credentials);
 * }
 * ```
 */
export function useAuthRepository(): IAuthRepository {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthRepository must be used within AuthProvider");
  }

  return context;
}
