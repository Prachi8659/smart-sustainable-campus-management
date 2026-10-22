import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { DEMO_NOTIFICATIONS } from '../services/mockData';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isBackendConnected } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    if (isBackendConnected) {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
          return;
        }
      } catch (e) {
        console.warn('API notification error, using demo fallback');
      }
    }

    // Demo notification fallback
    const saved = localStorage.getItem(`campus_notifs_${user.role}`);
    let list = saved ? JSON.parse(saved) : DEMO_NOTIFICATIONS;
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.isRead).length);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, isBackendConnected]);

  const markAsRead = async (id) => {
    if (isBackendConnected) {
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch (e) {
        console.warn('Error marking notification read on server');
      }
    }

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    if (user) {
      const updated = notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      localStorage.setItem(`campus_notifs_${user.role}`, JSON.stringify(updated));
    }
  };

  const markAllRead = async () => {
    if (isBackendConnected) {
      try {
        await api.patch('/notifications/read-all');
      } catch (e) {
        console.warn('Error marking all notifications read on server');
      }
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    if (user) {
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem(`campus_notifs_${user.role}`, JSON.stringify(updated));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
