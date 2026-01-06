import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QuickActionButton({ 
  icon: Icon, 
  label, 
  color = 'primary',
  onClick 
}) {
  const colorStyles = {
    primary: 'bg-[#00D68F] hover:bg-[#00B578] text-white',
    success: 'bg-[#00D68F] hover:bg-[#00B578] text-white',
    danger: 'bg-[#FF5252] hover:bg-[#FF3333] text-white',
    warning: 'bg-[#FFC107] hover:bg-[#FFB300] text-gray-900',
    info: 'bg-[#2196F3] hover:bg-[#1976D2] text-white',
    secondary: 'bg-[#6C40D9] hover:bg-[#5432B8] text-white'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "isolate flex flex-col items-center justify-center h-20 w-full rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        colorStyles[color]
      )}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </Button>
  );
}