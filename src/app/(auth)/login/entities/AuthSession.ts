// login/models/AuthSession.ts
import { User } from "./User";

export class AuthSession {
  constructor(
    public token: string,
    public user: User,
    public expiresAt?: Date,
    public refreshToken?: string,
  ) {}

  static fromResponse(data: {
    token: string;
    user?: { id: string; email: string; name?: string };
    expiresAt?: string | Date;
    refreshToken?: string;
  }): AuthSession {
    return new AuthSession(
      data.token,
      User.fromResponse(data),
      data.expiresAt ? new Date(data.expiresAt) : undefined,
      data.refreshToken,
    );
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  save(): void {
    localStorage.setItem("token", this.token);
    localStorage.setItem("userId", this.user.id);
    if (this.refreshToken) {
      localStorage.setItem("refreshToken", this.refreshToken);
    }
  }

  static load(): AuthSession | null {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return null;

    // Tạo session tạm từ localStorage
    return new AuthSession(
      token,
      new User(userId, "", undefined, undefined),
      undefined,
      localStorage.getItem("refreshToken") || undefined,
    );
  }

  static clear(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
  }
}
