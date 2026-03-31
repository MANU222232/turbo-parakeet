'use client';

import * as React from 'react';
import { motion, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronUp, GripVertical } from 'lucide-react';

export interface MapSheetProps {
  children: React.ReactNode;
  snapPoints?: [number, number, number];
  defaultSnap?: number;
  title?: string;
  subtitle?: string;
}

export function MapSheet({
  children,
  snapPoints = [100, 380, 650],
  defaultSnap = 380,
  title,
  subtitle,
}: MapSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [currentSnap, setCurrentSnap] = React.useState(defaultSnap);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    controls.start({ y: `calc(100vh - ${defaultSnap}px)` });
  }, [defaultSnap, controls]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);

    const currentYFromBottom = window.innerHeight - (info.point.y);
    const velocity = info.velocity.y;

    // Determine target snap based on drag direction and velocity
    let targetSnap = currentSnap;

    if (velocity < -50) {
      // Dragging up - go to next larger snap
      targetSnap = snapPoints.find(point => point > currentSnap) ?? snapPoints[snapPoints.length - 1];
    } else if (velocity > 50) {
      // Dragging down - go to next smaller snap
      targetSnap = [...snapPoints].reverse().find(point => point < currentSnap) ?? snapPoints[0];
    } else {
      // Snap to closest
      targetSnap = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - currentYFromBottom) < Math.abs(prev - currentYFromBottom) ? curr : prev
      );
    }

    setCurrentSnap(targetSnap);
    controls.start({
      y: `calc(100vh - ${targetSnap}px)`,
      transition: { type: "spring", bounce: 0.12, duration: 0.4, stiffness: 280, damping: 25 }
    });
  };

  const handleExpand = () => {
    const targetSnap = snapPoints[snapPoints.length - 1];
    setCurrentSnap(targetSnap);
    controls.start({
      y: `calc(100vh - ${targetSnap}px)`,
      transition: { type: "spring", bounce: 0.12, duration: 0.4, stiffness: 280 }
    });
  };

  const handleCollapse = () => {
    const targetSnap = snapPoints[0];
    setCurrentSnap(targetSnap);
    controls.start({
      y: `calc(100vh - ${targetSnap}px)`,
      transition: { type: "spring", bounce: 0.12, duration: 0.4, stiffness: 280 }
    });
  };

  // Calculate progress percentage for visual indicator
  const progressPercent = ((currentSnap - snapPoints[0]) / (snapPoints[2] - snapPoints[0])) * 100;

  return (
    <>
      {/* Backdrop shadow - enhanced gradient */}
      <div
        className="fixed inset-0 bg-black/30 pointer-events-none z-30 transition-all duration-300"
        style={{
          opacity: progressPercent / 100,
          backdropFilter: `blur(${progressPercent * 0.02}px)`,
        }}
      />

      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{
          top: `calc(100vh - ${snapPoints[2]}px)`,
          bottom: `calc(100vh - ${snapPoints[0]}px)`
        } as any}
        dragElastic={0.1}
        dragMomentum={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: '100vh' }}
        className={cn(
          "fixed left-0 right-0 bottom-0 z-40 h-[100vh] rounded-t-3xl",
          "bg-gradient-to-b from-[#0a0a0a]/98 via-[#0a0a0a]/96 to-[#0a0a0a]/95",
          "backdrop-blur-3xl",
          "shadow-[0_-40px_80px_rgba(0,0,0,0.7)]",
          "border-t border-l border-r border-white/8",
          "flex flex-col pt-2",
          "overflow-hidden"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Service providers panel"
      >
        {/* Drag Handle Area - Enhanced design */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="w-full flex flex-col items-center py-4 cursor-grab active:cursor-grabbing touch-none select-none group"
          role="slider"
          aria-valuenow={currentSnap}
          aria-valuemin={snapPoints[0]}
          aria-valuemax={snapPoints[2]}
          aria-label="Drag to resize panel"
        >
          {/* Handle bar - Enhanced with glow */}
          <div className="relative mb-3">
            <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-white/15 via-white/25 to-white/15 transition-all duration-200 group-hover:from-white/25 group-hover:via-white/35 group-hover:to-white/25" />
            <div className="absolute inset-0 w-14 h-1.5 rounded-full bg-[#FF6200]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>

          {/* Title and expand/collapse controls */}
          <div className="flex items-center gap-3">
            {title && (
              <h2 className="text-xs font-black text-white uppercase tracking-widest">{title}</h2>
            )}
            {subtitle && (
              <span className="text-[10px] text-neutral-500 font-medium">{subtitle}</span>
            )}

            {/* Expand/Collapse buttons - Enhanced */}
            <div className="flex items-center gap-1.5 ml-2">
              <motion.button
                onClick={handleExpand}
                disabled={currentSnap === snapPoints[snapPoints.length - 1]}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Expand panel"
              >
                <ChevronUp size={15} className="text-neutral-400" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                onClick={handleCollapse}
                disabled={currentSnap === snapPoints[0]}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 rotate-180"
                aria-label="Collapse panel"
              >
                <ChevronUp size={15} className="text-neutral-400" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* Progress indicator - Enhanced with gradient */}
          <div className="flex items-center gap-2 mt-3">
            {snapPoints.map((snap, index) => {
              const isActive = currentSnap >= snap;
              const isCurrent = index === Math.floor(progressPercent / (100 / (snapPoints.length - 1)));
              
              return (
                <div
                  key={snap}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'w-8 bg-gradient-to-r from-[#FF6200] to-[#FF6200]/80 shadow-lg shadow-[#FF6200]/30' 
                      : 'w-1.5 bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pb-24 no-scrollbar scroll-smooth"
        >
          {children}
        </div>

        {/* Gradient fade at bottom - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none" />
        
        {/* Side glow effects */}
        <div className="absolute bottom-0 left-0 w-24 h-48 bg-gradient-to-r from-[#FF6200]/5 to-transparent pointer-events-none rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-24 h-48 bg-gradient-to-l from-[#FF6200]/5 to-transparent pointer-events-none rounded-br-3xl" />
      </motion.div>
    </>
  );
}
