// login/hooks/UseLogin.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { LoginInput } from "../dto/LoginTypes";
import { validateLogin } from "../core/LoginLogic";
import { AuthSession } from "../models/AuthSession";
import { useAuthRepository } from "../providers/AuthRepositoryProvider";

export function useLogin() {
  const authRepository = useAuthRepository();

  const mutation = useMutation<AuthSession, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      // Validate input với Zod
      const validation = validateLogin(input);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      // Sử dụng Repository từ Provider
      return await authRepository.login(validation.data);
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
