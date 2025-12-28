"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthSession } from "@/app/(auth)/login/entities/AuthSession";

/**
 * AuthGuard Component - Client-side Route Protection
 *
 * Logic:
 * - Nếu đã login + đang ở trang login/signup → redirect về dashboard
 * - Nếu chưa login + đang ở trang protected → redirect về login
 * - Nếu chưa login + đang ở trang public → cho qua
 */

interface AuthGuardProps {
  readonly children: React.ReactNode;
}

// Danh sách các route public (không cần login)
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Danh sách các route auth (login, signup) - nếu đã login thì không cho vào
const AUTH_ROUTES = ["/login", "/signup"];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Đảm bảo component chỉ render sau khi mount (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      // Check if user is logged in
      const session = AuthSession.load();
      const isLoggedIn = !!session && !session.isExpired();

      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        pathname?.startsWith(route)
      );
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname?.startsWith(route)
      );

      // Case 0: Nếu vào trang home "/" → redirect về dashboard
      if (pathname === "/") {
        router.replace("/dashboard");
        return;
      }

      // Case 1: Đã login + đang ở trang login/signup → redirect về dashboard
      if (isLoggedIn && isAuthRoute) {
        router.replace("/dashboard");
        return;
      }

      // Case 2: Chưa login + đang ở trang protected → redirect về login
      if (!isLoggedIn && !isPublicRoute) {
        router.replace("/login");
        return;
      }

      // Case 3: Các trường hợp còn lại → cho qua
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router, isMounted]);

  // Trước khi mount, không render gì để tránh hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Hiển thị loading trong khi check auth
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
