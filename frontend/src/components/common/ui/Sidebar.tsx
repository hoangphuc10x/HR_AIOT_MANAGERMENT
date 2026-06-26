// Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import axios from '@/lib/axios';
import { useLogoStore } from '../stores/logoStore';

interface SidebarProps {
  navigationItems: {
    name: string;
    icon: React.ElementType;
    href: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const logoUrl = useLogoStore((state) => state.logoUrl);
  const setLogoUrl = useLogoStore((state) => state.setLogoUrl);
  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
      const getLogo = async () => {
        try {
          const res = await axios.get('/upload/logo');
          setLogoUrl(res.data.data);
          console.log(res.data.data);
        } catch (error) {
          setLogoUrl('/logo.png');
        }
      };
      getLogo();
    }
  }, [i18n.isInitialized]);

  if (!isReady) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <div className="relative w-full h-30">
              <Image
                src={logoUrl || '/logo.png'}
                alt="/logo.png"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="relative w-full h-30">
            <Image
              src={logoUrl}
              alt="AloT"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive =
              pathname === item.href ||
              pathname === item.href.replace('/admin', '');

            return (
              <li key={item.name}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`w-full cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">A</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">
                AiOT Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
