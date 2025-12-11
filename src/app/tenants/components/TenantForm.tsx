'use client';

/**
 * Tenant Form Component
 * Modal form for creating and editing tenants
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TenantInput, TenantInputSchema } from '../dto/TenantTypes';
import { Tenant } from '../models/Tenant';
import { formatDateTime } from '@/lib/date-formatter';

interface TenantFormProps {
  mode: 'create' | 'edit';
  tenant?: Tenant;
  open: boolean;
  onSubmit: (input: TenantInput) => Promise<void>;
  onClose: () => void;
}

export function TenantForm({
  mode,
  tenant,
  open,
  onSubmit,
  onClose,
}: TenantFormProps) {
  const [name, setName] = useState(tenant?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate input
      const validatedInput = TenantInputSchema.parse({ name });

      setIsSubmitting(true);
      await onSubmit(validatedInput);

      // Reset form on success
      setName('');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName(tenant?.name || '');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Tenant' : 'Edit Tenant'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {mode === 'edit' && tenant && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant-id">ID</Label>
                  <Input
                    id="tenant-id"
                    value={tenant.id}
                    disabled
                    className="font-mono text-xs"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="tenant-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tenant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tenant name"
                disabled={isSubmitting}
                required
                maxLength={255}
              />
            </div>

            {mode === 'edit' && tenant && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant-created">Created At</Label>
                  <Input
                    id="tenant-created"
                    value={formatDateTime(tenant.created_at)}
                    disabled
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant-updated">Updated At</Label>
                  <Input
                    id="tenant-updated"
                    value={formatDateTime(tenant.updated_at)}
                    disabled
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : mode === 'create' ? (
                'Create Tenant'
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
