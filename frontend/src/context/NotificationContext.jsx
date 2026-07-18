import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const READ_IDS_KEY = 'hopecare_read_notification_ids';

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    const stored = localStorage.getItem(READ_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const load = useCallback(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    notificationService.getMyNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, [isAuthenticated]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // poll every 15s for new updates
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    const merged = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(merged);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(merged));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, readIds }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);