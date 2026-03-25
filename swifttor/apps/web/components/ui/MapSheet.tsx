'use client';

import * as React from 'react';
import { motion, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MapSheetProps {
  children: React.ReactNode;
  snapPoints?: [number, number, number]; // e.g [80, 400, window.innerHeight - 40] representing pixels from BOTTOM
  defaultSnap?: number;
}

export function MapSheet({ 
  children, 
  snapPoints = [80, 400, 800], // Default peek, half, full
  defaultSnap = 400
}: MapSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [currentSnap, setCurrentSnap] = React.useState(defaultSnap);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use pixel height from bottom
  React.useEffect(() => {
    controls.start({ y: `calc(100vh - ${defaultSnap}px)` });
  }, [defaultSnap, controls]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Determine velocity and drag direction
    const isDraggingUp = info.velocity.y < -20;
    const isDraggingDown = info.velocity.y > 20;
    const dragDistance = info.offset.y;
    
    // Find closest snap point by projecting the movement
    // Since constraints are relative to 0 (top of viewport), y represents pixels from top.
    const currentYFromBottom = window.innerHeight - (info.point.y);
    const projectedYFromBottom = currentYFromBottom - (info.velocity.y * 0.1); 

    let targetSnap = currentSnap;

    if (isDraggingUp) {
      // Find the next largest snap point
      targetSnap = snapPoints.find(point => point > currentSnap) || snapPoints[snapPoints.length - 1];
    } else if (isDraggingDown) {
      // Find the next smallest snap point
      targetSnap = [...snapPoints].reverse().find(point => point < currentSnap) || snapPoints[0];
    } else {
      // No high velocity, snap to closest
      targetSnap = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - projectedYFromBottom) < Math.abs(prev - projectedYFromBottom) ? curr : prev
      );
    }

    setCurrentSnap(targetSnap);
    controls.start({ 
      y: `calc(100vh - ${targetSnap}px)`,
      transition: { type: "spring", bounce: 0, duration: 0.4 }
    });
  };

  return (
    <>
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ 
          top: `calc(100vh - ${snapPoints[2]}px)`, 
          bottom: `calc(100vh - ${snapPoints[0]}px)` 
        } as any}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: "100vh" }}
        className={cn(
          "fixed left-0 right-0 bottom-0 z-40 h-[100vh] rounded-t-3xl border border-white/10 bg-surface/95 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)] flex flex-col pt-1"
        )}
      >
        {/* Drag Handle Area - NOW THE EXCLUSIVE DRAG TRIGGER */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="w-full flex justify-center py-5 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="h-1.5 w-12 rounded-full bg-slate-300 shadow-sm" />
        </div>

        {/* Content Area (scrollable internally if content exceeds current snap) */}
        <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pb-24 no-scrollbar">
          {children}
        </div>
      </motion.div>
    </>
  );
}
