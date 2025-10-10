import { Card, CardHeader, CardContent } from '@/components/ui/card';

/**
 * SignUpLoading Component (Presentation Layer)
 *
 * Reusable loading skeleton UI for the signup feature.
 * Can be used in loading.tsx or anywhere else in the feature.
 *
 * This component contains the full loading UI and is testable.
 */
export function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
