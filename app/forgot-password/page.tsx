// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call the API to send reset code
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitted(true);
        
        // Redirect to verification page after a short delay
        setTimeout(() => {
          router.push(`/verification?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {isSubmitted ? (
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-gray-800">Email Sent!</h2>
            <p className="mt-2 text-gray-600">
              We've sent a 6-digit verification code to {email}.
            </p>
            <p className="mt-1 text-gray-600">
              Redirecting to verification page...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
              <p className="text-gray-600">Send a code to your email to reset your password</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
              
              <div className="mt-4 text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}