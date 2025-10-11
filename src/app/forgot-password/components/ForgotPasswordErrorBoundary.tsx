"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ForgotPasswordErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "ForgotPasswordErrorBoundary caught error:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <CardTitle>Something Went Wrong</CardTitle>
                <CardDescription>
                  We encountered an unexpected error. Please try again or
                  contact support if the problem persists.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs font-mono text-muted-foreground break-words">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  className="w-full"
                >
                  Try Again
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
        </div>
      );
    }

    return this.props.children;
  }
}
