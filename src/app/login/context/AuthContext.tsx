"use client";

/**
 * Auth Context
 *
 * Shared context layer between providers and hooks
 * This is a pure context definition without implementation
 *
 * Architecture:
 * - providers/ will provide the context value
 * - hooks/ will consume the context value
 * - Both depend on this shared contract
 */

import { createContext } from "react";
import type { IAuthRepository } from "../interfaces/IAuthRepository";

/**
 * Auth Context
 * Provides IAuthRepository instance to the component tree
 */
export const AuthContext = createContext<IAuthRepository | null>(null);

/**
 * Context value type
 */
export type AuthContextValue = IAuthRepository | null;
