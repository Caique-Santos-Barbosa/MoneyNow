import React from 'react';
import { Crown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function PremiumBadge({ size = 'sm', variant = 'default' }) {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'gradient') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] text-white font-semibold ${sizeStyles[size]}`}>
        <Crown className={`${iconSizes[size]} text-yellow-300`} />
        Premium
      </div>
    );
  }

  return (
    <Badge className={`bg-[#6C40D9]/10 text-[#6C40D9] border-[#6C40D9]/20 font-semibold ${sizeStyles[size]}`}>
      <Crown className={`${iconSizes[size]} text-[#6C40D9] mr-1`} />
      Premium
    </Badge>
  );
}