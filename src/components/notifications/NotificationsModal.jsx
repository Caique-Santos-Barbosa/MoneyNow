import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationsModal({ isOpen, onClose }) {
  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Transação registrada',
      message: 'Sua despesa de R$ 150,00 foi registrada com sucesso',
      time: 'Há 2 horas',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Fatura vencendo',
      message: 'A fatura do seu cartão Visa vence em 3 dias',
      time: 'Há 5 horas',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Meta atingida',
      message: 'Parabéns! Você atingiu 80% da sua meta de economia',
      time: 'Ontem',
      read: true
    }
  ];
  
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notificações</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {mockNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(notif.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{notif.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                      <div className="text-xs text-gray-400 mt-2">{notif.time}</div>
                    </div>
                    {!notif.read && (
                      <Badge variant="default" className="bg-blue-500 text-xs">Nova</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" size="sm">Marcar todas como lidas</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


