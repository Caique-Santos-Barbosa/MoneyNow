import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Crown, 
  Check, 
  CreditCard, 
  Smartphone, 
  Barcode,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CheckoutModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [startWithTrial, setStartWithTrial] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [installments, setInstallments] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      checkPremiumStatus();
    }
  }, [isOpen]);

  const checkPremiumStatus = async () => {
    try {
      const userData = await base44.auth.me();
      
      if (!userData) {
        setUser(null);
        setIsPremium(false);
        return;
      }
      
      setUser(userData);
      
      const isCurrentlyPremium = 
        userData?.is_premium && 
        userData?.premium_expires_at && 
        new Date(userData.premium_expires_at) > new Date();
      
      setIsPremium(isCurrentlyPremium);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setUser(null);
      setIsPremium(false);
    }
  };

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleStartTrial = async () => {
    setIsProcessing(true);
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      await base44.auth.updateMe({
        is_premium: true,
        trial_used: true,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        premium_expires_at: trialEndsAt.toISOString()
      });

      await base44.entities.Subscription.create({
        plan: 'annual',
        status: 'trial',
        amount: 0,
        installments: 1,
        installment_amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: trialEndsAt.toISOString().split('T')[0],
        payment_method: 'trial'
      });

      setPaymentStatus('trial_started');
      setStep(3);
      setPaymentData({ expiresAt: trialEndsAt });
    } catch (error) {
      console.error('Error starting trial:', error);
      setPaymentStatus('error');
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simular processamento de pagamento
      // Em produção, aqui você chamaria o gateway de pagamento (Stripe, PagSeguro, etc)
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await base44.auth.updateMe({
        is_premium: true,
        premium_plan: 'annual',
        premium_started_at: new Date().toISOString(),
        premium_expires_at: expiresAt.toISOString()
      });

      await base44.entities.Subscription.create({
        plan: 'annual',
        status: 'active',
        amount: 100,
        installments: parseInt(installments),
        installment_amount: 100 / parseInt(installments),
        start_date: new Date().toISOString().split('T')[0],
        end_date: expiresAt.toISOString().split('T')[0],
        next_billing_date: expiresAt.toISOString().split('T')[0],
        payment_method: paymentMethod
      });

      await base44.entities.Payment.create({
        subscription_id: 'sub_mock',
        amount: 100,
        installment_number: 1,
        total_installments: parseInt(installments),
        status: 'paid',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
        due_date: new Date().toISOString().split('T')[0]
      });

      setPaymentStatus('success');
      setPaymentData({ expiresAt, installments: parseInt(installments) });
      setStep(3);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('error');
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onSuccess?.();
    onClose();
    window.location.reload();
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#6C40D9]" />
              <DialogTitle>MoneyNow Premium</DialogTitle>
            </div>
            <span className="text-xs text-gray-500">
              Etapa {step} de 3
            </span>
          </div>
        </div>

        {/* Premium Status Warning */}
        {isPremium && (
          <div className="px-6 pb-6">
            <div className="p-6 bg-gradient-to-br from-[#6C40D9]/10 to-[#8A5FE6]/5 border-2 border-[#6C40D9]/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#6C40D9] flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    👑 Você já é Premium!
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sua assinatura está ativa e você tem acesso a todos os recursos.
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-[#6C40D9]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Válida até:</span>
                      <span className="text-lg font-bold text-[#6C40D9]">
                        {user?.premium_expires_at ? new Date(user.premium_expires_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Fechar
                </Button>
                <Button 
                  className="flex-1 bg-[#6C40D9] hover:bg-[#5432B8]"
                  onClick={onClose}
                >
                  Ver minha assinatura
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Plan Selection */}
        {step === 1 && !isPremium && (
          <div className="px-6 pb-6 space-y-6">
            <div className="p-6 border-2 border-[#6C40D9] rounded-xl bg-gradient-to-br from-[#6C40D9]/5 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Premium Anual</h3>
                  <p className="text-sm text-gray-500">Acesso completo por 1 ano</p>
                </div>
                <div className="bg-[#00D68F]/10 text-[#00D68F] text-xs font-semibold px-2 py-1 rounded-lg">
                  Economize 17%
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">R$ 100</span>
                  <span className="text-gray-500 mb-1">/ano</span>
                </div>
                <p className="text-sm text-gray-500">ou 10x de R$ 10,00 sem juros</p>
              </div>

              <div className="space-y-2">
                {[
                  'Contas e cartões ilimitados',
                  'Open Banking automático',
                  'Backup diário na nuvem',
                  'Relatórios avançados',
                  'Suporte prioritário',
                  'Sem anúncios'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-[#00D68F]" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-4 bg-[#00D68F]/5 border-2 border-[#00D68F]/20 rounded-xl cursor-pointer hover:bg-[#00D68F]/10 transition-all"
              onClick={() => setStartWithTrial(!startWithTrial)}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                  startWithTrial 
                    ? "bg-[#00D68F] border-[#00D68F]" 
                    : "bg-white border-gray-300"
                )}
              >
                {startWithTrial && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">🎁 Começar com 7 dias grátis</p>
                <p className="text-sm text-gray-600">
                  Teste todos os recursos sem compromisso. Cancele antes e não pague nada.
                </p>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] hover:from-[#5432B8] hover:to-[#6C40D9]"
              onClick={() => {
                if (startWithTrial) {
                  handleStartTrial();
                } else {
                  setStep(2);
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                startWithTrial ? 'Começar teste grátis' : 'Continuar para pagamento'
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="px-6 pb-6 space-y-6">
            <h3 className="font-semibold text-gray-900">Escolha a forma de pagamento</h3>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={cn(
                  "p-4 border-2 rounded-xl transition-all",
                  paymentMethod === 'credit_card' 
                    ? "border-[#6C40D9] bg-[#6C40D9]/5" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <CreditCard className={cn(
                  "w-6 h-6 mx-auto mb-2",
                  paymentMethod === 'credit_card' ? "text-[#6C40D9]" : "text-gray-400"
                )} />
                <p className="text-xs font-medium text-center">Cartão</p>
              </button>

              <button
                onClick={() => setPaymentMethod('pix')}
                className={cn(
                  "p-4 border-2 rounded-xl transition-all",
                  paymentMethod === 'pix' 
                    ? "border-[#6C40D9] bg-[#6C40D9]/5" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Smartphone className={cn(
                  "w-6 h-6 mx-auto mb-2",
                  paymentMethod === 'pix' ? "text-[#6C40D9]" : "text-gray-400"
                )} />
                <p className="text-xs font-medium text-center">PIX</p>
              </button>

              <button
                onClick={() => setPaymentMethod('boleto')}
                className={cn(
                  "p-4 border-2 rounded-xl transition-all",
                  paymentMethod === 'boleto' 
                    ? "border-[#6C40D9] bg-[#6C40D9]/5" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Barcode className={cn(
                  "w-6 h-6 mx-auto mb-2",
                  paymentMethod === 'boleto' ? "text-[#6C40D9]" : "text-gray-400"
                )} />
                <p className="text-xs font-medium text-center">Boleto</p>
              </button>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do cartão</Label>
                  <Input 
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome no cartão</Label>
                  <Input 
                    placeholder="Como está impresso"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input 
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input 
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Parcelamento</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={String(num)}>
                          {num}x de R$ {(100 / num).toFixed(2)} sem juros
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* PIX Info */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  ℹ️ Após confirmar, você receberá um QR Code para pagar via PIX. 
                  Sua assinatura será ativada imediatamente após o pagamento.
                </p>
              </div>
            )}

            {/* Boleto Info */}
            {paymentMethod === 'boleto' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">
                  ⚠️ O boleto será gerado após a confirmação. A aprovação pode 
                  levar de 1 a 2 dias úteis após o pagamento.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-gray-900">Resumo do pedido</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">MoneyNow Premium Anual</span>
                <span className="font-medium">R$ 100,00</span>
              </div>
              {parseInt(installments) > 1 && paymentMethod === 'credit_card' && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{installments}x no cartão de crédito</span>
                  <span>R$ {(100 / parseInt(installments)).toFixed(2)}/mês</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-[#6C40D9]">R$ 100,00</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#00D68F] to-[#00B578] hover:from-[#00B578] hover:to-[#00D68F]"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar pagamento'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="px-6 pb-6">
            {paymentStatus === 'trial_started' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#00D68F]/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-[#00D68F]" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Teste grátis ativado! 🎉
                </h3>

                <p className="text-gray-600">
                  Você tem 7 dias para explorar todos os recursos Premium sem compromisso.
                </p>

                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teste válido até:</span>
                    <span className="font-medium">
                      {new Date(paymentData?.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 Lembre-se: você pode cancelar a qualquer momento nas configurações
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[#00D68F] to-[#00B578]"
                  onClick={handleComplete}
                >
                  Começar a usar Premium
                </Button>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#00D68F]/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-[#00D68F]" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Pagamento confirmado! 🎉
                </h3>

                <p className="text-gray-600">
                  Bem-vindo ao MoneyNow Premium! Sua assinatura está ativa.
                </p>

                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plano:</span>
                    <span className="font-medium">Premium Anual</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">R$ 100,00</span>
                  </div>
                  {paymentData?.installments > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parcelamento:</span>
                      <span className="font-medium">
                        {paymentData.installments}x de R$ {(100 / paymentData.installments).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Válido até:</span>
                    <span className="font-medium">
                      {new Date(paymentData?.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[#00D68F] to-[#00B578]"
                  onClick={handleComplete}
                >
                  Começar a usar Premium
                </Button>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Erro no pagamento
                </h3>

                <p className="text-gray-600">
                  Não foi possível processar seu pagamento. Verifique os dados e tente novamente.
                </p>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={onClose}
                  >
                    Fechar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}