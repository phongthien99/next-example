/**
 * Error Display Component for Tenant Table
 * Shows error message with retry action
 */
interface TenantTableErrorProps {
  error: Error;
  onRetry: () => void;
}

export function TenantTableError({ error, onRetry }: TenantTableErrorProps) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Failed to Load Tenants
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
