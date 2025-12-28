'use client';

/**
 * Error Boundary Component for Dashboard Route
 *
 * Catches and displays runtime errors in the dashboard feature.
 * Follows Next.js error.tsx conventions for route-level error handling.
 *
 * @module error
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard error boundary component
 *
 * Displays user-friendly error message with recovery option.
 * Logs errors to console for debugging.
 *
 * @param error - Error object thrown by child components
 * @param reset - Function to attempt recovery by re-rendering
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          An error occurred while loading the dashboard. Please try again.
        </p>
        {error.message && (
          <p className="text-sm text-muted-foreground">
            Error: {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
