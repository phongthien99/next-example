"use client";

/**
 * Auth Provider - No DI Framework
 *
 * Clean React Context pattern để provide AuthRepository
 */

import { useMemo, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import type { IAuthRepository } from "../interfaces/IAuthRepository";
import { ApiAuthRepository } from "../repositories/ApiAuthRepository";
import { LocalStorageAuthRepository } from "../repositories/LocalStorageAuthRepository";

/**
 * Repository type selection
 */
type AuthRepositoryType = "api" | "localStorage";

interface AuthProviderProps {
  children: ReactNode;
  type?: AuthRepositoryType;
  repository?: IAuthRepository;
}

/**
 * Auth Provider - Simple pattern
 *
 * Usage:
 * ```tsx
 * <AuthProvider type="localStorage">
 *   <LoginForm />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({
  children,
  type,
  repository,
}: AuthProviderProps) {
  const repositoryInstance = useMemo<IAuthRepository>(() => {
    // 1. Use custom repository if provided
    if (repository) {
      return repository;
    }

    // 2. Determine repository type
    const repoType = type || getDefaultRepositoryType();

    // 3. Create repository instance
    switch (repoType) {
      case "localStorage":
        return new LocalStorageAuthRepository();

      case "api":
      default:
        return new ApiAuthRepository();
    }
  }, [type, repository]);

  return (
    <AuthContext.Provider value={repositoryInstance}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Get default repository type from environment
 */
function getDefaultRepositoryType(): AuthRepositoryType {
  // Check environment variable
  const envType = process.env.NEXT_PUBLIC_AUTH_REPO_TYPE;
  if (envType === "api" || envType === "localStorage") {
    return envType;
  }

  // Check localStorage (runtime switching)
  if (typeof window !== "undefined") {
    const storedType = localStorage.getItem("auth_repository_type");
    if (storedType === "api" || storedType === "localStorage") {
      return storedType as AuthRepositoryType;
    }
  }

  // Default: API in production, localStorage in development
  return process.env.NODE_ENV === "production" ? "api" : "localStorage";
}
