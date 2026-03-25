'use client'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Skeleton Map Background */}
      <div className="absolute inset-0 bg-slate-900/50 animate-pulse" />
      
      {/* Skeleton Sidebar/Search */}
      <div className="absolute top-20 left-4 w-80 z-20 space-y-4">
        <div className="h-12 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
        <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
      </div>

      {/* Center Pulse (User Location) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest uppercase">
          Initializing Spatial Node...
      </div>
    </div>
  )
}
