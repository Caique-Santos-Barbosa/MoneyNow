import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação básica
    if (!email) {
      setError('Email é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Substituir pela API real quando backend estiver pronto
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar email de recuperação');
      }

      setSuccess(true);

    } catch (err) {
      setError(err.message || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex bg-gray-50">
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

            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-[#00D68F]" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">Email enviado!</h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Enviamos um link de recuperação para <strong className="text-gray-900">{email}</strong>.
                <br /><br />
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3 items-start">
                  <span className="text-xl">ℹ️</span>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Não recebeu o email? Verifique sua caixa de spam ou aguarde alguns minutos.
                  </p>
                </div>
              </div>

              <Link to="/Login">
                <Button className="w-full bg-[#00D68F] hover:bg-[#00B578] text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para login
                </Button>
              </Link>
            </div>
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
            Recupere sua<br />
            senha facilmente
          </h2>

          <p className="text-lg mb-8 opacity-95">
            Digite seu email e enviaremos um link seguro para redefinir sua senha.
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

          <Link to="/Login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h2>
            <p className="text-gray-600">
              Digite seu email e enviaremos um link para redefinir sua senha
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
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
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
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

