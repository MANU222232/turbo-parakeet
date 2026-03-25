'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { EmergencyButton } from './EmergencyButton';

export interface QuoteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  serviceName: string;
  description: string;
  partsTotal?: number;
  laborTotal?: number;
  finalTotal: number;
  etaMins: number;
  onAccept: () => void;
}

export function QuoteCard({ 
  serviceName, description, partsTotal = 0, laborTotal = 0, finalTotal, etaMins, onAccept, className, ...props 
}: QuoteCardProps) {
  return (
    <div 
      className={cn("w-full max-w-[320px] rounded-3xl bg-surface border border-white/10 overflow-hidden shadow-2xl my-2", className)}
      {...props}
    >
      {/* Header */}
      <div className="bg-white/5 px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1 text-safe">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-micro font-bold uppercase tracking-widest">Diagnosis Complete</span>
        </div>
        <h4 className="text-h3 font-black text-white">{serviceName}</h4>
        <p className="text-small text-neutral-400 mt-1 leading-snug">{description}</p>
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4 space-y-3">
        {partsTotal > 0 && (
          <div className="flex justify-between items-center text-small">
            <span className="text-neutral-400">Parts/Equipment</span>
            <span className="font-medium text-white">${partsTotal.toFixed(2)}</span>
          </div>
        )}
        {laborTotal > 0 && (
          <div className="flex justify-between items-center text-small">
            <span className="text-neutral-400">Dispatch & Labor</span>
            <span className="font-medium text-white">${laborTotal.toFixed(2)}</span>
          </div>
        )}
        
        <div className="h-px w-full bg-white/5 my-2" />
        
        <div className="flex justify-between items-end">
          <span className="text-small font-bold text-neutral-400 uppercase tracking-widest">Guaranteed Quote</span>
          <span className="text-h1 font-black text-white leading-none">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ETA & Action */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex items-start justify-center gap-4 mb-3 text-micro text-neutral-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {etaMins}m ETA
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Secured
          </div>
        </div>
        <EmergencyButton 
          onClick={onAccept} 
          className="w-full bg-safe text-background hover:bg-safe/90 font-black"
        >
          ACCEPT & DISPATCH NOW
        </EmergencyButton>
      </div>
    </div>
  );
}
