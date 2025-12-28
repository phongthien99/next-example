"use client";

import { LoginForm } from "./components/LoginForm";
import { AuthProvider } from "./providers/AuthProvider";

/**
 * Login Page - Simple Context Pattern
 *
 * Clean React Context - no DI framework needed
 */
export default function Page() {
  // inject AuthProvider at top level
  // 
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10"
      id="login-page-container"
    >
      <div className="w-full max-w-sm">
        <AuthProvider type="localStorage">
          <LoginForm />
        </AuthProvider>
      </div>
    </div>
  );
}
