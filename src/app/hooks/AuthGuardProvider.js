"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuardProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedData = localStorage.getItem('currentUserPlain');

        if (!storedData) {
          setIsAuthenticated(false);
          setTimeout(() => router.replace('/user/login'), 100);
          return;
        }

        const parsedData = JSON.parse(storedData);
        const user = parsedData?.userData;
        const token = user?.token;

        // Block admins based on stored user type
        const userType = user?.userType ?? user?.type;

        // type=1: admin not allowed
        if (String(userType) === '1') {
          setIsAuthenticated(false);
          setTimeout(() => router.replace('/user/dashboard'), 100);
          return;
        }

        // type=2: disallow access entirely (show 404)
        if (String(userType) === '2') {
          setIsAuthenticated(false);
          setTimeout(() => router.replace('/not-found'), 100);
          return;
        }


        // If no user or no token, redirect to login
        if (!user || !token) {
          setIsAuthenticated(false);
          setTimeout(() => router.replace('/user/login'), 100);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setTimeout(() => router.replace('/user/login'), 100);
      }
    };

    // Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopstate);

    checkAuth();

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [router]);

  // Show blank while checking auth (don't render anything)
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated, don't render (redirect will handle it)
  if (!isAuthenticated) {
    return null;
  }

  // Render children only if authenticated
  return children;
}
