'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, Navigation, Clock, Phone, ChevronRight, Award, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ShopCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  etaMins: number;
  distanceMi: number;
  rate?: number;
  jobs?: number;
  driver?: string;
  driverInitials?: string;
  truck?: string;
  isOpen?: boolean;
  selected?: boolean;
  isBestMatch?: boolean;
  onClick?: () => void;
}

export function ShopCard({
  name,
  image,
  rating,
  reviews,
  etaMins,
  distanceMi,
  rate = 0,
  jobs = 0,
  driver = '',
  driverInitials,
  truck,
  isOpen = true,
  selected = false,
  isBestMatch = false,
  onClick,
  className,
  onDrag,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onAnimationStart,
  onAnimationEnd,
  ...props
}: ShopCardProps & {
  onDrag?: any;
  onDragStart?: any;
  onDragEnd?: any;
  onDragCancel?: any;
  onAnimationStart?: any;
  onAnimationEnd?: any;
}) {
  const safeProps = Object.fromEntries(
    Object.entries(props).filter(([key]) =>
      !['onDrag', 'onDragStart', 'onDragEnd', 'onDragCancel', 'onAnimationStart', 'onAnimationEnd'].includes(key)
    )
  );

  const ratingColor = rating >= 4.5 ? '#FFD700' : rating >= 4.0 ? '#FFA500' : '#FF6B6B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${name}, ${rating} star rating, ${etaMins} minutes ETA, ${distanceMi.toFixed(1)} miles away`}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl border p-4',
        'bg-gradient-to-br from-[#101010] to-[#0a0a0a]',
        'transition-all duration-200 cursor-pointer',
        'active:scale-[0.98] hover:shadow-2xl',
        selected
          ? 'border-[#10b981] bg-[#10b981]/5 ring-1 ring-[#10b981] shadow-[0_0_30px_#10b98122]'
          : 'border-white/8 hover:border-white/15 hover:bg-white/[0.02]',
        !isOpen && 'opacity-60 grayscale',
        className
      )}
      {...safeProps}
    >
      {/* Best Match Badge - Enhanced */}
      {isBestMatch && (
        <div className="absolute -top-3 left-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 18 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#00D16C] to-[#00E076] text-black px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#00D16C]/40"
          >
            <Award size={11} strokeWidth={3} />
            Best Match
          </motion.div>
        </div>
      )}

      {/* Shop Image - Enhanced */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
        <img
          src={image}
          alt={`${name} - ${driver || 'Service provider'}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        
        {!isOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[9px] font-black uppercase text-white tracking-widest">Closed</span>
          </div>
        )}
        
        {/* Availability indicator - Enhanced */}
        {isOpen && (
          <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-[#00D16C] rounded-full border-2 border-[#101010] animate-pulse shadow-lg shadow-[#00D16C]/50" />
        )}
        
        {/* Quick stats overlay */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-1 rounded-md">
          <Star size={8} className="fill-[#FFD700] text-[#FFD700]" strokeWidth={0} />
          <span className="text-[8px] font-bold text-white">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Details - Enhanced layout */}
      <div className="flex-1 min-w-0 py-1">
        {/* Name and ETA row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="truncate text-base font-bold text-white leading-tight">{name}</h3>
          <motion.div 
            className="flex items-center gap-1.5 bg-[#00D16C]/15 text-[#00D16C] px-2.5 py-1.5 rounded-full shrink-0 border border-[#00D16C]/20"
            whileHover={{ scale: 1.05 }}
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span className="text-xs font-black">{etaMins}m</span>
          </motion.div>
        </div>

        {/* Driver info */}
        {driver && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-[#10b981] to-[#10b981]/70 flex items-center justify-center text-[9px] font-black text-white shadow-md">
              {driver.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <span className="text-xs text-neutral-400 truncate">{driver}</span>
          </div>
        )}

        {/* Rating and distance row - Enhanced */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" strokeWidth={0} style={{ fill: ratingColor }} />
            <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({reviews.toLocaleString()})</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-xs">{distanceMi.toFixed(1)}mi</span>
          </div>
        </div>

        {/* Stats row - Enhanced with completion rate */}
        <div className="flex items-center gap-3">
          {rate > 0 && (
            <div className="flex items-center gap-2 flex-1">
              <Shield size={10} className="text-[#00D16C]" strokeWidth={2.5} />
              <div className="flex-1 h-2 bg-[#181818] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rate}%` }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#00D16C] to-[#00E076] rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold text-[#00D16C] min-w-[32px]">{rate}%</span>
            </div>
          )}
          {jobs > 0 && (
            <div className="flex items-center gap-1 text-neutral-500">
              <Zap size={10} className="text-[#10b981]" />
              <span className="text-[10px]">{jobs.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Select Indicator & Chevron - Enhanced */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{
            scale: selected ? 1 : 0.95,
            borderColor: selected ? '#10b981' : 'rgba(255,255,255,0.15)',
            backgroundColor: selected ? '#10b981' : 'rgba(255,255,255,0)',
            boxShadow: selected ? '0 0 20px rgba(255, 98, 0, 0.4)' : 'none',
          }}
          transition={{ duration: 0.15 }}
          className="h-6 w-6 rounded-full border-2 flex items-center justify-center"
        >
          {selected && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-white stroke-current stroke-[3]"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </motion.div>
        <motion.div
          animate={{
            x: selected ? 4 : 0,
            color: selected ? '#10b981' : 'rgba(163, 163, 163, 0.5)',
          }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-all',
              selected ? 'text-[#10b981]' : 'text-neutral-500 group-hover:text-white'
            )}
          />
        </motion.div>
      </div>

      {/* Hover glow effect - Enhanced */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
          'bg-gradient-to-r from-[#10b981]/8 to-transparent',
          selected && 'opacity-100'
        )}
      />
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#10b981]/20 via-transparent to-transparent blur-xl" />
      </div>
    </motion.div>
  );
}

