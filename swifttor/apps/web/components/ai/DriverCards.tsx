import { motion } from 'motion/react';
import { Star, Truck, MapPin } from 'lucide-react';

interface Driver {
  name: string;
  rating: number;
  vehicle: string;
  distance: number;
  eta_mins: number;
  specializations: string[];
}

export default function DriverCards({ drivers, onSelect }: { drivers: Driver[], onSelect: (driver: Driver) => void }) {
  if (!drivers || drivers.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto py-4 -mx-4 px-4 no-scrollbar w-full">
      {drivers.map((d, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="min-w-[220px] max-w-[240px] bg-slate-900 border-2 border-slate-800 rounded-[28px] p-5 shrink-0 flex flex-col pointer-events-auto hover:border-emerald-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-black italic uppercase tracking-tight text-white">{d.name}</h4>
            <div className="flex items-center text-yellow-500 text-[10px] font-black tracking-widest gap-0.5">
              <Star size={10} fill="currentColor"/>{d.rating}
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 font-bold uppercase tracking-wide">
            <Truck size={14} className="text-emerald-500" />{d.vehicle}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 font-bold uppercase tracking-wide">
            <MapPin size={14} className="text-emerald-500" />{d.eta_mins}m <span className="opacity-50">({d.distance}km)</span>
          </div>

          {d.specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {d.specializations.slice(0, 2).map((spec, sIdx) => (
                <span key={sIdx} className="text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-md">
                  {spec}
                </span>
              ))}
            </div>
          )}

          <button 
            onClick={() => onSelect(d)} 
            className="mt-auto py-3 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-500 border border-emerald-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Select Driver
          </button>
        </motion.div>
      ))}
    </div>
  );
}
