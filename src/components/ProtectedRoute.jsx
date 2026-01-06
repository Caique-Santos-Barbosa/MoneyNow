import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Salvar página atual para redirecionar após login
      const currentPath = window.location.pathname;
      navigate(`/Login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#00D68F]" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se está autenticado, renderizar conteúdo
  return <>{children}</>;
}

