// Configuração da API baseada no ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  baseURL: API_BASE_URL,
  
  // Helper para fazer requisições
  async fetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });
    
    return response;
  },
  
  // Métodos específicos
  async register(formData) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: formData,
    });
  },
  
  async login(data) {
    return this.fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
};

export default api;
