/**
 * Tenant Table Row Component
 * Renders a single tenant row with action buttons
 */
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Tenant } from '../models/Tenant';
import { formatDateTime } from '@/lib/date-formatter';

interface TenantTableRowProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export function TenantTableRow({ tenant, onEdit, onDelete }: TenantTableRowProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent,
    action: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <TableRow tabIndex={0} onKeyDown={(e) => handleKeyDown(e, () => onEdit(tenant))}>
      <TableCell className="font-mono text-xs truncate max-w-[80px] sm:max-w-[120px]">{tenant.id.slice(0, 8)}...</TableCell>
      <TableCell className="font-medium">{tenant.name}</TableCell>
      <TableCell className="hidden md:table-cell">{formatDateTime(tenant.created_at)}</TableCell>
      <TableCell className="hidden lg:table-cell">{formatDateTime(tenant.updated_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tenant)}
            aria-label={`Edit ${tenant.name}`}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(tenant)}
            aria-label={`Delete ${tenant.name}`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
