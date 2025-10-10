"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/**
 * SignUpError Component (Presentation Layer)
 *
 * Reusable error UI component for the signup feature.
 * Can be used in error.tsx or anywhere else in the feature.
 *
 * This component contains the full error display logic and is testable.
 */
interface SignUpErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function SignUpError({ error, reset }: SignUpErrorProps) {
  useEffect(() => {
    // Log error to console (or error tracking service like Sentry)
    console.error("Signup error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error while processing your signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please try again. If the problem persists, contact support.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
