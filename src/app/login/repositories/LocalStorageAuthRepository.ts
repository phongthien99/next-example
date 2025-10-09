// login/repositories/LocalStorageAuthRepository.ts
import { IAuthRepository } from './IAuthRepository';
import { LoginInput } from '../dto/LoginTypes';
import { AuthSession } from '../models/AuthSession';
import { User } from '../models/User';

/**
 * Repository implementation sử dụng LocalStorage
 * Hữu ích cho:
 * - Testing/Development
 * - Offline mode
 * - Mock data
 */
export class LocalStorageAuthRepository implements IAuthRepository {
  private readonly USERS_KEY = 'mock_users';
  private readonly SESSION_KEY = 'auth_session';

  constructor() {
    this.initMockUsers();
  }

  /**
   * Khởi tạo mock users cho testing
   */
  private initMockUsers(): void {
    if (typeof window === 'undefined') return;

    const existingUsers = localStorage.getItem(this.USERS_KEY);
    if (!existingUsers) {
      const mockUsers = [
        { email: 'admin@example.com', password: '123456', name: 'Admin User', userId: 'user_1' },
        { email: 'test@example.com', password: 'password', name: 'Test User', userId: 'user_2' },
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(mockUsers));
    }
  }

  async login(input: LoginInput): Promise<AuthSession> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (typeof window === 'undefined') {
      throw new Error('LocalStorage not available');
    }

    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === input.email && u.password === input.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const authUser = new User(user.userId, user.email, user.name);
    const session = new AuthSession(
      `mock_token_${Date.now()}`,
      authUser,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      `mock_refresh_${Date.now()}`
    );

    session.save();
    return session;
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    AuthSession.clear();
  }

  getCurrentSession(): AuthSession | null {
    return AuthSession.load();
  }

  async refreshToken(token: string): Promise<AuthSession> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      throw new Error('No session found');
    }

    // Create new session with extended expiry
    const newSession = new AuthSession(
      `mock_token_${Date.now()}`,
      currentSession.user,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      `mock_refresh_${Date.now()}`
    );

    newSession.save();
    return newSession;
  }
}
