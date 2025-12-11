/**
 * Public API for Tenants Module
 * Barrel export file providing clean external interface
 */

// Components
export { TenantTable } from './components/TenantTable';

// Hooks
export { useTenantManagement } from './hooks/UseTenantManagement';

// Types
export type { Tenant } from './models/Tenant';
export type { TenantInput } from './dto/TenantTypes';
