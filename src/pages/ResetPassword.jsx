import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, TrendingUp, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPasswordStrengthText } from '@/utils/validations';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Token inválido ou expirado');
      setIsValidating(false);
    } else {
      validateToken();
    }
  }, [token]);

  async function validateToken() {
    try {
      // TODO: Substituir pela API real quando backend estiver pronto
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      // Verificar se a resposta é JSON antes de fazer parse
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data.message || data.error || 'Token inválido ou expirado');
        }
      } else {
        // Se não for JSON, pode ser erro do servidor (HTML)
        const text = await response.text();
        console.error('Resposta não-JSON recebida:', text.substring(0, 200));
        
        setTokenValid(false);
        if (response.status === 404) {
          setError('Serviço de validação não encontrado. O backend ainda não está disponível.');
        } else {
          setError('Erro ao validar token. O backend pode não estar configurado corretamente.');
        }
      }
    } catch (err) {
      console.error('Erro ao validar token:', err);
      setTokenValid(false);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setError('Erro ao validar token');
      }
    } finally {
      setIsValidating(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Senha deve conter maiúscula, minúscula e número');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Substituir pela API real quando backend estiver pronto
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      // Verificar se a resposta é JSON antes de fazer parse
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Se não for JSON, pode ser erro do servidor (HTML)
        const text = await response.text();
        console.error('Resposta não-JSON recebida:', text.substring(0, 200));
        
        if (response.status === 404) {
          throw new Error('Serviço de redefinição de senha não encontrado. O backend ainda não está disponível.');
        } else if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.');
        } else {
          throw new Error('Resposta inválida do servidor. Verifique se o backend está configurado corretamente.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao redefinir senha');
      }

      setSuccess(true);

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/Login?reset=success');
      }, 3000);

    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = err.message || 'Erro ao redefinir senha. Tente novamente.';
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está rodando.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Erro de comunicação com o servidor. O backend pode não estar configurado corretamente.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrengthText(password) : null;

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D68F] mx-auto mb-4" />
          <p className="text-gray-600">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Link inválido ou expirado</h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Este link de recuperação de senha não é válido ou já expirou.
              Por favor, solicite um novo link.
            </p>

            <Link to="/ForgotPassword">
              <Button className="w-full bg-[#00D68F] hover:bg-[#00B578] text-white">
                Solicitar novo link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#00D68F]" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Senha redefinida!</h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Sua senha foi alterada com sucesso.
              Você será redirecionado para o login...
            </p>

            <Loader2 className="h-8 w-8 animate-spin text-[#00D68F] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Coluna Esquerda - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#00D68F] to-[#00B578] p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="max-w-md z-10 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-[#00D68F]" />
            </div>
            <h1 className="text-3xl font-bold">MoneyNow</h1>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Redefina sua<br />
            senha com segurança
          </h2>

          <p className="text-lg mb-8 opacity-95">
            Digite sua nova senha. Certifique-se de usar uma senha forte e única.
          </p>
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00D68F] to-[#00B578] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MoneyNow</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Redefinir senha</h2>
            <p className="text-gray-600">Digite sua nova senha</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Indicador de força */}
              {password && passwordStrength && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.text.includes('fraca') ? 25 : passwordStrength.text.includes('média') ? 50 : passwordStrength.text.includes('forte') ? 75 : 100)}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirme a nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="passwordConfirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Digite novamente"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00D68F] hover:bg-[#00B578] text-white h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link to="/Login" className="text-[#00D68F] font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

