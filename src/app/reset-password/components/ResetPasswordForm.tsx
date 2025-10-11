"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "../hooks/UseResetPassword";
import {
  ResetPasswordError,
  ResetPasswordErrorCode,
} from "../dto/ResetPasswordTypes";

interface ResetPasswordFormProps {
  token: string | null;
}

/**
 * Password reset form component
 * Handles user input, validation display, and submission
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const {
    submitReset,
    validateInput,
    isLoading,
    isSuccess,
    error,
    validationErrors,
  } = useResetPassword(token);

  // Real-time validation on blur
  const handleBlur = (field: "password" | "confirmPassword") => {
    setTouched({ ...touched, [field]: true });
    validateInput({ password, confirmPassword });
  };

  // Clear errors when user starts typing (after being touched)
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password || touched.confirmPassword) {
      validateInput({ password: value, confirmPassword });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.password || touched.confirmPassword) {
      validateInput({ password, confirmPassword: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched on submit
    setTouched({ password: true, confirmPassword: true });
    submitReset({ password, confirmPassword });
  };

  // Check if submit should be disabled
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isFormIncomplete = !password || !confirmPassword;

  // Handle missing token case
  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Reset Link
          </h2>
          <p className="text-gray-700 mb-6">
            This reset link is invalid. Please request a new password reset.
          </p>
          <a
            href="/forgot-password"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Request New Reset Link
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4 text-green-600">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-700">
            Your password has been reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Reset Your Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.password ? "border-red-500" : "border-gray-300"
              }`}
              aria-invalid={!!validationErrors.password}
              aria-describedby={
                validationErrors.password ? "password-error" : undefined
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {validationErrors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              aria-invalid={!!validationErrors.confirmPassword}
              aria-describedby={
                validationErrors.confirmPassword ? "confirm-error" : undefined
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p
              id="confirm-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* API Error Display */}
        {error && error instanceof ResetPasswordError && (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-md"
            role="alert"
          >
            <p className="text-sm text-red-800">{error.message}</p>
            {(error.code === ResetPasswordErrorCode.TOKEN_EXPIRED ||
              error.code === ResetPasswordErrorCode.TOKEN_INVALID) && (
              <a
                href="/forgot-password"
                className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Request New Reset Link
              </a>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || hasValidationErrors || isFormIncomplete}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
