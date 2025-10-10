import { Metadata } from "next";
import { SignUpForm } from "./components/SignUpForm";
import { SignupRepositoryProvider } from "./providers/SignupRepositoryProvider";

/**
 * Page Metadata
 */
export const metadata: Metadata = {
  title: "Sign Up | Next-Solid",
  description: "Create your account with just your name and email",
};

/**
 * Signup Page
 *
 * Server component that wraps the SignUpForm with repository provider.
 * Implements Clean Architecture - page is just a shell for dependency injection.
 */
export default function SignupPage() {
  // Determine repository type from environment
  const useLocalStorage = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === "true";
  const repositoryType = useLocalStorage ? "localStorage" : "api";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SignupRepositoryProvider type={repositoryType}>
        <SignUpForm />
      </SignupRepositoryProvider>
    </div>
  );
}
