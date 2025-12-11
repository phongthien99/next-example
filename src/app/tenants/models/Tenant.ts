/**
 * Domain Model: Tenant
 * Core business entity representing a tenant in the system
 */
export interface Tenant {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
