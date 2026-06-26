'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  X,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Notifications } from '@/hook/notify';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '@/enums/notification-type.enum';
import { UserNotification } from '@/types/common/socket.payload.interface';
import { getDecodedToken } from '@/lib/getDecodedToken';

interface BellNotificationProps {
  userId: number;
}

export default function BellNotification({ userId }: BellNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    notifications,
    isConnected,
    connectToSocket,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    markAllAsRead,
  } = Notifications(userId);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5); // Show only 5 most recent
  const { t } = useTranslation();
  const decoded = getDecodedToken();
  const currentUserId = decoded?.userId;

  // Reload page for NEW_PERMISSION notifications
  useEffect(() => {
    if (
      notifications.some(
        (n) => n.notification.type === NotificationType.NEW_PERMISSION,
      )
    ) {
      window.location.reload();
    }
  }, [notifications]);

  // Auto-connect WebSocket when component mounts
  useEffect(() => {
    if (userId && !isConnected) {
      connectToSocket();
    }
  }, [userId, isConnected, connectToSocket]);

  // Show animation when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const departmentTypes = new Set([
    NotificationType.INVITATION_TO_DEPARTMENT,
    NotificationType.UPDATE_DEPARTMENT_INFORMATION,
    NotificationType.DELETE_OUT_OF_DEPARTMENT,
    NotificationType.NEW_PERMISSION_IN_DEPARTMENT,
    NotificationType.CHANGE_PERMISSION_IN_DEPARTMENT,
  ]);

  const leaveRequestTypes = new Set([
    NotificationType.LEAVE_REQUEST,
    NotificationType.APPROVE_LEAVE_REQUEST,
    NotificationType.REJECT_LEAVE_REQUEST,
    NotificationType.CANCEL_LEAVE_REQUEST,
  ]);

  const attendanceTypes = new Set([
    NotificationType.CHECK_IN_REMINDER,
    NotificationType.CHECK_OUT_REMINDER,
  ]);

  const userPermissionTypes = new Set([
    NotificationType.NEW_PERMISSION,
    NotificationType.CHANGE_USER_PERMISSION,
  ]);
  const getNotificationIcon = (type: NotificationType) => {
    if (departmentTypes.has(type))
      return <Calendar className="w-4 h-4 text-blue-500" />;
    if (leaveRequestTypes.has(type))
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (attendanceTypes.has(type))
      return <Clock className="w-4 h-4 text-yellow-500" />;
    if (userPermissionTypes.has(type))
      return <ShieldCheck className="w-4 h-4 text-gray-500" />;
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  const getNotificationRoute = (type: NotificationType, id?: number) => {
    if (departmentTypes.has(type)) return `/department/${id}`;
    if (leaveRequestTypes.has(type)) return `/leave-requests-summary/${id}`;
    if (attendanceTypes.has(type)) return `/attendance/`;
    if (userPermissionTypes.has(type))
      return `/employee/profile/${currentUserId ?? ''}`;
    return '/';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setHasNewNotification(false);
  };

  const handleNotificationClick = async (notification: UserNotification) => {
    console.log('notification: ', notification);

    if (!notification.isRead) {
      try {
        await markAsRead(notification.notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    router.push(
      getNotificationRoute(
        notification.notification.type,
        notification.referenceId,
      ),
    );
  };

  const handleRemoveNotification = async (notificationId: number) => {
    try {
      await removeNotification(notificationId);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          hasNewNotification
            ? 'text-blue-600 bg-blue-50 animate-pulse'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Bell
          className={`w-6 h-6 ${hasNewNotification ? 'animate-bounce' : ''}`}
        />
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-120 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                {t('notification.notifications')}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {t('notification.markAllAsRead')}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-4 mt-2 text-xs text-gray-600">
              <span>
                {notifications.length} {t('notification.all')}
              </span>
              <span>
                {unreadCount} {t('notification.unread')}
              </span>
              <span
                className={`flex items-center gap-1 ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                {isConnected
                  ? t('notification.connected')
                  : t('notification.disconnected')}
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {t('notification.noNotification')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((userNotification) => (
                  <div
                    key={userNotification.id}
                    onClick={() => handleNotificationClick(userNotification)}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !userNotification.isRead
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(
                          userNotification.notification.type,
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {userNotification.notification.title}
                          </h4>
                          {!userNotification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {userNotification.notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTimestamp(
                                userNotification.notification.dayInform,
                              )}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(
                                  userNotification.notification.id,
                                );
                              }}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {t('notification.markAllAsRead')}
                </button>
                <button
                  onClick={handleClearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  {t('notification.clearAll')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
