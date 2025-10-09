// login/repositories/IAuthRepository.ts
import { LoginInput } from '../dto/LoginTypes';
import { AuthSession } from '../models/AuthSession';

/**
 * Interface cho Auth Repository
 * Định nghĩa contract cho các nguồn dữ liệu authentication
 */
export interface IAuthRepository {
  /**
   * Login user và trả về session
   */
  login(input: LoginInput): Promise<AuthSession>;

  /**
   * Logout user
   */
  logout(): Promise<void>;

  /**
   * Lấy session hiện tại (nếu có)
   */
  getCurrentSession(): AuthSession | null;

  /**
   * Refresh token
   */
  refreshToken?(token: string): Promise<AuthSession>;
}
