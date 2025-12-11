'use client';

import React, { createContext, useContext } from 'react';
import { IForgotPasswordRepository } from '../repositories/IForgotPasswordRepository';
import { ForgotPasswordRepositoryRegistry } from '../repositories/ForgotPasswordRepositoryRegistry';

const ForgotPasswordRepositoryContext = createContext<IForgotPasswordRepository | null>(null);

interface ForgotPasswordRepositoryProviderProps {
  children: React.ReactNode;
  type?: 'api' | 'localStorage';
}

/**
 * ForgotPasswordRepositoryProvider - Dependency Injection via React Context
 *
 * Provides repository implementation to child components.
 * Enables Dependency Inversion Principle (DIP).
 */
export function ForgotPasswordRepositoryProvider({
  children,
  type = 'api'
}: ForgotPasswordRepositoryProviderProps) {
  const repository = ForgotPasswordRepositoryRegistry.getRepository(type);

  return (
    <ForgotPasswordRepositoryContext.Provider value={repository}>
      {children}
    </ForgotPasswordRepositoryContext.Provider>
  );
}

/**
 * Hook to access the forgot password repository
 *
 * @throws Error if used outside ForgotPasswordRepositoryProvider
 */
export function useForgotPasswordRepository(): IForgotPasswordRepository {
  const repository = useContext(ForgotPasswordRepositoryContext);
  if (!repository) {
    throw new Error(
      'useForgotPasswordRepository must be used within ForgotPasswordRepositoryProvider'
    );
  }
  return repository;
}
