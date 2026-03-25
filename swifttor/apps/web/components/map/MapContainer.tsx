'use client';

import { Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapContainer() {
  return (
    <div className="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner group flex items-center justify-center">
      {/* Mock Map Grid */}
      <div className="absolute inset-0 opacity-20" 
            style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Mock Roads */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-8 bg-slate-200 -rotate-12" />
        <div className="absolute top-0 left-1/3 w-8 h-full bg-slate-200 rotate-6" />
        <div className="absolute bottom-1/4 left-0 w-full h-12 bg-slate-200 rotate-3" />
      </div>

      {/* Mock Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Client Marker */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />
            <div className="bg-red-500 p-2 rounded-full shadow-lg border-2 border-white relative z-10">
              <MapPin size={16} color="white" />
            </div>
          </div>
        </motion.div>

        {/* Truck Marker (en route) */}
        <motion.div 
          animate={{ 
            left: ['40%', '50%'],
            top: ['40%', '50%']
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="bg-slate-900 p-2 rounded-full shadow-lg border-2 border-white animate-pulse">
            <Truck size={16} color="white" />
          </div>
        </motion.div>

        {/* Nearby Drivers - Static placement */}
        {[0, 1, 2, 3].map((_, i) => (
          <div 
            key={i}
            className="absolute opacity-40"
            style={{ 
              left: `${20 + (i * 25)}%`, 
              top: `${15 + (i * 30)}%` 
            }}
          >
            <div className="bg-emerald-500 p-1.5 rounded-full shadow-md border border-white">
              <Truck size={12} color="white" />
            </div>
          </div>
        ))}
      </div>

      {/* Static Mode Badge */}
      <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        Live Demo
      </div>
    </div>
  );
}
