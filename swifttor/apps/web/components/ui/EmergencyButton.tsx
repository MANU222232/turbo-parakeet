'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';

const emergencyButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-[14px] font-black italic uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none overflow-hidden",
  {
    variants: {
      variant: {
        // Emerald primary — matches old app aesthetic
        default:   "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600",
        // Dark slate secondary — used for call/nav CTAs
        secondary: "bg-slate-900 text-white hover:bg-slate-800",
        ghost:     "hover:bg-slate-100 text-slate-900",
        danger:    "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-14 px-8",       // 56px — comfortable mobile hit target
        sm:      "h-11 px-5 text-[12px]",
        icon:    "h-14 w-14",
      },
      pulse: {
        true:  "before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-emerald-400 before:animate-pulse-ring",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pulse: false,
    },
  }
);

export interface EmergencyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof emergencyButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const EmergencyButton = React.forwardRef<HTMLButtonElement, EmergencyButtonProps>(
  ({ className, variant, size, pulse, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Auto-enable pulsing for large default primary buttons unless explicitly disabled
    const shouldPulse = pulse ?? (variant === 'default' && size === 'default');

    return (
      <Comp
        className={cn(emergencyButtonVariants({ variant, size, pulse: shouldPulse, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
EmergencyButton.displayName = "EmergencyButton";

export { EmergencyButton, emergencyButtonVariants };
