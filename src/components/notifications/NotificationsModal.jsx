import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationManager } from '@/utils/notificationManager';

export default function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);
  
  // Escuta evento de atualização
  useEffect(() => {
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleUpdate);
  }, []);
  
  const loadNotifications = () => {
    setNotifications(NotificationManager.getAll());
  };
  
  const handleMarkAllAsRead = () => {
    NotificationManager.markAllAsRead();
    loadNotifications();
  };
  
  const handleMarkAsRead = (id) => {
    NotificationManager.markAsRead(id);
    loadNotifications();
  };
  
  const handleDelete = (id) => {
    NotificationManager.delete(id);
    loadNotifications();
  };
  
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notificações</span>
            {notifications.length > 0 && (
              <Badge variant="secondary">{notifications.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notif.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-100/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-2">{notif.time}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <Badge variant="default" className="bg-blue-500 text-xs">Nova</Badge>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como lidas
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (confirm('Limpar todas as notificações?')) {
                    NotificationManager.clear();
                    loadNotifications();
                  }
                }}
                className="text-red-500"
              >
                Limpar tudo
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
