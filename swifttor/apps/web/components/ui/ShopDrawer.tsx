'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Truck, ShoppingCart, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Shop } from '@/lib/constants/shops';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

/* ── Services catalogue ──────────────────────────────────── */
const SERVICES = [
  { id: 'towing',    name: 'Towing',           icon: '🚛', price: 75,  desc: '+$5/mile' },
  { id: 'battery',  name: 'Battery Service',   icon: '🔋', price: 120, desc: 'Jump or replace' },
  { id: 'tire',     name: 'Tire Change',       icon: '🔧', price: 65,  desc: 'Spare install' },
  { id: 'fuel',     name: 'Fuel Delivery',     icon: '⛽', price: 45,  desc: '+$3/mile' },
  { id: 'lockout',  name: 'Lockout Service',   icon: '🔑', price: 85,  desc: 'Safe unlock' },
  { id: 'mechanic', name: 'Mobile Mechanic',   icon: '🔩', price: 150, desc: 'On-site repair' },
];

/* ── Station Store items ─────────────────────────────────── */
const STORE_ITEMS = [
  { id: 'coffee',   name: 'Hot Coffee',         price: 3.50,  emoji: '☕' },
  { id: 'water',    name: 'Water x2',           price: 2.00,  emoji: '💧' },
  { id: 'burger',   name: 'Burger Meal',        price: 8.99,  emoji: '🍔' },
  { id: 'energy',   name: 'Energy Drink',       price: 3.00,  emoji: '⚡' },
  { id: 'fuel_can', name: 'Fuel Can 1L',        price: 12.00, emoji: '🛢️' },
  { id: 'charger',  name: 'Phone Charger',      price: 15.00, emoji: '🔌' },
  { id: 'blanket',  name: 'Emergency Blanket',  price: 8.00,  emoji: '🛡️' },
  { id: 'snack',    name: 'Snack Pack',         price: 4.50,  emoji: '🍿' },
];

interface ShopDrawerProps {
  shop: Shop;
  onClose: () => void;
}

export default function ShopDrawer({ shop, onClose }: ShopDrawerProps) {
  const router = useRouter();
  const cart = useCartStore();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showStore, setShowStore] = useState(false);

  const toggleService = (id: string) =>
    setSelectedServices(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const toggleStoreItem = (id: string) =>
    setCartItems(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const svcTotal = SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const storeTotal = STORE_ITEMS
    .filter(i => cartItems.includes(i.id))
    .reduce((sum, i) => sum + i.price, 0);

  const grandTotal = svcTotal + storeTotal;
  const canBook = selectedServices.length > 0;

  const handleBook = () => {
    // Build WhatsApp message
    const selectedSvcNames = SERVICES
      .filter(s => selectedServices.includes(s.id))
      .map(s => s.name)
      .join(', ');
    
    const message = encodeURIComponent(
      `Hi! I'd like to book a driver.\n\n` +
      `Driver: ${shop.driver}\n` +
      `Company: ${shop.name}\n` +
      `Services: ${selectedSvcNames}\n` +
      `Location: [Your location]\n` +
      `Please confirm availability and pricing.`
    );
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    onClose();
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        key="drawer-content"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 pt-2">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">{shop.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Driver: <span className="font-semibold text-slate-700">{shop.driver}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{shop.truck}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-emerald-500">{shop.etaMins}m</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest">ETA</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              [`⭐ ${shop.rating}`, 'Rating'],
              [shop.jobs.toLocaleString(), 'Jobs Done'],
              [`${shop.rate}%`, 'Completion'],
            ].map(([val, label]) => (
              <div key={label} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <div className="text-base font-black text-slate-900">{val}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Completion rate bar */}
          <div className="mb-5">
            <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Completion Rate</span>
              <span className="text-emerald-600 font-bold">{shop.rate}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${shop.rate}%` }}
              />
            </div>
          </div>

          {/* Services */}
          <div className="mb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Select Services</div>
            <div className="space-y-2">
              {SERVICES.map(svc => {
                const sel = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      sel
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{svc.icon}</span>
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-900">{svc.name}</div>
                        <div className="text-[11px] text-slate-400">{svc.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sel && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check size={11} color="white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-slate-100" />

          {/* Station Store toggle */}
          <button
            onClick={() => setShowStore(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-sm font-bold text-slate-700"
          >
            <span>🛒 While You Wait — Station Store</span>
            {showStore ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {showStore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {STORE_ITEMS.map(item => {
                    const inCart = cartItems.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleStoreItem(item.id)}
                        className={`p-3 rounded-2xl text-center border transition-all ${
                          inCart
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{item.emoji}</div>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart summary & Book CTA */}
          <AnimatePresence>
            {canBook && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4"
              >

                <button
                  onClick={handleBook}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black italic uppercase tracking-wide rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.97]"
                >
                  Book {shop.driver} →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
