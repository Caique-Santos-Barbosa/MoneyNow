// Base44 removido - usando API própria agora
// Este arquivo foi mantido para evitar quebrar imports, mas não é mais usado
// TODO: Remover todos os imports deste arquivo e deletar este arquivo

// import { createClient } from '@base44/sdk';

// export const base44 = createClient({
//   appId: import.meta.env.VITE_BASE44_APP_ID || "695b2ab55b0764f0c9f239e8", 
//   requiresAuth: false
// });

// Stub para evitar erros em componentes que ainda importam
export const base44 = {
  auth: {
    me: async () => {
      console.warn('base44.auth.me() está depreciado - use AuthContext');
      return null;
    },
    logout: async () => {
      console.warn('base44.auth.logout() está depreciado - use AuthContext');
    },
    updateMe: async () => {
      console.warn('base44.auth.updateMe() está depreciado');
    }
  },
  entities: {
    Account: {},
    Card: {},
    Category: {},
    Transaction: {},
    Budget: {},
    Goal: {},
    Subscription: {},
    Payment: {},
    ImportHistory: {}
  },
  integrations: {
    Core: {}
  }
};