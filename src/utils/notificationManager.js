export const NotificationManager = {
  // Adicionar notificação
  add(notification) {
    const notifications = this.getAll();
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Atualiza contador
    this.updateUnreadCount();
    
    return newNotification;
  },
  
  // Buscar todas
  getAll() {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  },
  
  // Buscar não lidas
  getUnread() {
    return this.getAll().filter(n => !n.read);
  },
  
  // Marcar como lida
  markAsRead(id) {
    const notifications = this.getAll();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.updateUnreadCount();
  },
  
  // Marcar todas como lidas
  markAllAsRead() {
    const notifications = this.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    localStorage.setItem('unread_count', '0');
    
    // Dispara evento para atualizar UI
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  },
  
  // Contar não lidas
  getUnreadCount() {
    return this.getUnread().length;
  },
  
  // Atualizar contador
  updateUnreadCount() {
    const count = this.getUnreadCount();
    localStorage.setItem('unread_count', count.toString());
    
    // Dispara evento para atualizar UI
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  },
  
  // Deletar notificação
  delete(id) {
    const notifications = this.getAll();
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.updateUnreadCount();
  },
  
  // Limpar todas
  clear() {
    localStorage.setItem('notifications', '[]');
    localStorage.setItem('unread_count', '0');
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

// Helper para criar notificações específicas
export const createNotification = {
  transactionAdded(type, value) {
    return NotificationManager.add({
      type: 'success',
      title: type === 'income' ? 'Receita registrada' : 'Despesa registrada',
      message: `Sua ${type === 'income' ? 'receita' : 'despesa'} de ${value} foi registrada com sucesso`,
      time: 'Agora'
    });
  },
  
  billDue(billName, daysLeft) {
    return NotificationManager.add({
      type: 'warning',
      title: 'Fatura vencendo',
      message: `A fatura ${billName} vence em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`,
      time: 'Agora'
    });
  },
  
  goalReached(goalName, percentage) {
    return NotificationManager.add({
      type: 'info',
      title: 'Meta atingida',
      message: `Parabéns! Você atingiu ${percentage}% da sua meta ${goalName}`,
      time: 'Agora'
    });
  }
};

