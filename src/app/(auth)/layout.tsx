import { FileText } from "lucide-react";

/**
 * Auth Layout - Route Group Layout
 *
 * Provides a clean, centered layout for authentication pages
 * (login, signup, forgot password, reset password, etc.)
 * No sidebar or navigation - focused on auth flow
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-6 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Exam System
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your platform for learning and practice
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
