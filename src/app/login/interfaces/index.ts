/**
 * Login Feature Interfaces
 *
 * Central export point for all interfaces
 * Organized by responsibility following Interface Segregation Principle
 */

// Main repository interface (composite)
export type { IAuthRepository } from './IAuthRepository';

// Segregated interfaces
export type { IAuthenticator } from './IAuthenticator';
export type { ISessionManager } from './ISessionManager';
export type { ITokenRefresher } from './ITokenRefresher';
export type { ISessionStorage } from './ISessionStorage';
