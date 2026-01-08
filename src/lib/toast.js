// Sistema de toast centralizado usando sonner
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message, description) => {
    sonnerToast.success(message, {
      description,
      duration: 3000,
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
      }
    });
  },
  
  error: (message, description) => {
    sonnerToast.error(message, {
      description,
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      }
    });
  },
  
  info: (message, description) => {
    sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },
  
  loading: (message) => {
    return sonnerToast.loading(message);
  },
  
  promise: (promise, messages) => {
    return sonnerToast.promise(promise, messages);
  }
};

