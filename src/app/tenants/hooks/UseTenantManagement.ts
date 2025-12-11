'use client';

/**
 * Application Layer: Tenant Management Hook
 * Encapsulates business logic for tenant operations
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTenantRepository } from '../providers/TenantRepositoryProvider';
import { Tenant } from '../models/Tenant';
import { TenantInput } from '../dto/TenantTypes';

interface UseTenantManagementResult {
  tenants: Tenant[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createTenant: (input: TenantInput) => Promise<void>;
  updateTenant: (id: string, input: TenantInput) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
}

/**
 * Hook for managing tenant data operations
 * Provides read operations and state management for US1
 */
export function useTenantManagement(): UseTenantManagementResult {
  const repository = useTenantRepository();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.getTenants();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tenants'));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = useCallback(
    async (input: TenantInput) => {
      try {
        await repository.createTenant(input);
        toast.success('Tenant created successfully');
        await fetchTenants(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create tenant';
        toast.error(errorMessage);
        throw err; // Re-throw so form can handle it
      }
    },
    [repository, fetchTenants]
  );

  const updateTenant = useCallback(
    async (id: string, input: TenantInput) => {
      try {
        await repository.updateTenant(id, input);
        toast.success('Tenant updated successfully');
        await fetchTenants(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update tenant';
        toast.error(errorMessage);
        throw err; // Re-throw so form can handle it
      }
    },
    [repository, fetchTenants]
  );

  const deleteTenant = useCallback(
    async (id: string) => {
      try {
        await repository.deleteTenant(id);
        toast.success('Tenant deleted successfully');
        await fetchTenants(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete tenant';
        toast.error(errorMessage);
        throw err; // Re-throw so dialog can handle it
      }
    },
    [repository, fetchTenants]
  );

  return {
    tenants,
    isLoading,
    error,
    refetch: fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
  };
}
