import React from 'react';
import { 
  CreditCard,
  MoreVertical,
  Edit,
  Trash2,
  Receipt,
  Plus
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const brandLogos = {
  visa: '💳',
  mastercard: '💳',
  elo: '💳',
  amex: '💳',
  hipercard: '💳',
  other: '💳'
};

export default function CreditCardItem({ 
  card, 
  onEdit,
  onDelete,
  onViewInvoice,
  onAddExpense
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const usedPercentage = card.limit > 0 ? (card.current_invoice / card.limit) * 100 : 0;
  const availableLimit = card.limit - card.current_invoice;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-[#FF5252]';
    if (percentage >= 70) return 'bg-[#FFC107]';
    return 'bg-[#00D68F]';
  };

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ 
        background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)` 
      }}
    >
      <div className="p-5 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{brandLogos[card.brand]}</span>
            <span className="text-xs uppercase tracking-wide opacity-80 font-medium">
              {card.brand}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(card)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewInvoice?.(card)}>
                <Receipt className="w-4 h-4 mr-2" />
                Ver fatura
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddExpense?.(card)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar gasto
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(card)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-lg">{card.name}</h3>
          <p className="text-white/60 text-sm tracking-widest">
            •••• •••• •••• {card.last_digits}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Fatura atual</span>
            <span className="font-semibold">{formatCurrency(card.current_invoice)}</span>
          </div>
          
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                getProgressColor(usedPercentage)
              )}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-white/60">
            <span>Limite disponível: {formatCurrency(availableLimit)}</span>
            <span>{usedPercentage.toFixed(0)}% usado</span>
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <div>
            <span className="text-white/60">Fecha dia</span>
            <p className="font-semibold">{card.closing_day}</p>
          </div>
          <div className="text-right">
            <span className="text-white/60">Vence dia</span>
            <p className="font-semibold">{card.due_day}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}