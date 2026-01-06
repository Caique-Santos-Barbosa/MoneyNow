import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend,
  showToggle = false 
}) {
  const [isVisible, setIsVisible] = useState(true);

  const colorStyles = {
    primary: 'from-[#00D68F] to-[#00B578]',
    success: 'from-[#00D68F] to-[#00B578]',
    danger: 'from-[#FF5252] to-[#FF7070]',
    warning: 'from-[#FFC107] to-[#FFD54F]',
    info: 'from-[#2196F3] to-[#64B5F6]',
    secondary: 'from-[#6C40D9] to-[#8A5FE6]'
  };

  const bgColorStyles = {
    primary: 'bg-[#00D68F]/10',
    success: 'bg-[#00D68F]/10',
    danger: 'bg-[#FF5252]/10',
    warning: 'bg-[#FFC107]/10',
    info: 'bg-[#2196F3]/10',
    secondary: 'bg-[#6C40D9]/10'
  };

  const iconColorStyles = {
    primary: 'text-[#00D68F]',
    success: 'text-[#00D68F]',
    danger: 'text-[#FF5252]',
    warning: 'text-[#FFC107]',
    info: 'text-[#2196F3]',
    secondary: 'text-[#6C40D9]'
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300 isolate">
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-10 bg-gradient-to-br -z-10",
        colorStyles[color]
      )} />
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              {showToggle && (
                <button 
                  onClick={() => setIsVisible(!isVisible)}
                  className="text-gray-400 hover:text-gray-600 transition-colors relative z-20"
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isVisible ? formatCurrency(value) : '••••••'}
            </p>
          </div>
          
          {Icon && (
            <div className={cn("p-3 rounded-xl relative z-10", bgColorStyles[color])}>
              <Icon className={cn("w-5 h-5", iconColorStyles[color])} />
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-3">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-[#00D68F]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#FF5252]" />
            )}
            <span className={cn(
              "text-sm font-medium",
              trend > 0 ? "text-[#00D68F]" : "text-[#FF5252]"
            )}>
              {Math.abs(trend)}% vs mês anterior
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}