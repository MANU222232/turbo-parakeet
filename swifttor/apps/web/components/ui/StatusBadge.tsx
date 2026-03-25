import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      status: {
        safe: "border-safe/20 bg-safe/10 text-safe",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-primary/20 bg-primary/10 text-primary",
        neutral: "border-white/10 bg-white/5 text-slate-400",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

const dotVariants = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    status: {
      safe: "bg-safe animate-pulse",
      warning: "bg-warning",
      danger: "bg-primary animate-pulse",
      neutral: "bg-slate-400",
    },
  },
  defaultVariants: {
    status: "neutral",
  },
});

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label: string;
}

export function StatusBadge({ className, status, label, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(badgeVariants({ status }), className)} {...props}>
      <span className={cn(dotVariants({ status }))} />
      {label}
    </div>
  );
}
