'use client';

/**
 * Error Boundary for Tenants Route
 * Catches and displays errors that occur during rendering
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TenantError({ error, reset }: ErrorProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">
              Something went wrong!
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred while loading tenant management.'}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
