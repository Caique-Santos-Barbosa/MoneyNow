import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumRequiredModal({ 
  isOpen, 
  onClose, 
  title = 'Recurso Premium',
  message,
  feature
}) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate(createPageUrl('Premium'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] p-6 text-white">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-4">
            <Crown className="w-8 h-8 text-yellow-300" />
          </div>
          <h3 className="text-2xl font-bold text-center mb-2">{title}</h3>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <p className="text-gray-600 text-center">{message}</p>
          )}

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">Com o Premium você tem:</p>
            {[
              'Contas e cartões ilimitados',
              'Open Banking automático',
              'Relatórios avançados',
              'Backup diário na nuvem',
              'Alertas inteligentes',
              'Suporte prioritário'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00D68F]/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#00D68F]" />
                </div>
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-1">Por apenas</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">R$ 100</span>
              <span className="text-lg text-gray-500 mb-1">/ano</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">ou 10x de R$ 10,00 sem juros</p>
          </div>

          {/* Trial */}
          <div className="p-3 bg-[#00D68F]/5 border border-[#00D68F]/20 rounded-lg text-center">
            <p className="text-sm text-[#00D68F] font-medium">
              🎁 Experimente 7 dias grátis
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Cancele antes e não pague nada
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Agora não
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] hover:from-[#5432B8] hover:to-[#6C40D9]"
              onClick={handleUpgrade}
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer upgrade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}