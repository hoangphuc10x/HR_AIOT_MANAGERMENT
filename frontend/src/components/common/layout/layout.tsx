'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react';

import { fetchUserPermissions } from '@/api/user-permission';
import { useTranslation } from 'react-i18next';
import { getDecodedToken } from '@/lib/getDecodedToken';
import Header from './Header';
import Sidebar from '../ui/Sidebar';

interface CommonLayoutProps {
  children: React.ReactNode;
}

interface SidebarProps {
  navigationItems: {
    name: string;
    icon: React.ElementType;
    href: string;
  }[];
}

export default function CommonLayout({ children }: CommonLayoutProps) {
  const [isReady, setIsReady] = useState(false);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const decode = getDecodedToken();
    const userId = decode?.userId;
    if (typeof window !== 'undefined') {
      setIsReady(true);

      if (userId) {
        fetchPermissions(userId);
      } else {
        setLoadingPermissions(false);
      }
    }
  }, []);

  const fetchPermissions = async (userId: number) => {
    try {
      const res = await fetchUserPermissions(userId);
      if (res) {
        setPermissions(res || []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // default menu
  const baseNavigation = [
    {
      name: t('common.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      name: t('common.employees'),
      icon: Users,
      href: '/employee',
    },
    {
      name: t('common.departments'),
      icon: Building2,
      href: '/department',
    },
    {
      name: t('common.attendance'),
      icon: Clock,
      href: '/attendance',
    },
    {
      name: t('common.leaveRequest'),
      icon: FileText,
      href: '/leave-requests',
    },
  ];

  // menu with permission
  const permissionBasedNavigation = [
    permissions.includes(1) && {
      name: t('common.permissions'),
      icon: ShieldCheck,
      href: '/permissions',
    },
    permissions.includes(11) && {
      name: t('common.manageAttendance'),
      icon: CalendarClock,
      href: '/manage-attendance',
    },
    (permissions.includes(12) ||
      permissions.includes(13) ||
      permissions.includes(14)) && {
      name: t('common.leaveRequestsSummary'),
      icon: CalendarDays,
      href: '/leave-requests-summary',
    },
  ].filter(Boolean) as SidebarProps['navigationItems'];

  const navigationItems: SidebarProps['navigationItems'] = [
    ...baseNavigation,
    ...permissionBasedNavigation,
  ];

  if (!isReady || loadingPermissions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navigationItems={navigationItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
