import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle, Trash2, CheckCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Notification } from '../../types';
import { useOptimizedNotifications } from '../../hooks/useOptimizedNotifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAll, 
    unreadCount,
    isLoading,
    initialized
  } = useOptimizedNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="info">{unreadCount} nuevas</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="small" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="small" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!initialized && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" text="Cargando notificaciones..." />
        </div>
      )}

      {initialized && (
        <Card>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${
                    notification.read 
                      ? 'bg-gray-50 dark:bg-gray-800' 
                      : 'bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${getNotificationColor(notification.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          {!notification.read && (
                            <Badge variant="info" size="small">Nuevo</Badge>
                          )}
                          {notification.actionRequired && (
                            <Badge variant="warning" size="small">Acción requerida</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-2 mt-3">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Marcar como leído
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </Card>
      )}
    </div>
  );
}