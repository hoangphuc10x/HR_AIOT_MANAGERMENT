'use client';

import React, { useState, useEffect } from 'react';
import LanguageDropdown from '@/components/common/ui/language-dropdown';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/common/jwt.interface';
import BellNotification from '../ui/NotificationDropdown';
import UserDropdown from '../ui/user-dropdown';

const Header = () => {
  const [isReady, setIsReady] = useState(false);
  const { i18n } = useTranslation();
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token') || '';
    const decode: JwtPayload = jwtDecode(token);
    const userId = decode.userId;

    setUserId(userId);
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  // Don't render until ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          {/* Language Dropdown */}
          <LanguageDropdown />

          {/* Notifications */}
          <BellNotification userId={userId} />

          {/* User Profile */}
          <div className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
            {/* <User className="w-6 h-6" /> */}
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
