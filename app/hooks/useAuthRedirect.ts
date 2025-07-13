// hooks/useAuthRedirect.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Check for both 'token' and 'user' in cookies
    const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
    const user = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));

    if (!token || !user) {
      // If either token or user is missing, redirect to login page
      router.push('/login');
    }
  }, [router]);
};

export default useAuthRedirect;
