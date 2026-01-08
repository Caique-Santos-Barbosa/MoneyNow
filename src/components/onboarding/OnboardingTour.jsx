import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
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

    const handleResize = () => {
      if (step.element) {
        updateHighlight(step.element);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      } else {
        setHighlightRect(null);
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

  const handleSkip = () => {
    saveProgress(tourSteps.length);
    setIsActive(false);
    onComplete?.();
  };

  const handleComplete = () => {
    saveProgress(tourSteps.length);
    setIsActive(false);
    onComplete?.();
  };

  const saveProgress = (step) => {
    try {
      localStorage.setItem('onboardingCompleted', step >= tourSteps.length ? 'true' : 'false');
      localStorage.setItem('onboarding_step', step.toString());
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  if (!isActive || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence mode="wait">
      {isActive && currentStep < tourSteps.length && (
        <motion.div
          key={`onboarding-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999]"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75"
            onClick={handleSkip}
          />

          {/* Spotlight */}
          {highlightRect && (step.type === 'highlight' || step.type === 'sidebar' || step.type === 'action') && (
            <motion.div
              key={`spotlight-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

          {/* Card */}
          <motion.div
            key={`card-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed w-[90vw] max-w-md z-[10002] bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={(() => {
              // Se for welcome ou não tiver highlight, centralizar completamente
              if (step.type === 'welcome' || !highlightRect) {
                return {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                };
              }

              // Detectar se o elemento está na sidebar (menu lateral)
              const isSidebarElement = highlightRect.left < 300; // Sidebar geralmente tem ~256px
              const cardWidth = Math.min(90 * window.innerWidth / 100, 448); // max-w-md = 448px
              const cardHeight = 300; // Altura estimada do card
              
              // Se está na sidebar, posicionar à direita da sidebar
              if (isSidebarElement) {
                const sidebarWidth = 256; // Largura padrão da sidebar
                const spaceRight = window.innerWidth - highlightRect.left - highlightRect.width;
                const spaceBelow = window.innerHeight - highlightRect.top - highlightRect.height;
                const spaceAbove = highlightRect.top;
                
                // Tentar centralizar verticalmente com o elemento
                let top = highlightRect.top + (highlightRect.height / 2) - (cardHeight / 2);
                
                // Se não couber acima, ajustar para baixo
                if (top < 20) {
                  top = highlightRect.top + highlightRect.height + 24;
                }
                
                // Se não couber abaixo, ajustar para cima
                if (top + cardHeight > window.innerHeight - 20) {
                  top = highlightRect.top - cardHeight - 24;
                }
                
                // Se ainda não couber, centralizar verticalmente na tela
                if (top < 20) {
                  top = (window.innerHeight - cardHeight) / 2;
                }
                
                // Posicionar à direita da sidebar com margem
                const left = sidebarWidth + 24;
                
                return {
                  top: `${Math.max(20, Math.min(top, window.innerHeight - cardHeight - 20))}px`,
                  left: `${left}px`,
                  transform: 'none'
                };
              }
              
              // Para elementos no conteúdo principal, posicionar abaixo ou centralizar
              const spaceBelow = window.innerHeight - (highlightRect.top + highlightRect.height) - 24;
              const spaceAbove = highlightRect.top - 24;
              
              if (spaceBelow >= cardHeight) {
                // Cabe abaixo
                return {
                  top: `${highlightRect.top + highlightRect.height + 24}px`,
                  left: '50%',
                  transform: 'translateX(-50%)'
                };
              } else if (spaceAbove >= cardHeight) {
                // Cabe acima
                return {
                  top: `${highlightRect.top - cardHeight - 24}px`,
                  left: '50%',
                  transform: 'translateX(-50%)'
                };
              } else {
                // Não cabe nem acima nem abaixo, centralizar na tela
                return {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                };
              }
            })()}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
