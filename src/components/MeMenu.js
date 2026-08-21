"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RiUserSettingsLine,
  RiArrowDownSLine,
  RiUser3Line,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiAccountPinCircleLine
} from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { doAdminLogout, getEncryptedLocalData } from '@/app/api/auth';
import { useRouter } from 'next/navigation';


export default function MeMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);               
  const dispatch = useDispatch();
  const router = useRouter();

  // Get admin data from localStorage
  useEffect(() => {
    const encryptedUser = localStorage.getItem('adminCurrentUser');
    if (encryptedUser) {
      try {
        const decryptedUser = getEncryptedLocalData('adminCurrentUser');
        if (decryptedUser && typeof decryptedUser === 'object') {
          setUserData(decryptedUser);
        } else {
          const parsedUser = JSON.parse(decryptedUser);
          if (parsedUser) {
            setUserData(parsedUser);
          }
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


    const handleLogout = () => {
    doAdminLogout();
    // window.dispatchEvent(new Event('auth-change'));
    window.location.replace('/ad-crm');
  }

  const menuItems = [
    { icon: RiAccountPinCircleLine, label: 'Profile', onClick: () => router.push('/admin/Admin-profile') },

  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
          <RiUser3Line className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {userData?.username || userData?.FullName || 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userData?.email || 'admin@example.com'}
          </p>
        </div>
        <RiArrowDownSLine className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {userData?.username || userData?.FullName || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userData?.email || 'admin@example.com'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <item.icon className="text-lg text-gray-500" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <RiLogoutBoxLine className="text-lg" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
