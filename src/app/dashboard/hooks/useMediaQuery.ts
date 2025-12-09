"use client";

/**
 * Application Layer - Media Query Hook
 *
 * Provides reactive media query detection using window.matchMedia API.
 * Useful for responsive behavior in React components.
 *
 * @module useMediaQuery
 */

import { useState, useEffect } from "react";

/**
 * Hook to detect media query matches
 *
 * Uses window.matchMedia to reactively track media query changes.
 * Updates component state when media query match status changes.
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns True if media query matches, false otherwise
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 767px)');
 *   return <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>;
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false for SSR safety
  const [matches, setMatches] = useState(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") {
      return;
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query);

    // Event handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener (modern API)
    mediaQueryList.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect mobile viewport
 *
 * Mobile breakpoint: max-width 767px (below Tailwind's md: breakpoint)
 *
 * @returns True if viewport is mobile size
 *
 * @example
 * ```tsx
 * function MobileMenu() {
 *   const isMobile = useIsMobile();
 *   return isMobile ? <MobileNav /> : <DesktopNav />;
 * }
 * ```
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Hook to detect tablet viewport
 *
 * Tablet breakpoint: 768px to 1023px (Tailwind's md: to lg:)
 *
 * @returns True if viewport is tablet size
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

/**
 * Hook to detect desktop viewport
 *
 * Desktop breakpoint: min-width 1024px (Tailwind's lg: and above)
 *
 * @returns True if viewport is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
