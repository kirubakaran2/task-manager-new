// app/verification/VerificationClient.tsx
'use client'; // This directive is essential for client-side hooks

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VerifyCode from "../components/verify-code"; // Ensure this path is correct

export default function VerificationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleVerificationComplete = async (code: string) => {
    if (!email) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call API to verify code
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store reset token in session storage
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('verifiedToken', data.resetToken);
        
        // Redirect to reset password page
        router.push('/reset-password');
      } else {
        setError(data.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      setIsResending(true);
      setError('');
      setResendMessage('');
      
      // Call API to resend code
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResendMessage('A new verification code has been sent to your email.');
      } else {
        setError(data.error || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return <div className="text-center p-8">Redirecting...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Verify Code</h1>
          <p className="text-black">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        {resendMessage && <p className="text-green-500 mb-4 text-sm text-center">{resendMessage}</p>}

        <VerifyCode length={6} onComplete={handleVerificationComplete} />

        <div className="mt-6">
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className={`w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${
              isResending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isResending ? 'Resending...' : 'Resend Code'}
          </button>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Back to Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
