"use client";

/**
 * Auth Provider - Registry Pattern
 *
 * Provides AuthRepository instance to component tree via React Context.
 * Uses AuthRepositoryRegistry for repository selection.
 *
 * Migration from previous version:
 * - Now uses AuthRepositoryRegistry.getRepository()
 * - Supports 'supabase' type
 * - Maintains backward compatibility
 *
 * Usage:
 * ```tsx
 * // Automatic (uses environment/defaults)
 * <AuthProvider>
 *   <LoginForm />
 * </AuthProvider>
 *
 * // Explicit type selection
 * <AuthProvider type="supabase">
 *   <LoginForm />
 * </AuthProvider>
 *
 * // Custom repository (testing)
 * <AuthProvider repository={mockRepository}>
 *   <LoginForm />
 * </AuthProvider>
 * ```
 */

import { useMemo, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import type { IAuthRepository } from "../interfaces/IAuthRepository";
import { AuthRepositoryRegistry, type AuthRepositoryType } from "../repositories/AuthRepositoryRegistry";

/**
 * AuthProvider Props
 *
 * @property children - Child components
 * @property type - Repository type to use ('api' | 'localStorage' | 'supabase')
 * @property repository - Custom repository instance (overrides type)
 */
interface AuthProviderProps {
  children: ReactNode;
  type?: AuthRepositoryType;
  repository?: IAuthRepository;
}

/**
 * Auth Provider - Registry Pattern
 *
 * Provides AuthRepository instance to component tree via React Context.
 * Uses AuthRepositoryRegistry for repository selection.
 */
export function AuthProvider({
  children,
  type,
  repository,
}: AuthProviderProps) {
  const repositoryInstance = useMemo<IAuthRepository>(() => {
    // 1. Use custom repository if provided (testing/override)
    if (repository) {
      return repository;
    }

    // 2. Use registry to get repository by type
    return AuthRepositoryRegistry.getRepository(type);
  }, [type, repository]);

  return (
    <AuthContext.Provider value={repositoryInstance}>
      {children}
    </AuthContext.Provider>
  );
}
