"use client";

import { FormEvent } from "react";
import { useForgotPassword } from "../hooks/UseForgotPassword";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { session, requestReset, updateEmail, validateEmail, reset } =
    useForgotPassword();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate before submission
    const hasError = validateEmail();
    if (hasError) {
      return;
    }

    await requestReset(session.email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEmail(e.target.value);
  };

  const handleEmailBlur = () => {
    validateEmail();
  };

  // Success state - show success message
  if (session.isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with{" "}
              <strong>{session.lastAttemptEmail}</strong>, a password reset link
              has been sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <Button type="button" onClick={reset} className="w-full">
              Try Another Email
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* API Error - shown above form */}
              {session.apiError && (
                <div
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-sm text-destructive">{session.apiError}</p>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={session.email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  disabled={session.isLoading}
                  autoFocus
                  autoComplete="email"
                  required
                  aria-invalid={!!session.fieldError}
                  aria-describedby={
                    session.fieldError ? "email-error" : undefined
                  }
                  aria-label="Email Address"
                  className={cn(
                    session.fieldError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  placeholder="m@example.com"
                />
                {/* Field Error - shown below input */}
                {session.fieldError && (
                  <p
                    id="email-error"
                    className="text-sm text-destructive mt-2"
                    role="alert"
                    aria-live="polite"
                  >
                    {session.fieldError}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={session.isLoading || !!session.fieldError}
                  className="w-full"
                  aria-busy={session.isLoading}
                >
                  {session.isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Field>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
