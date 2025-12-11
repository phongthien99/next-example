'use client';

/**
 * Tenant Table Component
 * Main table component that displays tenant list with conditional rendering
 */
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tenant } from '../models/Tenant';
import { TenantTableSkeleton } from './TenantTableSkeleton';
import { TenantTableError } from './TenantTableError';
import { TenantTableEmpty } from './TenantTableEmpty';
import { TenantTableRow } from './TenantTableRow';

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export function TenantTable({ tenants, isLoading, error, onRetry, onEdit, onDelete }: TenantTableProps) {

  // Loading state
  if (isLoading) {
    return <TenantTableSkeleton />;
  }

  // Error state
  if (error) {
    return <TenantTableError error={error} onRetry={onRetry} />;
  }

  // Empty state
  if (tenants.length === 0) {
    return <TenantTableEmpty />;
  }

  // Success state with data
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px] sm:min-w-[120px]">ID</TableHead>
            <TableHead className="min-w-[120px]">Name</TableHead>
            <TableHead className="hidden md:table-cell min-w-[150px]">Created At</TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">Updated At</TableHead>
            <TableHead className="text-right min-w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TenantTableRow key={tenant.id} tenant={tenant} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
