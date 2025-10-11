'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { ResetPasswordRepositoryProvider } from './providers/ResetPasswordRepositoryProvider';

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <ResetPasswordRepositoryProvider>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm token={token} />
      </div>
    </ResetPasswordRepositoryProvider>
  );
}

/**
 * Password reset page component
 * Extracts token from URL and renders reset form
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
