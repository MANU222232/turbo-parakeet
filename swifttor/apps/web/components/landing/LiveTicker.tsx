'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const TICKER_ITEMS = [
  { name: 'Alex M.',   service: 'Battery Replaced',   loc: 'Hwy 10',      time: '2m ago'  },
  { name: 'Diana K.',  service: 'Tire Changed',        loc: 'Mombasa Rd',  time: '5m ago'  },
  { name: 'James O.',  service: 'Towed to Station',    loc: 'Ngong Rd',    time: '9m ago'  },
  { name: 'Fatuma A.', service: 'Fuel Delivered',      loc: 'Thika Rd',    time: '14m ago' },
  { name: 'Brian N.',  service: 'Lockout Resolved',    loc: 'Waiyaki Way', time: '18m ago' },
];

export default function LiveTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const item = TICKER_ITEMS[index];

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-3 overflow-hidden">
      {/* Live badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative w-2 h-2">
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live</span>
      </div>

      <div className="w-px h-4 bg-emerald-200 shrink-0" />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-xs text-slate-600 min-w-0"
        >
          <span className="font-bold text-slate-900">{item.name}</span>
          <span>—</span>
          <span>{item.service}</span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline text-slate-500">{item.loc}</span>
          <span className="text-slate-400">·</span>
          <span className="text-emerald-600 font-semibold shrink-0">{item.time}</span>
        </motion.div>
      </AnimatePresence>

      <Zap size={12} className="text-emerald-400 shrink-0 ml-auto" />
    </div>
  );
}
