// login/repositories/LocalStorageAuthRepository.ts
import { IAuthRepository } from "../interfaces/IAuthRepository";
import { LoginInput } from "../dto/LoginTypes";
import { AuthSession } from "../entities/AuthSession";
import { User } from "../entities/User";

/**
 * Repository implementation sử dụng LocalStorage
 * Simple pattern - no DI framework
 *
 * Hữu ích cho:
 * - Testing/Development
 * - Offline mode
 * - Lưu thông tin user nhập vào
 */
export class LocalStorageAuthRepository implements IAuthRepository {
  private readonly SESSION_KEY = "auth_session";

  async login(input: LoginInput): Promise<AuthSession> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (typeof window === "undefined") {
      throw new Error("LocalStorage not available");
    }

    // Tạo user từ email và password mà user nhập vào
    const userId = `user_${Date.now()}`;
    const authUser = new User(userId, input.email, input.email.split("@")[0]);

    // Create session
    const session = new AuthSession(
      `token_${Date.now()}`,
      authUser,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      `refresh_${Date.now()}`,
    );

    session.save();
    return session;
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    AuthSession.clear();
  }

  getCurrentSession(): AuthSession | null {
    return AuthSession.load();
  }

  async refreshToken(_token: string): Promise<AuthSession> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      throw new Error("No session found");
    }

    // Create new session with extended expiry
    const newSession = new AuthSession(
      `mock_token_${Date.now()}`,
      currentSession.user,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      `mock_refresh_${Date.now()}`,
    );

    newSession.save();
    return newSession;
  }
}
