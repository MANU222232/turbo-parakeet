'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Map, ChevronRight } from 'lucide-react';

export default function Step3({ onPrev }: { onPrev: () => void }) {
  const router = useRouter();

  const handleRoute = (path: string) => {
    // Save minimal data if bypassing checkout directly
    router.push(path);
  };

  return (
    <div className="h-full flex flex-col px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8 pt-6 pb-32"
      >
        
        {/* Step Indicator & Header */}
        <div className="space-y-1 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/80">Analysis Complete</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">We&apos;re<br/>Ready.</h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Choose your specialized recovery protocol.</p>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* Card A: Browse Shops */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleRoute('/service-map')}
            className="flex-1 min-h-[160px] relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 text-left flex flex-col justify-end group transition-all duration-500 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5"
          >
            <div className="absolute top-6 right-6 h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:rotate-12 transition-all duration-500">
              <Map className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors leading-none">
              Browse Shops
            </h3>
            <p className="text-xs text-slate-500 max-w-[80%] pr-4 leading-relaxed font-medium">
              Access the tactical map to manually dispatch verified recovery providers.
            </p>

            <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <ChevronRight className="h-6 w-6 text-emerald-500" />
            </div>
            
            {/* Decorative Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none" />
          </motion.button>
          
        </div>
      </motion.div>
    </div>
  );
}
