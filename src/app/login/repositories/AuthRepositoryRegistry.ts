// login/repositories/AuthRepositoryRegistry.ts
import { IAuthRepository } from "./IAuthRepository";
import { ApiAuthRepository } from "./ApiAuthRepository";
import { LocalStorageAuthRepository } from "./LocalStorageAuthRepository";

/**
 * Repository types
 */
export enum AuthRepositoryType {
  API = "api",
  LOCAL_STORAGE = "localStorage",
  MOCK = "mock",
}

/**
 * Registry Pattern cho Auth Repository
 * Quản lý và cung cấp repository instance dựa trên config
 */
export class AuthRepositoryRegistry {
  private static instance: AuthRepositoryRegistry;
  private repositories: Map<AuthRepositoryType, IAuthRepository>;
  private activeType: AuthRepositoryType;

  private constructor() {
    this.repositories = new Map();
    this.activeType = this.getDefaultType();
    this.registerDefaults();
  }

  /**
   * Singleton instance
   */
  static getInstance(): AuthRepositoryRegistry {
    if (!AuthRepositoryRegistry.instance) {
      AuthRepositoryRegistry.instance = new AuthRepositoryRegistry();
    }
    return AuthRepositoryRegistry.instance;
  }

  /**
   * Xác định repository type mặc định
   */
  private getDefaultType(): AuthRepositoryType {
    // Check environment variable
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AUTH_MODE) {
      return process.env.NEXT_PUBLIC_AUTH_MODE as AuthRepositoryType;
    }

    // Check localStorage config (cho development)
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem(
        "auth_repository_type",
      ) as AuthRepositoryType;
      if (
        storedType &&
        Object.values(AuthRepositoryType).includes(storedType)
      ) {
        return storedType;
      }
    }

    // Default to API
    return AuthRepositoryType.LOCAL_STORAGE;
  }

  /**
   * Đăng ký các repository mặc định
   */
  private registerDefaults(): void {
    this.register(AuthRepositoryType.API, new ApiAuthRepository());
    this.register(
      AuthRepositoryType.LOCAL_STORAGE,
      new LocalStorageAuthRepository(),
    );
    this.register(AuthRepositoryType.MOCK, new LocalStorageAuthRepository()); // Alias
  }

  /**
   * Đăng ký một repository mới
   */
  register(type: AuthRepositoryType, repository: IAuthRepository): void {
    this.repositories.set(type, repository);
  }

  /**
   * Lấy repository đang active
   */
  getRepository(): IAuthRepository {
    const repository = this.repositories.get(this.activeType);
    if (!repository) {
      throw new Error(`Repository type "${this.activeType}" not registered`);
    }
    return repository;
  }

  /**
   * Lấy repository theo type cụ thể
   */
  getRepositoryByType(type: AuthRepositoryType): IAuthRepository {
    const repository = this.repositories.get(type);
    if (!repository) {
      throw new Error(`Repository type "${type}" not registered`);
    }
    return repository;
  }

  /**
   * Switch sang repository type khác
   */
  setActiveType(type: AuthRepositoryType): void {
    if (!this.repositories.has(type)) {
      throw new Error(`Repository type "${type}" not registered`);
    }
    this.activeType = type;

    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_repository_type", type);
    }
  }

  /**
   * Get current active type
   */
  getActiveType(): AuthRepositoryType {
    return this.activeType;
  }

  /**
   * Get all registered types
   */
  getRegisteredTypes(): AuthRepositoryType[] {
    return Array.from(this.repositories.keys());
  }
}

/**
 * Helper function để lấy repository nhanh
 */
export const getAuthRepository = (): IAuthRepository => {
  return AuthRepositoryRegistry.getInstance().getRepository();
};
