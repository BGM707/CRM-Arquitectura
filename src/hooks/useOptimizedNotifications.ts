import { useState, useEffect, useMemo, useCallback } from 'react';
import { Notification } from '../types';

export function useOptimizedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Cargar notificaciones al inicializar
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setInitialized(true);
      }
    };

    loadNotifications();
  }, []);

  // Guardar notificaciones cuando cambian (solo después de inicializar)
  useEffect(() => {
    if (!initialized) return;
    
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications, initialized]);

  // Memoizar el conteo de no leídas para evitar recálculos innecesarios
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Memoizar notificaciones recientes para el dashboard
  const recentNotifications = useMemo(() => 
    notifications.slice(0, 5), 
    [notifications]
  );

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => {
      // Limitar a máximo 100 notificaciones para evitar sobrecarga
      const updated = [newNotification, ...prev];
      return updated.slice(0, 100);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    recentNotifications,
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAll,
    unreadCount,
    isLoading,
    setIsLoading,
    initialized,
  };
}