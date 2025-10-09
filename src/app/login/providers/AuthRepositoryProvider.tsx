'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { IAuthRepository } from '../repositories/IAuthRepository';
import { ApiAuthRepository } from '../repositories/ApiAuthRepository';
import { LocalStorageAuthRepository } from '../repositories/LocalStorageAuthRepository';
import { AuthRepositoryType } from '../repositories/AuthRepositoryRegistry';

/**
 * Context để provide AuthRepository instance
 */
const AuthRepositoryContext = createContext<IAuthRepository | null>(null);

/**
 * Props cho AuthRepositoryProvider
 */
interface AuthRepositoryProviderProps {
  children: ReactNode;
  /**
   * Repository type - nếu không set sẽ auto-detect từ env
   */
  type?: AuthRepositoryType;
  /**
   * Custom repository instance (override type)
   */
  repository?: IAuthRepository;
}

/**
 * Provider component để inject AuthRepository vào app
 */
export function AuthRepositoryProvider({
  children,
  type,
  repository,
}: AuthRepositoryProviderProps) {
  const repositoryInstance = useMemo(() => {
    // Nếu có custom repository, dùng nó
    if (repository) {
      return repository;
    }

    // Xác định type từ props hoặc env
    const repoType = type || getDefaultRepositoryType();

    // Tạo repository instance dựa trên type
    switch (repoType) {
      case AuthRepositoryType.LOCAL_STORAGE:
      case AuthRepositoryType.MOCK:
        return new LocalStorageAuthRepository();
      case AuthRepositoryType.API:
      default:
        return new ApiAuthRepository();
    }
  }, [type, repository]);

  return (
    <AuthRepositoryContext.Provider value={repositoryInstance}>
      {children}
    </AuthRepositoryContext.Provider>
  );
}

/**
 * Hook để sử dụng AuthRepository từ context
 */
export function useAuthRepository(): IAuthRepository {
  const context = useContext(AuthRepositoryContext);

  if (!context) {
    throw new Error(
      'useAuthRepository must be used within AuthRepositoryProvider. ' +
      'Wrap your app with <AuthRepositoryProvider>.'
    );
  }

  return context;
}

/**
 * Helper function để xác định repository type mặc định
 */
function getDefaultRepositoryType(): AuthRepositoryType {
  // 1. Check environment variable
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_MODE) {
    return process.env.NEXT_PUBLIC_AUTH_MODE as AuthRepositoryType;
  }

  // 2. Check localStorage (cho runtime switching)
  if (typeof window !== 'undefined') {
    const storedType = localStorage.getItem('auth_repository_type') as AuthRepositoryType;
    if (storedType && Object.values(AuthRepositoryType).includes(storedType)) {
      return storedType;
    }
  }

  // 3. Default to API for production
  return AuthRepositoryType.API;
}
