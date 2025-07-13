// app/verification/page.tsx
// No 'use client' here, this is now a Server Component that renders the Suspense boundary

import { Suspense } from 'react';
import VerificationClient from './VerificationClient'; // Import the new client component

export default function VerificationPage() {
  return (
    // Wrap the client component in Suspense
    // The fallback content will be displayed while the client component (and useSearchParams) loads
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700">Loading verification details...</p>
          {/* You could add a spinner here */}
        </div>
      </div>
    }>
      <VerificationClient />
    </Suspense>
  );
}
