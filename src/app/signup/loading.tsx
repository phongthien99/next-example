import { SignUpLoading } from "./components/SignUpLoading";

/**
 * Next.js Loading UI (Special File)
 *
 * This is a thin wrapper that delegates to the feature's loading component.
 * MUST stay at route level for Next.js to recognize it as a loading boundary.
 *
 * The actual UI implementation is in components/SignUpLoading.tsx for:
 * - Testability (can unit test the component)
 * - Reusability (can use elsewhere if needed)
 * - Clean Architecture (logic in Presentation Layer)
 */
export default function SignupLoadingBoundary() {
  return <SignUpLoading />;
}
