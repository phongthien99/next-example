"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ISignupRepository } from "../repositories/ISignupRepository";
import { SignupRepositoryRegistry } from "../repositories/SignupRepositoryRegistry";

/**
 * SignupRepositoryContext
 *
 * React Context for injecting repository implementation.
 * Implements Dependency Injection pattern.
 */
const SignupRepositoryContext = createContext<ISignupRepository | null>(null);

/**
 * SignupRepositoryProvider Props
 */
interface SignupRepositoryProviderProps {
  children: ReactNode;
  type?: "api" | "localStorage";
}

/**
 * SignupRepositoryProvider Component
 *
 * Provides repository implementation to child components via React Context.
 * This enables Dependency Injection - components consume ISignupRepository
 * interface without knowing the concrete implementation.
 *
 * @param children - Child components
 * @param type - Repository type ('api' or 'localStorage')
 */
export function SignupRepositoryProvider({
  children,
  type = "api",
}: SignupRepositoryProviderProps) {
  const repository = SignupRepositoryRegistry.getRepository(type);

  return (
    <SignupRepositoryContext.Provider value={repository}>
      {children}
    </SignupRepositoryContext.Provider>
  );
}

/**
 * useSignupRepository Hook
 *
 * Custom hook to consume SignupRepository from context.
 *
 * @returns ISignupRepository instance
 * @throws Error if used outside SignupRepositoryProvider
 */
export function useSignupRepository(): ISignupRepository {
  const context = useContext(SignupRepositoryContext);
  if (!context) {
    throw new Error(
      "useSignupRepository must be used within SignupRepositoryProvider",
    );
  }
  return context;
}
