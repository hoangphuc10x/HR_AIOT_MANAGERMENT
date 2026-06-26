'use client';

import axios from '@/lib/axios';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  SocketPayloadInterface,
  UserNotification,
} from '@/types/common/socket.payload.interface';
import { CustomSocket } from '@/types/common/socket.interface';

export function Notifications(userId: number) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<CustomSocket | null>(null);

  // Connect to WebSocket
  const connectSocket = (userId: number) => {
    return io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      query: { userId },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${userId}`,
      );
      const fetchedNotifications: UserNotification[] = Array.isArray(
        response.data,
      )
        ? response.data
        : response.data.data || [];
      setNotifications(
        fetchedNotifications.sort(
          (a, b) =>
            new Date(b.notification.dayInform).getTime() -
            new Date(a.notification.dayInform).getTime(),
        ),
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    fetchNotifications();
    connectToSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off();
    };
  }, [userId]);

  const connectToSocket = () => {
    setIsConnecting(true);

    socketRef.current?.disconnect();
    socketRef.current?.off();
    socketRef.current = connectSocket(userId) as unknown as CustomSocket;

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      setIsConnecting(false);
      console.log('Socket connected with userId:', userId);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      setIsConnecting(false);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      setIsConnected(false);
      setConnectionStatus(`Connection Error: ${error.message}`);
      setIsConnecting(false);
    });

    // Listen for notification event and trigger refresh
    socketRef.current.on('notification', (data: SocketPayloadInterface) => {
      console.log('Notification event received, refreshing data:', data);
      fetchNotifications(); // Refresh data from API
    });
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read/${userId}`,
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification.id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const removeNotification = async (notificationId: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/delete/${userId}`,
      );
      setNotifications((prev) =>
        prev.filter((n) => n.notification.id !== notificationId),
      );
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${userId}`,
      );
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) =>
            axios.patch(
              `${process.env.NEXT_PUBLIC_API_URL}/notifications/${n.notification.id}/read/${userId}`,
            ),
          ),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    isConnected,
    connectionStatus,
    isConnecting,
    connectToSocket,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    markAllAsRead,
  };
}
