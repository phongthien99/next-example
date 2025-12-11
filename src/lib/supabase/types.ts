/**
 * Supabase Database Types
 *
 * Generated from your Supabase schema using:
 * npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
 *
 * For now, we'll use a minimal type definition.
 * In production, generate this from your actual schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * Supabase Auth User metadata
 */
export interface SupabaseUserMetadata {
  name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}
