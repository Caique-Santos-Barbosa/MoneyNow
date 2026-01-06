import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CreditCard, 
  Camera, 
  AlertCircle, 
  Check, 
  Loader2,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCPF, validateCPF } from '@/utils/masks';
import { validateEmail, validatePassword, validateName, getPasswordStrengthText } from '@/utils/validations';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Dados básicos, 2: Confirmação
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailConfirmation: '',
    password: '',
    passwordConfirmation: '',
    cpf: '',
    photo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Imagem muito grande. Máximo 5MB.' });
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Arquivo deve ser uma imagem.' });
        return;
      }
      
      setFormData({ ...formData, photo: file });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Limpar erro
      const newErrors = { ...errors };
      delete newErrors.photo;
      setErrors(newErrors);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Nome
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    // Email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Confirmação de email
    if (!formData.emailConfirmation) {
      newErrors.emailConfirmation = 'Confirme seu email';
    } else if (formData.email !== formData.emailConfirmation) {
      newErrors.emailConfirmation = 'Emails não conferem';
    }
    
    // Senha
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    // Confirmação de senha
    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Confirme sua senha';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Senhas não conferem';
    }
    
    // CPF (opcional, mas validar formato se preenchido)
    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11 || !validateCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido';
      }
    }
    
    return newErrors;
  };

  const handleContinue = () => {
    const validationErrors = validateStep1();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setErrors({ ...errors, terms: 'Você deve aceitar os termos de uso' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      if (formData.cpf) {
        formDataToSend.append('cpf', formData.cpf.replace(/\D/g, ''));
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      // TODO: Substituir pela API real quando backend estiver pronto
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend
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
          throw new Error('Serviço de registro não encontrado. O backend ainda não está disponível.');
        } else if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.');
        } else {
          throw new Error('Resposta inválida do servidor. Verifique se o backend está configurado corretamente.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao criar conta');
      }

      // Redirecionar para login
      navigate('/Login?registered=true');

    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = error.message || 'Erro ao criar conta';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está rodando.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erro de comunicação com o servidor. O backend pode não estar configurado corretamente.';
      }
      
      setErrors({ ...errors, general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrengthText(formData.password) : null;

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
            Comece a organizar<br />
            suas finanças hoje!
          </h2>

          <p className="text-lg mb-8 opacity-95">
            Crie sua conta grátis e tenha controle total do seu dinheiro.
            É rápido, fácil e 100% seguro.
          </p>

          <div className="space-y-4">
            {[
              'Grátis para sempre',
              'Sem limite de transações',
              'Seus dados 100% protegidos',
              'Teste Premium grátis por 7 dias'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00D68F] to-[#00B578] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MoneyNow</h1>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
                <p className="text-gray-600">Preencha seus dados para começar</p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#00D68F] text-white flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="w-16 h-0.5 bg-[#00D68F]"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm">
                  2
                </div>
              </div>

              {errors.general && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-5">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer border-3 border-dashed border-gray-300 hover:border-[#00D68F] transition-colors bg-gray-50 group"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-xs">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <p className="text-xs text-gray-500">Opcional - Máximo 5MB</p>
                  {errors.photo && (
                    <p className="text-sm text-red-500">{errors.photo}</p>
                  )}
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Confirmação de Email */}
                <div className="space-y-2">
                  <Label htmlFor="emailConfirmation">Confirme seu e-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="emailConfirmation"
                      type="email"
                      placeholder="Digite novamente seu e-mail"
                      value={formData.emailConfirmation}
                      onChange={(e) => setFormData({ ...formData, emailConfirmation: e.target.value })}
                      className={`pl-10 pr-10 ${errors.emailConfirmation ? 'border-red-500' : ''}`}
                      autoComplete="email"
                    />
                    {formData.emailConfirmation && formData.email === formData.emailConfirmation && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00D68F]" />
                    )}
                  </div>
                  {errors.emailConfirmation && (
                    <p className="text-sm text-red-500">{errors.emailConfirmation}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {formData.password && passwordStrength && (
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

                {/* Confirmação de Senha */}
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation">Confirme sua senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="passwordConfirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      placeholder="Digite novamente sua senha"
                      value={formData.passwordConfirmation}
                      onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                      className={`pl-10 pr-10 ${errors.passwordConfirmation ? 'border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.passwordConfirmation && (
                    <p className="text-sm text-red-500">{errors.passwordConfirmation}</p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (opcional)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                      className={`pl-10 ${errors.cpf ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.cpf && (
                    <p className="text-sm text-red-500">{errors.cpf}</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleContinue}
                  className="w-full bg-[#00D68F] hover:bg-[#00B578] text-white h-11"
                >
                  Continuar
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirme seus dados</h2>
                <p className="text-gray-600">Revise as informações antes de criar sua conta</p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#00D68F] text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div className="w-16 h-0.5 bg-[#00D68F]"></div>
                <div className="w-8 h-8 rounded-full bg-[#00D68F] text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
              </div>

              {errors.general && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Resumo dos dados */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {photoPreview && (
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                        <img src={photoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  
                  {/* Botão Editar movido para cima */}
                  <div className="flex justify-end mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStep(1)}
                    >
                      Editar
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">Nome:</span>
                      <span className="text-sm text-gray-900 font-semibold">{formData.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">E-mail:</span>
                      <span className="text-sm text-gray-900 font-semibold">{formData.email}</span>
                    </div>
                    
                    {formData.cpf && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">CPF:</span>
                        <span className="text-sm text-gray-900 font-semibold">{formData.cpf}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aceite de termos */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => {
                      setAcceptTerms(checked);
                      if (checked) {
                        const newErrors = { ...errors };
                        delete newErrors.terms;
                        setErrors(newErrors);
                      }
                    }}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer leading-relaxed"
                  >
                    Eu li e aceito os{' '}
                    <Link to="/terms" target="_blank" className="text-[#00D68F] hover:underline font-semibold">
                      Termos de Uso
                    </Link>
                    {' '}e a{' '}
                    <Link to="/privacy" target="_blank" className="text-[#00D68F] hover:underline font-semibold">
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-500">{errors.terms}</p>
                )}

                <div className="flex gap-3 items-start p-4 bg-blue-50 rounded-lg">
                  <span className="text-lg">ℹ️</span>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Seus dados são criptografados e protegidos. Nunca compartilharemos
                    suas informações com terceiros.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="flex-1 bg-[#00D68F] hover:bg-[#00B578] text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      'Criar minha conta'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/Login" className="text-[#00D68F] font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

