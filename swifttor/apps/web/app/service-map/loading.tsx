'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070707] relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070707] via-[#0a0a0a] to-[#0d1117]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Map skeleton */}
      <div className="absolute inset-0">
        <div className="absolute inset-20 bg-white/[0.02] rounded-full animate-pulse" />
        <div className="absolute inset-40 bg-white/[0.02] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Top bar skeleton */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center justify-between mb-3">
          <motion.div 
            className="h-11 w-11 rounded-full bg-white/[0.05] border border-white/[0.05]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="h-11 w-11 rounded-full bg-white/[0.05] border border-white/[0.05]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
        
        {/* Search bar skeleton */}
        <motion.div 
          className="h-11 rounded-full bg-white/[0.05] border border-white/[0.05] mb-3"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
        
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <motion.div 
            className="flex-1 h-10 rounded-full bg-white/[0.05] border border-white/[0.05]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="w-20 h-10 rounded-full bg-white/[0.05] border border-white/[0.05]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.25 }}
          />
          <motion.div 
            className="w-16 h-10 rounded-full bg-white/[0.05] border border-white/[0.05]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Center pulse (User Location) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div 
          className="w-32 h-32 bg-[#FF6200]/10 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#FF6200]/15 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.1, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#FF6200] rounded-full border-2 border-white shadow-lg shadow-[#FF6200]/50" />
      </div>

      {/* Driver markers skeleton */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-10 h-10 rounded-full bg-[#FF6200]/20 border-2 border-[#FF6200]/40"
          style={{
            top: `${20 + (i % 3) * 25}%`,
            left: `${15 + i * 18}%`,
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}

      {/* Bottom sheet skeleton */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-2">
          <motion.div 
            className="w-12 h-1.5 rounded-full bg-white/[0.1]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        {/* Sheet content */}
        <div className="bg-[#101010]/95 backdrop-blur-xl rounded-t-3xl border-t border-l border-r border-white/[0.05] p-4 pb-8">
          {/* Sort pills */}
          <div className="flex gap-2 mb-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-8 w-24 rounded-full bg-white/[0.05]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          
          {/* Shop cards */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 + i * 0.15 }}
              >
                <div className="h-20 w-20 rounded-xl bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/[0.05]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading text */}
      <motion.div 
        className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.div 
            className="w-2 h-2 bg-[#FF6200] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div 
            className="w-2 h-2 bg-[#FF6200] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 bg-[#FF6200] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">
          Finding nearby drivers
        </p>
      </motion.div>
    </div>
  )
}
