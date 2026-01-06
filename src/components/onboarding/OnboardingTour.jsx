import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Target,
  Wallet,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from "@/lib/utils";

const tourSteps = [
  {
    id: 1,
    title: '👋 Bem-vindo ao MoneyNow!',
    description: 'Vamos fazer um tour rápido para você conhecer tudo. Leva só 2 minutos!',
    action: 'Vamos lá!',
    type: 'welcome',
    element: null
  },
  {
    id: 2,
    title: 'Menu de Navegação',
    description: 'Aqui você encontra todas as opções do sistema. Vamos conhecer cada uma!',
    type: 'sidebar',
    element: 'nav'
  },
  {
    id: 3,
    title: '📊 Dashboard',
    description: 'Sua visão geral! Aqui você vê receitas, despesas, saldo e gráficos do mês.',
    type: 'highlight',
    element: 'dashboard-link'
  },
  {
    id: 4,
    title: '💰 Contas',
    description: 'Cadastre suas contas bancárias, poupança e dinheiro em espécie.',
    type: 'highlight',
    element: 'accounts-link'
  },
  {
    id: 5,
    title: '💳 Cartões',
    description: 'Adicione seus cartões de crédito e acompanhe as faturas.',
    type: 'highlight',
    element: 'cards-link'
  },
  {
    id: 6,
    title: '↔️ Transações',
    description: 'Registre todas as suas receitas, despesas e transferências.',
    type: 'highlight',
    element: 'transactions-link'
  },
  {
    id: 7,
    title: '📋 Planejamento',
    description: 'Defina quanto quer gastar em cada categoria por mês.',
    type: 'highlight',
    element: 'budget-link'
  },
  {
    id: 8,
    title: '📈 Relatórios',
    description: 'Veja gráficos detalhados dos seus gastos e receitas.',
    type: 'highlight',
    element: 'reports-link'
  },
  {
    id: 9,
    title: '🎯 Botões de Ação Rápida',
    description: 'Use estes botões para registrar rapidamente uma despesa, receita ou transferência!',
    type: 'highlight',
    element: 'quick-actions',
    showArrow: true
  },
  {
    id: 10,
    title: '➕ Adicione sua primeira conta',
    description: 'Clique aqui para cadastrar sua primeira conta bancária. É super rápido!',
    type: 'action',
    element: 'add-account-button',
    action: 'Adicionar conta',
    showPulse: true
  }
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [highlightRect, setHighlightRect] = useState(null);

  useEffect(() => {
    if (!isActive || currentStep >= tourSteps.length) return;
    
    const step = tourSteps[currentStep];
    if (step.element) {
      updateHighlight(step.element);
    }

    window.addEventListener('resize', () => updateHighlight(step.element));
    return () => window.removeEventListener('resize', () => updateHighlight(step.element));
  }, [currentStep, isActive]);

  const updateHighlight = (elementId) => {
    setTimeout(() => {
      const element = document.querySelector(`[data-tour="${elementId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    }, 100);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await saveProgress(tourSteps.length);
    setIsActive(false);
    onComplete?.();
  };

  const handleComplete = async () => {
    await saveProgress(tourSteps.length);
    setIsActive(false);
    onComplete?.();
  };

  const saveProgress = async (step) => {
    try {
      await base44.auth.updateMe({
        onboarding_step: step,
        onboarding_completed: step >= tourSteps.length
      });
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  if (!isActive || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay Escuro */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75"
          onClick={handleSkip}
        />

        {/* Spotlight - recorte iluminado no elemento destacado */}
        {highlightRect && step.type === 'highlight' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute pointer-events-none"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                borderRadius: '12px',
                border: '3px solid #00D68F',
                zIndex: 10000
              }}
            />
            
            {step.showPulse && (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute pointer-events-none"
                style={{
                  top: highlightRect.top - 8,
                  left: highlightRect.left - 8,
                  width: highlightRect.width + 16,
                  height: highlightRect.height + 16,
                  borderRadius: '12px',
                  border: '3px solid #00D68F',
                  zIndex: 9999
                }}
              />
            )}
          </>
        )}

        {/* Seta apontando */}
        {highlightRect && step.showArrow && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute pointer-events-none"
            style={{
              top: highlightRect.top - 60,
              left: highlightRect.left + highlightRect.width / 2 - 20,
              zIndex: 10001
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 35 L20 10 M20 10 L12 18 M20 10 L28 18"
                stroke="#00D68F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}

        {/* Tooltip/Card de Explicação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "absolute bg-white rounded-2xl shadow-2xl overflow-hidden z-[10002]",
            step.type === 'welcome' ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4" :
            highlightRect ? 
              (highlightRect.top > window.innerHeight / 2 
                ? "bottom-[calc(100vh-" + (highlightRect.top - 20) + "px)]" 
                : "top-[calc(" + (highlightRect.top + highlightRect.height + 20) + "px)]") +
              " left-1/2 -translate-x-1/2 w-full max-w-md mx-4"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
          )}
        >
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00D68F] to-[#00B578]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-gray-500">
                Etapa {currentStep + 1} de {tourSteps.length}
              </span>
              <span className="text-xs font-medium text-[#00D68F]">
                {progress.toFixed(0)}% completo
              </span>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Pular tour
                </Button>
              </div>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#00D68F] to-[#00B578] hover:from-[#00B578] hover:to-[#00D68F]"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Concluir
                  </>
                ) : (
                  <>
                    {step.action || 'Próximo'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}