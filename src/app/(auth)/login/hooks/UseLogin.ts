// login/hooks/UseLogin.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { LoginInput } from "../dto/LoginTypes";
import { AuthSession } from "../entities/AuthSession";
import { useAuthRepository } from "./useAuthRepository";

/**
 * Login Hook - Simple Context Pattern
 *
 * No validation here - validation is responsibility of UI layer (component)
 * Hook only handles data fetching and state management
 */
export function useLogin() {
  const authRepository = useAuthRepository();

  const mutation = useMutation<AuthSession, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      // Hook chỉ gọi repository - KHÔNG validate
      // Validation là trách nhiệm của component (UI layer)
      return await authRepository.login(input);
    },
  });

  return mutation;
}

/**
 * Hook để logout
 */
export function useLogout() {
  const authRepository = useAuthRepository();

  const mutation = useMutation<void, Error>({
    mutationFn: async () => {
      await authRepository.logout();
    },
  });

  return mutation;
}

/**
 * Hook để lấy current session
 */
export function useCurrentSession() {
  const authRepository = useAuthRepository();
  return authRepository.getCurrentSession();
}
