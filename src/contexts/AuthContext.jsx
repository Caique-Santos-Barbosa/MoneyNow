import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      // Se tem usuário salvo, usar imediatamente (não bloquear UI)
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLoading(false);
          
          // Tentar validar com backend em background (não bloquear)
          fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Token inválido');
          })
          .then(data => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Se falhar, manter usuário salvo (modo offline)
            // Não limpar para não perder dados
          });
          
          return;
        } catch (e) {
          // Se falhar ao parsear, limpar tudo
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      // Se não tem usuário salvo, tentar buscar do backend
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } else {
          // Token inválido
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        // Backend não disponível - não é erro crítico
        // Manter token e permitir acesso (modo offline)
        console.log('Backend não disponível, usando modo offline');
        setUser(null);
      }

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password, rememberMe = false) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      // Verificar se a resposta tem conteúdo antes de fazer parse
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Se não for JSON, pode ser erro de rede ou backend não disponível
        const text = await response.text();
        throw new Error('Backend não disponível. Por favor, verifique sua conexão.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Salvar token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Salvar usuário
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirecionar
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/Dashboard';
      window.location.href = redirectTo;

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      // Se for erro de rede, dar mensagem mais amigável
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/Login';
  }

  async function refreshUser() {
    await checkAuth();
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

