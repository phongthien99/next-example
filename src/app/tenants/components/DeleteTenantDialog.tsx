'use client';

/**
 * Delete Tenant Dialog Component
 * Confirmation dialog for deleting a tenant with destructive action
 */
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tenant } from '../models/Tenant';

interface DeleteTenantDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteTenantDialog({
  tenant,
  open,
  onConfirm,
  onCancel,
}: DeleteTenantDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      // Error is handled by the hook (toast notification)
      console.error('Failed to delete tenant:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!tenant) return null;

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{tenant.name}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
