'use client';

import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Battery, Disc, Fuel, Lock, Wrench, CheckCircle, Zap, Clock, DollarSign } from 'lucide-react';

const SERVICES = [
  { id: 's1', name: 'Towing', price: 65.00, duration: '45 mins', icon: Truck, color: '#FF6200', desc: 'Professional tow service' },
  { id: 's2', name: 'Battery Jump', price: 45.00, duration: '20 mins', icon: Battery, color: '#4FC3F7', desc: 'Jump start or replace' },
  { id: 's3', name: 'Tire Change', price: 50.00, duration: '30 mins', icon: Disc, color: '#00D16C', desc: 'Flat tire replacement' },
  { id: 's4', name: 'Fuel Delivery', basePrice: 35.00, duration: '15 mins', icon: Fuel, color: '#FFD700', desc: 'Emergency fuel drop' },
  { id: 's5', name: 'Lockout', basePrice: 40.00, duration: '15 mins', icon: Lock, color: '#FF6B6B', desc: 'Car door unlock' },
  { id: 's6', name: 'Mobile Mechanic', basePrice: 120.00, duration: '60 mins', icon: Wrench, color: '#A855F7', desc: 'On-site repairs' },
];

interface ServiceCardProps {
  svc: typeof SERVICES[0];
  isSelected: boolean;
  computedPrice: number;
  onToggle: () => void;
}

function ServiceCard({ svc, isSelected, computedPrice, onToggle }: ServiceCardProps) {
  const Icon = svc.icon;
  
  return (
    <motion.button
      key={svc.id}
      onClick={onToggle}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${
        isSelected
          ? 'border-[#00D16C] bg-[#00D16C]/10 shadow-lg shadow-[#00D16C]/20'
          : 'border-white/10 bg-[#101010]/80 hover:bg-[#181818] hover:border-white/20'
      }`}
    >
      {/* Selection glow effect */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-[#00D16C]/5 to-transparent pointer-events-none"
        />
      )}
      
      {/* Icon with color */}
      <div className="flex justify-between items-start mb-3 relative">
        <motion.div 
          className={`p-2.5 rounded-xl h-11 w-11 flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-[#00D16C] text-white shadow-lg shadow-[#00D16C]/40' 
              : 'bg-[#181818] text-neutral-400'
          }`}
          animate={{
            scale: isSelected ? 1.05 : 1,
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </motion.div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <CheckCircle className="text-[#00D16C]" size={22} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Service name */}
      <p className={`text-sm font-bold mb-1.5 relative ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
        {svc.name}
      </p>
      
      {/* Description */}
      <p className="text-[10px] text-neutral-500 mb-2 line-clamp-1">{svc.desc}</p>
      
      {/* Price and duration */}
      <div className="flex items-center justify-between mt-1 relative">
        <div className="flex items-center gap-1">
          <DollarSign size={12} className={isSelected ? 'text-[#00D16C]' : 'text-neutral-500'} />
          <span className={`text-base font-black italic tracking-tighter ${
            isSelected ? 'text-[#00D16C]' : 'text-neutral-400'
          }`}>
            ${computedPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} className="text-neutral-600" />
          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide">
            {svc.duration}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function ServiceCatalog({ shop }: { shop: any }) {
  const cartStore = useCartStore();

  const handleToggle = (svc: any, calculatedPrice: number) => {
    cartStore.setShopId(shop.id);
    const existing = cartStore.items.find((i: any) => i.id === svc.id);
    if (existing) {
      cartStore.removeItem(svc.id);
    } else {
      cartStore.addItem({
        id: svc.id,
        name: svc.name,
        price: calculatedPrice,
        type: 'service',
        duration: svc.duration
      });
    }
  };

  const hasTowing = cartStore.items.some((i: any) => i.name === 'Towing');
  const hasTire = cartStore.items.some((i: any) => i.name === 'Tire Change');
  const bundleActive = hasTowing && hasTire;
  const bundleSavings = 20;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4 px-1 flex items-center gap-2">
        <Zap size={14} className="text-[#FF6200]" />
        Available Services
      </h3>

      {/* Bundle notification */}
      <AnimatePresence>
        {bundleActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="mb-4 px-4 py-3 bg-gradient-to-r from-[#00D16C]/15 to-[#00D16C]/5 border border-[#00D16C]/40 rounded-2xl flex items-center gap-3"
          >
            <motion.div 
              className="w-9 h-9 rounded-full bg-[#00D16C] flex items-center justify-center text-white shadow-lg shadow-[#00D16C]/40"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle size={18} strokeWidth={2.5} />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#00D16C] uppercase tracking-tight">Bundle Applied!</p>
              <p className="text-[10px] text-neutral-400">Towing + Tire Change saves you <span className="text-[#00D16C] font-bold">${bundleSavings}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {SERVICES.map(svc => {
          const isSelected = cartStore.items.some((i: any) => i.id === svc.id);

          let computedPrice: number = svc.basePrice || svc.price || 0;
          if (svc.name === 'Towing' && shop) {
            computedPrice = shop.base_price + (shop.distance_km * shop.per_mile_rate);
          }

          return (
            <ServiceCard
              key={svc.id}
              svc={svc}
              isSelected={isSelected}
              computedPrice={computedPrice}
              onToggle={() => handleToggle(svc, computedPrice)}
            />
          );
        })}
      </div>
      
      {/* Quick stats */}
      <motion.div 
        className="mt-4 p-3 bg-[#101010]/80 border border-white/5 rounded-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between text-[10px] text-neutral-500">
          <span>{cartStore.items.filter((i: any) => i.type === 'service').length} services selected</span>
          <span className="flex items-center gap-1">
            <Zap size={10} className="text-[#FF6200]" />
            Avg. arrival: 25 mins
          </span>
        </div>
      </motion.div>
    </div>
  );
}
