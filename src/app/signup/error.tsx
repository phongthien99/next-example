"use client";

import { SignUpError } from "./components/SignUpError";

/**
 * Next.js Error Boundary (Special File)
 *
 * This is a thin wrapper that delegates to the feature's error component.
 * MUST stay at route level for Next.js to recognize it as an error boundary.
 *
 * The actual UI implementation is in components/SignUpError.tsx for:
 * - Testability (can unit test the component)
 * - Reusability (can use elsewhere if needed)
 * - Clean Architecture (logic in Presentation Layer)
 */
export default function SignupErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SignUpError error={error} reset={reset} />;
}
