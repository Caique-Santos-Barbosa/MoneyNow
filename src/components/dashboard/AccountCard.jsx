import React, { useState } from 'react';
import { 
  Wallet, 
  PiggyBank, 
  Building2, 
  TrendingUp, 
  Eye, 
  EyeOff,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRightLeft
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const iconMap = {
  wallet: Wallet,
  'piggy-bank': PiggyBank,
  building: Building2,
  'trending-up': TrendingUp
};

export default function AccountCard({ 
  account, 
  showBalance = true,
  onEdit,
  onDelete,
  onAddTransaction
}) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(showBalance);
  const Icon = iconMap[account.icon] || Wallet;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const typeLabels = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    cash: 'Dinheiro',
    investment: 'Investimento'
  };

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: account.color }}
      />
      
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${account.color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color: account.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{account.name}</h3>
              <p className="text-xs text-gray-500">{typeLabels[account.type]}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(account)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTransaction?.(account)}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Nova transação
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(account)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Saldo atual</p>
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-lg font-bold",
                account.current_balance >= 0 ? "text-gray-900" : "text-[#FF5252]"
              )}>
                {isBalanceVisible ? formatCurrency(account.current_balance) : '••••••'}
              </p>
              <button 
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isBalanceVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {account.bank && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              {account.bank}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}