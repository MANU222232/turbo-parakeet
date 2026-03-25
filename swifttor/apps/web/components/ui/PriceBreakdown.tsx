'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

export interface PriceLineItem {
  id: string;
  label: string;
  amount: number;
  tooltip?: string;
}

export interface PriceBreakdownProps extends React.HTMLAttributes<HTMLDivElement> {
  items: PriceLineItem[];
  taxRate?: number; // e.g. 0.08 for 8%
  currencySymbol?: string;
}

export function PriceBreakdown({ 
  items, taxRate = 0.08, currencySymbol = '$', className, ...props 
}: PriceBreakdownProps) {
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatPrice = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;

  return (
    <div className={cn("flex flex-col space-y-4", className)} {...props}>
      {/* Line Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 min-w-0 pr-4">
              <span className="text-small text-neutral-300 truncate">{item.label}</span>
              {item.tooltip && (
                <div className="group relative shrink-0">
                  <HelpCircle className="h-3 w-3 text-neutral-500 cursor-help" />
                  <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full w-48 p-2 rounded-lg bg-neutral-900 border border-white/10 text-[10px] text-neutral-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                    {item.tooltip}
                    {/* Tooltip Arrow */}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-[4px] border-transparent border-t-neutral-900" />
                  </div>
                </div>
              )}
            </div>
            <span className="text-small font-semibold text-white shrink-0">
              {formatPrice(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* Subtotal & Tax */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-small text-neutral-400">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-small text-neutral-400">
          <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-end pt-2">
        <span className="text-body font-bold text-white uppercase tracking-wider">Total</span>
        <span className="text-h1 font-black text-white leading-none">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
