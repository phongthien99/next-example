"use client";

import React, { useState, FormEvent } from "react";
import { useSignup } from "../hooks/UseSignup";
import { SignupInputSchema } from "../dto/SignupTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * SignUpForm Component
 *
 * Presentation layer component for user registration.
 * Implements Clean Architecture - only handles UI, delegates to application layer.
 *
 * Features:
 * - Form validation using Zod schema (DRY - single source of truth)
 * - Real-time validation on blur and submit
 * - Loading state during submission
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Error display with user-friendly messages
 * - Success message with user name
 */
export function SignUpForm() {
  const { signup, isLoading, error, user } = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Validate field on blur using Zod schema
   */
  const validateField = (field: "name" | "email", value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    // Use Zod to validate the specific field
    const result = SignupInputSchema.safeParse({
      name: field === "name" ? value : "dummy", // Provide dummy value for non-validated field
      email: field === "email" ? value : "dummy@example.com",
    });

    if (!result.success) {
      // Extract error for the specific field
      const fieldError = result.error.issues.find(
        (err) => err.path[0] === field,
      );
      if (fieldError) {
        errors[field] = fieldError.message;
      } else {
        delete errors[field];
      }
    } else {
      delete errors[field];
    }

    setFieldErrors(errors);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    validateField("name", name);
    validateField("email", email);

    // Check if there are any validation errors
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    // Submit to application layer
    await signup({ name: name.trim(), email: email.trim() });
  };

  // Show success message if user was created
  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Success!
          </CardTitle>
          <CardDescription className="text-center">
            Welcome, {user.name}! Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            <p>Email: {user.email}</p>
            <p className="mt-2">You can now proceed to log in.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <CardDescription>
          Create your account with just your name and email
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Global error message */}
          {error && (
            <div
              className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => validateField("name", name)}
              disabled={isLoading}
              className={cn(fieldErrors.name && "border-red-500")}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              placeholder="John Doe"
              required
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-sm text-red-600" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateField("email", email)}
              disabled={isLoading}
              className={cn(fieldErrors.email && "border-red-500")}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              placeholder="john@example.com"
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-9">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
          >
            {isLoading ? "Creating your account..." : "Sign Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
