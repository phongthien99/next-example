"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthSession } from "@/app/(auth)/login/entities/AuthSession";

interface AuthGuardProps {
  readonly children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const AUTH_ROUTES = ["/login", "/signup"];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const session = AuthSession.load();
    const isLoggedIn = !!session && !session.isExpired();

    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    // Case 0: "/" → dashboard
    if (pathname === "/") {
      router.replace("/dashboard");
      return;
    }

    // Case 1: Đã login nhưng vào login/signup
    if (isLoggedIn && isAuthRoute) {
      router.replace("/dashboard");
      return;
    }

    // Case 2: Chưa login nhưng vào protected
    if (!isLoggedIn && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // Case 3: Cho qua
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
