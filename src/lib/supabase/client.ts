import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase client configuration
 *
 * This creates a singleton Supabase client for use across the application.
 * Uses environment variables for configuration.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 *
 * @throws Error if environment variables are not set
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
    'Please add it to your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Please add it to your .env.local file.'
  );
}

/**
 * Supabase client instance
 * Singleton pattern - created once and reused
 */
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Store session in localStorage (default)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Auto-refresh tokens before expiry
      autoRefreshToken: true,
      // Persist session across page reloads
      persistSession: true,
      // Detect when session expires
      detectSessionInUrl: true,
    },
  }
);

/**
 * Get Supabase client instance
 * Useful for dependency injection or testing
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  return supabase;
}
