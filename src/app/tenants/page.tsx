'use client';

/**
 * Tenants Page - Main Route Component
 * Provides repository context and renders tenant management UI
 */
import { useState } from 'react';
import { TenantRepositoryProvider } from './providers/TenantRepositoryProvider';
import { TenantTable } from './components/TenantTable';
import { TenantForm } from './components/TenantForm';
import { DeleteTenantDialog } from './components/DeleteTenantDialog';
import { useTenantManagement } from './hooks/UseTenantManagement';
import { Button } from '@/components/ui/button';
import { Tenant } from './models/Tenant';

function TenantManagementContent() {
  const { tenants, isLoading, error, refetch, createTenant, updateTenant, deleteTenant } = useTenantManagement();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditModalOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all tenants in your organization
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add Tenant</Button>
      </div>

      <TenantTable
        tenants={tenants}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TenantForm
        mode="create"
        open={isCreateModalOpen}
        onSubmit={createTenant}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingTenant && (
        <TenantForm
          mode="edit"
          tenant={editingTenant}
          open={isEditModalOpen}
          onSubmit={(input) => updateTenant(editingTenant.id, input)}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTenant(null);
          }}
        />
      )}

      <DeleteTenantDialog
        tenant={deletingTenant}
        open={isDeleteDialogOpen}
        onConfirm={async () => {
          if (deletingTenant) {
            await deleteTenant(deletingTenant.id);
            setIsDeleteDialogOpen(false);
            setDeletingTenant(null);
          }
        }}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingTenant(null);
        }}
      />
    </div>
  );
}

export default function TenantsPage() {
  return (
    <TenantRepositoryProvider repositoryType="supabase">
      <TenantManagementContent />
    </TenantRepositoryProvider>
  );
}
