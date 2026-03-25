'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  image: string;
  price: number;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({ 
  name, image, price, quantity, onIncrement, onDecrement, className, ...props 
}: ProductCardProps) {
  return (
    <div 
      className={cn("flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface", className)}
      {...props}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-neutral-900 border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover p-4 hover:scale-105 transition-transform" />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3">
        <h4 className="text-small font-bold text-foreground line-clamp-2 leading-tight mb-1">
          {name}
        </h4>
        <div className="text-h3 font-black text-white mt-auto mb-3">
          ${price.toFixed(2)}
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-1 border border-white/10">
          <button 
            onClick={onDecrement}
            disabled={quantity === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-foreground transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10"
            aria-label="Decrease quantity"
          >
            <Minus strokeWidth={3} className="h-4 w-4" />
          </button>
          
          <span className="w-8 text-center text-body font-bold text-white">
            {quantity}
          </span>
          
          <button 
            onClick={onIncrement}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-all active:scale-95 hover:bg-white/20"
            aria-label="Increase quantity"
          >
            <Plus strokeWidth={3} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
