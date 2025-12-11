/**
 * Loading UI for Tenants Page
 * Displays skeleton loading state while tenant data is being fetched
 */
import { TenantTableSkeleton } from './components/TenantTableSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <TenantTableSkeleton />
    </div>
  );
}
