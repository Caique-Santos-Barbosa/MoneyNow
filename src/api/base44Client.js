import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// Usa variável de ambiente ou fallback para o appId padrão
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "695b2ab55b0764f0c9f239e8", 
  requiresAuth: true // Ensure authentication is required for all operations
});
