'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, Navigation } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface ShopCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  etaMins: number;
  distanceMi: number;
  isOpen?: boolean;
  selected?: boolean;
}

export function ShopCard({ 
  name, 
  image, 
  rating, 
  reviews, 
  etaMins, 
  distanceMi, 
  isOpen = true, 
  selected = false, 
  className,
  // Destructure and ignore non-DOM props to prevent React warnings
  id,
  rate,
  jobs,
  driver,
  driverInitials,
  truck,
  lat,
  lng,
  address,
  phone,
  ...props 
}: ShopCardProps & { [key: string]: any }) {
  return (
    <div 
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border p-3 bg-surface transition-all active:scale-[0.98] cursor-pointer",
        selected 
          ? "border-safe bg-safe/5 ring-1 ring-safe" 
          : "border-white/10 hover:border-white/20",
        !isOpen && "opacity-60 grayscale",
        className
      )}
      {...props}
    >
      {/* Shop Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" />
        {!isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase text-white">Closed</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="truncate text-body font-bold text-foreground">{name}</h3>
          {isOpen && <StatusBadge status="safe" label={`${etaMins}m ETA`} className="shrink-0" />}
        </div>
        
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-small font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-micro text-neutral-400">({reviews})</span>
        </div>

        <div className="flex items-center gap-1.5 text-micro text-neutral-400">
          <Navigation className="h-3 w-3" />
          <span>{distanceMi.toFixed(1)} mi away</span>
        </div>
      </div>

      {/* Select Indicator */}
      <div className={cn(
        "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 transition-colors",
        selected ? "border-safe bg-safe" : "border-white/20"
      )}>
        {selected && (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-surface stroke-current stroke-2 p-0.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  );
}
