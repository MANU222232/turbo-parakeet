'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  "animate-shimmer relative overflow-hidden bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
  {
    variants: {
      variant: {
        text: "rounded h-4 w-full",
        circular: "rounded-full aspect-square",
        card: "rounded-2xl w-full",
        button: "rounded-xl h-14 w-full",
        shopRow: "h-[104px] rounded-2xl", // Matches ShopCard height
        driverRow: "h-[98px] rounded-3xl", // Matches DriverCard height
      },
    },
    defaultVariants: {
      variant: "text",
    },
  }
);

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function LoadingSkeleton({ className, variant, ...props }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}
