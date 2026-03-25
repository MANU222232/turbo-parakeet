'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type TimelineStatus = 'pending' | 'active' | 'completed';

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  time?: string;
}

export interface OrderTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: TimelineStep[];
}

export function OrderTimeline({ steps, className, ...props }: OrderTimelineProps) {
  return (
    <div className={cn("relative pl-4 space-y-6", className)} {...props}>
      {/* Background track line */}
      <div className="absolute left-[23px] top-[24px] bottom-6 w-0.5 bg-white/10" />

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active';

        return (
          <div key={step.id} className="relative flex items-start gap-5">
            {/* Animated Active Line connecting to next */}
            {!isLast && (isCompleted || isActive) && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "absolute left-2 top-8 w-0.5 z-10",
                  isCompleted ? "bg-safe" : "bg-warning"
                )}
                style={{ bottom: -24 }} // connect to next dot
              />
            )}

            {/* Status Indicator Node */}
            <div className="relative z-20 flex flex-col items-center shrink-0">
              <div 
                className={cn(
                  "flex h-4 w-4 shrink-0 rounded-full border-2 transition-colors duration-500",
                  isCompleted 
                    ? "border-safe bg-safe" 
                    : isActive 
                      ? "border-warning bg-surface" 
                      : "border-white/20 bg-surface",
                  isActive && "animate-pulse"
                )}
              />
            </div>

            {/* Content */}
            <div className={cn(
              "flex-1 min-w-0 pb-1 -mt-1 transition-opacity duration-300",
              step.status === 'pending' && "opacity-40"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <h4 className={cn(
                  "text-small font-bold uppercase tracking-widest leading-none",
                  isCompleted ? "text-safe" : isActive ? "text-warning" : "text-white"
                )}>
                  {step.title}
                </h4>
                {step.time && (
                  <span className="text-micro font-mono text-neutral-400 shrink-0 ml-4">
                    {step.time}
                  </span>
                )}
              </div>
              <p className="text-small text-neutral-400 leading-snug pr-4">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
