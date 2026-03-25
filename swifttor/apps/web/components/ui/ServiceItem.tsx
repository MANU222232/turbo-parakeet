'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface ServiceItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description?: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
}

export function ServiceItem({ 
  name, description, price, selected, onSelect, className, ...props 
}: ServiceItemProps) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border p-4 transition-all cursor-pointer active:scale-[0.98]",
        selected 
          ? "border-primary bg-primary/10" 
          : "border-white/10 bg-surface hover:border-white/20 hover:bg-white/5",
        className
      )}
      {...props}
    >
      {/* Checkbox indicator */}
      <div className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-primary bg-primary" : "border-neutral-500"
      )}>
        {selected && <Check className="h-4 w-4 text-white stroke-[3]" />}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-body font-bold transition-colors",
          selected ? "text-primary" : "text-foreground"
        )}>
          {name}
        </h4>
        {description && (
          <p className="text-small text-neutral-400 mt-0.5 line-clamp-2 leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className={cn(
        "shrink-0 font-bold text-h3",
        selected ? "text-primary" : "text-foreground"
      )}>
        ${price.toFixed(2)}
      </div>
    </div>
  );
}
