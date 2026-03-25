'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Phone, Star } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface DriverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  driverName: string;
  photoUrl: string;
  rating: number;
  vehicleMake: string;
  vehicleColor: string;
  plateNumber: string;
  etaMins: number;
  status: 'en_route' | 'arrived' | 'completing';
  onCall?: () => void;
}

export function DriverCard({ 
  driverName, photoUrl, rating, vehicleMake, vehicleColor, plateNumber, etaMins, status, onCall, className, ...props 
}: DriverCardProps) {
  
  const statusConfig = {
    en_route: { label: `${etaMins} MINS AWAY`, type: 'warning' as const },
    arrived: { label: 'ARRIVED', type: 'safe' as const },
    completing: { label: 'WORKING', type: 'safe' as const },
  };

  const currentStatus = statusConfig[status];

  return (
    <div 
      className={cn("flex items-center gap-4 rounded-3xl bg-surface p-4 border border-white/5 shadow-2xl", className)}
      {...props}
    >
      {/* large driver avatar */}
      <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={driverName} className="h-full w-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-foreground truncate">{driverName}</h3>
          <StatusBadge status={currentStatus.type} label={currentStatus.label} />
        </div>
        
        <div className="flex items-center gap-2 text-micro">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 truncate">{vehicleColor} {vehicleMake}</span>
        </div>

        <div className="inline-block px-2 py-0.5 mt-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300 tracking-wider">
          {plateNumber}
        </div>
      </div>

      {onCall && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCall(); }}
          className="shrink-0 h-12 w-12 rounded-full bg-safe/10 text-safe border border-safe/20 flex items-center justify-center transition-transform active:scale-95"
          aria-label="Call Driver"
        >
          <Phone className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
