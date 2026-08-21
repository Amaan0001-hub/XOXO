"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MeMenu from '@/components/MeMenu';
import { RiNotification3Line, RiMenuLine } from 'react-icons/ri';
import { getAdminToken, getAdminEncryptedLocalData } from '@/app/api/auth';
// import AdminLogin from './login/page';

export default function AdminLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileHeader, setIsMobileHeader] = useState(false);
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(() => {
    // ✅ FIX: Admin ka apna admin-only token/data check karo (admintoken + adminCurrentUser),
    // shared "token"/"currentUser" ab sirf normal user session ke liye hai — isliye
    // doosre tab me user-login karne se ye admin session ab affect nahi hota.
    const token = getAdminToken();
    const userData = getAdminEncryptedLocalData();
    if (token && userData) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen for custom auth change events (same tab)
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    // Also check on window focus (useful for tab switching)
    window.addEventListener('focus', checkAuth);
    
    // Fallback: poll for auth changes every 500ms
    const pollInterval = setInterval(checkAuth, 500);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('focus', checkAuth);
      clearInterval(pollInterval);
    };
  }, [checkAuth]);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileHeader(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check loading state - wait for auth check
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // If not authenticated, show login page
  // if (!isAuthenticated) {
  //   return <AdminLogin />;
  // }

  // Check loading state first
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 min-h-screen
          ${!isMobileHeader ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''}
        `}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 px-4 sm:px-6">
            {/* Mobile spacer for hamburger menu */}
            <div className="w-10 sm:hidden" />
            
            {/* Spacer to balance the header on desktop */}
            <div className="hidden sm:block flex-1" />
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer touch-manipulation">
                <RiNotification3Line className="text-xl text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <MeMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

