'use client'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050510] flex flex-col pt-20">
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/5 rounded-full animate-pulse" />
            <div className="h-3 w-48 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Chat Bubble Skeletons */}
        <div className="space-y-6">
          <div className="flex justify-start">
            <div className="h-20 w-3/4 bg-white/5 rounded-3xl rounded-tl-none animate-pulse" />
          </div>
          <div className="flex justify-end">
            <div className="h-12 w-1/2 bg-white/10 rounded-3xl rounded-tr-none animate-pulse" />
          </div>
          <div className="flex justify-start">
            <div className="h-32 w-2/3 bg-emerald-500/5 rounded-3xl rounded-tl-none animate-pulse border border-emerald-500/10" />
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-6 bg-slate-900/50 border-t border-white/5">
        <div className="max-w-4xl mx-auto h-12 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
