"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from '@clerk/nextjs';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  message: string;
  postId?: number;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();
  const { user } = useUser();

  useEffect(() => {
    if (socket && user?.id) {
      // Listen for incoming notifications
      socket.on('notification', (notification: Omit<Notification, 'id' | 'read'>) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show browser notification if permission is granted
        if (Notification.permission === 'granted') {
          new Notification(notification.message, {
            icon: '/icons/logo.svg',
            badge: '/icons/logo.svg',
          });
        }
      });

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user?.id]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      clearNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
