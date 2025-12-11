# next-soild Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-10

## Active Technologies
- TypeScript 5.x with Next.js 15.5.4 + React 19.1.0, Zod 4.1.12, Radix UI (@radix-ui/react-label, @radix-ui/react-slot), Tailwind CSS 4.x, class-variance-authority, clsx, tailwind-merge (001-feat-sign-up)
- TypeScript 5.9.3 with Next.js 15.5.4 (002-feat-forgot-password)
- External API endpoint for password reset requests + localStorage for form state persistence (optional, non-sensitive) (002-feat-forgot-password)
- TypeScript 5.9.3 with Next.js 15.5.4 + React 19.1.0, Zod 4.1.12, @tanstack/react-query 5.90.2, Radix UI (@radix-ui/react-label, @radix-ui/react-slot), Lucide React 0.545.0 (003-feat-reset-password)
- External password reset API endpoint + URL query parameters (token) (003-feat-reset-password)
- localStorage for sidebar state persistence (collapsed/expanded preference), mock data structure for teams/navigation/projects (no external API for this feature) (004-feature-create-screen)

## Project Structure
```
src/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
TypeScript 5.x with Next.js 15.5.4: Follow standard conventions

## Recent Changes
- 004-feature-create-screen: Added TypeScript 5.9.3 with Next.js 15.5.4
- 003-feat-reset-password: Added TypeScript 5.9.3 with Next.js 15.5.4 + React 19.1.0, Zod 4.1.12, @tanstack/react-query 5.90.2, Radix UI (@radix-ui/react-label, @radix-ui/react-slot), Lucide React 0.545.0
- 002-feat-forgot-password: Added TypeScript 5.9.3 with Next.js 15.5.4

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
