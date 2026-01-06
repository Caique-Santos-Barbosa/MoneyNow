import React from 'react';
import { cn } from "@/lib/utils";

export default function EmptyState({ 
  icon: Icon, 
  message, 
  hint,
  action,
  className 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      <p className="text-gray-600 font-medium mb-1">{message}</p>
      
      {hint && (
        <p className="text-sm text-gray-400 mb-4 max-w-sm">{hint}</p>
      )}
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}