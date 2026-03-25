'use client';

import { useCartStore } from '@/store/useCartStore';
import { motion } from 'motion/react';
import { Truck, Battery, Disc, Fuel, Lock, Wrench, CheckCircle } from 'lucide-react';

const SERVICES = [
  { id: 's1', name: 'Towing', price: 65.00, duration: '45 mins', icon: Truck },
  { id: 's2', name: 'Battery Jump', price: 45.00, duration: '20 mins', icon: Battery },
  { id: 's3', name: 'Tire Change', price: 50.00, duration: '30 mins', icon: Disc },
  { id: 's4', name: 'Fuel Delivery', basePrice: 35.00, duration: '15 mins', icon: Fuel },
  { id: 's5', name: 'Lockout', basePrice: 40.00, duration: '15 mins', icon: Lock },
  { id: 's6', name: 'Mobile Mechanic', basePrice: 120.00, duration: '60 mins', icon: Wrench },
];

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

  return (
    <div className="mb-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Available Services</h3>
      
      {bundleActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/50 rounded-2xl flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-tight">Bundle Active!</p>
            <p className="text-xs text-slate-400">Towing + Tire Change saves you $20.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {SERVICES.map(svc => {
          const Icon = svc.icon;
          const isSelected = cartStore.items.some((i: any) => i.id === svc.id);
          
          let computedPrice: number = svc.basePrice || svc.price || 0; 
          if (svc.name === 'Towing' && shop) {
            computedPrice = shop.base_price + (shop.distance_km * shop.per_mile_rate);
          }
          
          return (
            <button
              key={svc.id}
              onClick={() => handleToggle(svc, computedPrice)}
              className={`p-4 rounded-3xl border-2 text-left transition-all ${
                isSelected 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center ${
                  isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon size={20} />
                </div>
                {isSelected && <CheckCircle className="text-emerald-500" size={20} />}
              </div>
              <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {svc.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-emerald-500 font-black italic tracking-tighter">
                  ${computedPrice.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {svc.duration}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
