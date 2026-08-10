import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Auth Guard Hook - Ensures user is authenticated (token present)
 * Redirects to login if no valid token/user data found
 */
export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedData = localStorage.getItem('currentUserPlain');

        if (!storedData) {
          router.replace('/user/login');
          return null;
        }

        const parsedData = JSON.parse(storedData);
        const user = parsedData?.userData;
        const token = user?.token;

        // Block admins based on stored user type
        const userType = user?.userType ?? user?.type;

        // type=1: admin not allowed
        if (String(userType) === '1') {
          router.replace('/user/dashboard');
          return null;
        }

        // type=2: disallow access entirely (show 404)
        if (String(userType) === '2') {
          router.replace('/not-found');
          return null;
        }


        // If no user or no token, redirect to login
        if (!user || !token) {
          router.replace('/user/login');
          return null;
        }

        return user;
      } catch (error) {
        console.error('Auth guard error:', error);
        router.replace('/user/login');
        return null;
      }
    };

    checkAuth();
  }, [router]);
}
