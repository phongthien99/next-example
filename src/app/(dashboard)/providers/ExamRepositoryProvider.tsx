'use client';

/**
 * Exam Repository Provider
 * Provides dependency injection for IExamRepository throughout the component tree
 */
import React, { createContext, useContext, useMemo } from 'react';
import { IExamRepository } from '../repositories/IExamRepository';
import { ExamRepositoryRegistry, RepositoryType } from '../repositories/ExamRepositoryRegistry';

/**
 * Context for exam repository instance
 */
const ExamRepositoryContext = createContext<IExamRepository | null>(null);

interface ExamRepositoryProviderProps {
  children: React.ReactNode;
  repositoryType?: RepositoryType;
}

/**
 * Provider component that injects repository instance into React context
 */
export function ExamRepositoryProvider({
  children,
  repositoryType = 'yaml',
}: ExamRepositoryProviderProps) {
  const repository = useMemo(
    () => ExamRepositoryRegistry.getRepository(repositoryType),
    [repositoryType]
  );

  return (
    <ExamRepositoryContext.Provider value={repository}>
      {children}
    </ExamRepositoryContext.Provider>
  );
}

/**
 * Hook to access exam repository from context
 * @throws Error if used outside of ExamRepositoryProvider
 */
export function useExamRepository(): IExamRepository {
  const context = useContext(ExamRepositoryContext);

  if (!context) {
    throw new Error(
      'useExamRepository must be used within ExamRepositoryProvider'
    );
  }

  return context;
}
