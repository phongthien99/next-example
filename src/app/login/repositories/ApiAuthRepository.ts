// login/repositories/ApiAuthRepository.ts
import { IAuthRepository } from "../interfaces/IAuthRepository";
import { LoginInput, LoginResponse } from "../dto/LoginTypes";
import { AuthSession } from "../entities/AuthSession";

/**
 * Repository implementation sử dụng API
 * Simple pattern - no DI framework
 */
export class ApiAuthRepository implements IAuthRepository {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/auth") {
    this.baseUrl = baseUrl;
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Invalid credentials" }));
      throw new Error(error.message || "Invalid credentials");
    }

    const data: LoginResponse = await res.json();
    const session = AuthSession.fromResponse(data);

    // Save to localStorage for persistence
    session.save();

    return session;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthSession.load()?.token}`,
        },
      });
    } finally {
      // Clear localStorage regardless of API response
      AuthSession.clear();
    }
  }

  getCurrentSession(): AuthSession | null {
    return AuthSession.load();
  }

  async refreshToken(token: string): Promise<AuthSession> {
    const res = await fetch(`${this.baseUrl}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token");
    }

    const data: LoginResponse = await res.json();
    const session = AuthSession.fromResponse(data);
    session.save();

    return session;
  }
}
