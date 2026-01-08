import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  Gift,
  Smartphone,
  Tv,
  Music,
  Dumbbell,
  Coffee,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const iconMap = {
  shopping: ShoppingCart,
  home: Home,
  car: Car,
  food: Utensils,
  health: Heart,
  work: Briefcase,
  education: GraduationCap,
  travel: Plane,
  gift: Gift,
  tech: Smartphone,
  entertainment: Tv,
  music: Music,
  fitness: Dumbbell,
  coffee: Coffee,
  salary: DollarSign,
  investment: TrendingUp
};

export default function TransactionItem({ 
  transaction,
  category,
  account,
  onClick,
  onEdit,
  onDuplicate,
  onDelete,
  onMarkPaid
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const Icon = iconMap[category?.icon] || DollarSign;

  const typeConfig = {
    income: {
      icon: ArrowUpRight,
      prefix: '+',
      color: 'text-[#00D68F]',
      bg: 'bg-[#00D68F]/10'
    },
    expense: {
      icon: ArrowDownRight,
      prefix: '-',
      color: 'text-[#FF5252]',
      bg: 'bg-[#FF5252]/10'
    },
    transfer: {
      icon: ArrowLeftRight,
      prefix: '',
      color: 'text-[#2196F3]',
      bg: 'bg-[#2196F3]/10'
    }
  };

  const config = typeConfig[transaction.type] || typeConfig.expense;

  return (
    <div 
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick?.(transaction)}
    >
      <div 
        className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.bg)}
        style={category?.color ? { backgroundColor: `${category.color}15` } : {}}
      >
        <Icon 
          className="w-5 h-5" 
          style={category?.color ? { color: category.color } : {}}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">
            {transaction.description}
          </h4>
          {!transaction.is_paid && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#FFC107] text-[#FFC107]">
              Pendente
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {category ? (
            <span className="flex items-center gap-1">
              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
            </span>
          ) : (
            <span>Sem categoria</span>
          )}
          <span>•</span>
          <span>{account?.name || transaction.account_id || 'Conta'}</span>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", config.color)}>
          {config.prefix}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-400">
          {format(new Date(transaction.date), "dd MMM", { locale: ptBR })}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!transaction.is_paid && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkPaid?.(transaction); }}>
              <Check className="w-4 h-4 mr-2" />
              Marcar como pago
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(transaction); }}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(transaction); }}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete?.(transaction); }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}