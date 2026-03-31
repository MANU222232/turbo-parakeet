'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Truck, ShoppingCart, ChevronDown, ChevronUp, Check, MessageCircle, MapPin, Clock, Shield, Zap, Wrench, Award, Calendar } from 'lucide-react';
import { Shop } from '@/lib/constants/shops';
import { useRouter } from 'next/navigation';

/* ── Services catalogue ──────────────────────────────────── */
const SERVICES = [
  { id: 'towing',    name: 'Towing',           icon: '🚛', price: 75,  desc: '+$5/mile', color: '#FF6200' },
  { id: 'battery',  name: 'Battery Service',   icon: '🔋', price: 120, desc: 'Jump or replace', color: '#4FC3F7' },
  { id: 'tire',     name: 'Tire Change',       icon: '🔧', price: 65,  desc: 'Spare install', color: '#00D16C' },
  { id: 'fuel',     name: 'Fuel Delivery',     icon: '⛽', price: 45,  desc: '+$3/mile', color: '#FFD700' },
  { id: 'lockout',  name: 'Lockout Service',   icon: '🔑', price: 85,  desc: 'Safe unlock', color: '#FF6B6B' },
  { id: 'mechanic', name: 'Mobile Mechanic',   icon: '🔩', price: 150, desc: 'On-site repair', color: '#A855F7' },
];

/* ── Station Store items ─────────────────────────────────── */
const STORE_ITEMS = [
  { id: 'coffee',   name: 'Hot Coffee',         price: 3.50,  emoji: '☕', category: 'Drinks' },
  { id: 'water',    name: 'Water x2',           price: 2.00,  emoji: '💧', category: 'Drinks' },
  { id: 'burger',   name: 'Burger Meal',        price: 8.99,  emoji: '🍔', category: 'Food' },
  { id: 'energy',   name: 'Energy Drink',       price: 3.00,  emoji: '⚡', category: 'Drinks' },
  { id: 'fuel_can', name: 'Fuel Can 1L',        price: 12.00, emoji: '🛢️', category: 'Supplies' },
  { id: 'charger',  name: 'Phone Charger',      price: 15.00, emoji: '🔌', category: 'Supplies' },
  { id: 'blanket',  name: 'Emergency Blanket',  price: 8.00,  emoji: '🛡️', category: 'Supplies' },
  { id: 'snack',    name: 'Snack Pack',         price: 4.50,  emoji: '🍿', category: 'Food' },
];

interface ShopDrawerProps {
  shop: Shop;
  onClose: () => void;
}

export default function ShopDrawer({ shop, onClose }: ShopDrawerProps) {
  const router = useRouter();

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
    const selectedSvcNames = SERVICES
      .filter(s => selectedServices.includes(s.id))
      .map(s => s.name)
      .join(', ');

    const message = encodeURIComponent(
      `Hi! I'd like to book a driver.\n\n` +
      `👤 Driver: ${shop.driver}\n` +
      `🏪 Company: ${shop.name}\n` +
      `🔧 Services: ${selectedSvcNames}\n` +
      `📍 Location: [Your location]\n` +
      `⏱ ETA: ${shop.etaMins} minutes\n` +
      `💰 Estimated Total: $${grandTotal.toFixed(2)}\n\n` +
      `Please confirm availability and pricing.`
    );

    window.open(`https://wa.me/12089695688?text=${message}`, '_blank');
    onClose();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${shop.driver}! I'd like to get assistance from your service.\n\n` +
      `Company: ${shop.name}\n` +
      `ETA: ${shop.etaMins} minutes`
    );
    window.open(`https://wa.me/12089695688?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {/* Backdrop - Enhanced */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - Enhanced */}
      <motion.div
        key="drawer-content"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#070707] rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-l border-r border-white/10"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drag handle - Enhanced */}
        <div className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing">
          <div className="relative">
            <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-white/15 via-white/25 to-white/15" />
            <div className="absolute inset-0 w-14 h-1.5 rounded-full bg-[#FF6200]/20 blur-md opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Header - Enhanced */}
          <div className="flex items-start justify-between mb-5 pt-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-[#FF6200]" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Service Provider</span>
              </div>
              <h2 id="drawer-title" className="text-xl font-black italic uppercase tracking-tight text-white">
                {shop.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-neutral-400">
                <Truck size={14} />
                <span>{shop.truck}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                className="text-right bg-[#101010] rounded-xl px-3 py-2 border border-white/5"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-black font-mono text-[#00D16C]">{shop.etaMins}</div>
                <div className="text-[8px] text-neutral-500 uppercase tracking-widest">min ETA</div>
              </motion.div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-[#181818] hover:bg-[#202020] rounded-full text-neutral-400 hover:text-white transition-all border border-white/5"
                aria-label="Close drawer"
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* Driver Card - Enhanced */}
          <motion.div 
            className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-4 border border-white/8 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6200] to-[#FF6200]/70 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-[#FF6200]/30 border-2 border-white/10">
                  {shop.driverInitials || shop.driver.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00D16C] rounded-full border-2 border-[#101010]" />
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-white">{shop.driver}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <Shield size={10} />
                  Verified Professional
                </div>
              </div>
              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-[#00D16C]/15 hover:bg-[#00D16C]/25 rounded-full text-[#00D16C] transition-all border border-[#00D16C]/20"
                aria-label={`WhatsApp ${shop.driver}`}
              >
                <MessageCircle size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-[#0f0f0f] rounded-lg p-2.5">
              <MapPin size={12} className="text-[#FF6200]" />
              <span className="truncate">{shop.address}</span>
            </div>
          </motion.div>

          {/* Stats row - Enhanced */}
          <motion.div 
            className="grid grid-cols-4 gap-2.5 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {[
              { icon: Star, value: `${shop.rating}`, label: 'Rating', color: '#FFD700', sub: '/5.0' },
              { icon: Check, value: shop.jobs.toLocaleString(), label: 'Jobs', color: '#4FC3F7', sub: ' done' },
              { icon: Shield, value: `${shop.rate}%`, label: 'Success', color: '#00D16C', sub: 'rate' },
              { icon: Zap, value: `${shop.distanceMi.toFixed(1)}mi`, label: 'Distance', color: '#FF6200', sub: ' away' },
            ].map(({ icon: Icon, value, label, color, sub }) => (
              <motion.div 
                key={label} 
                className="bg-[#101010] rounded-xl p-2.5 text-center border border-white/5 hover:border-white/10 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="flex justify-center mb-1.5">
                  <Icon className="h-4 w-4" style={{ color }} strokeWidth={2.5} />
                </div>
                <div className="text-base font-black text-white">{value}</div>
                <div className="text-[7px] text-neutral-500 uppercase tracking-wider">{label}{sub}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Completion rate bar - Enhanced */}
          <motion.div 
            className="mb-5 bg-[#101010] rounded-xl p-3.5 border border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-wider">
                <Shield size={11} className="text-[#00D16C]" />
                <span className="font-bold">Completion Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#00D16C]">{shop.rate}%</span>
                <Award size={12} className="text-[#00D16C]" />
              </div>
            </div>
            <div className="h-2.5 bg-[#0a0a0a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shop.rate}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#00D16C] via-[#00E076] to-[#00D16C] rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </motion.div>

          {/* Services - Enhanced */}
          <motion.div 
            className="mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
              <Wrench size={11} className="text-[#FF6200]" />
              Select Services
            </div>
            <div className="space-y-2">
              {SERVICES.map((svc, idx) => {
                const sel = selectedServices.includes(svc.id);
                return (
                  <motion.button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      sel
                        ? 'border-[#FF6200]/50 bg-[#FF6200]/10'
                        : 'border-white/8 bg-[#101010] hover:border-white/20 hover:bg-[#141414]'
                    }`}
                    aria-pressed={sel}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{svc.icon}</span>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">{svc.name}</div>
                        <div className="text-[11px] text-neutral-500">{svc.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          scale: sel ? 1 : 0,
                          backgroundColor: sel ? svc.color : 'rgba(0,0,0,0)',
                          rotate: sel ? 0 : -90,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check size={12} color="white" strokeWidth={3} />
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Station Store toggle - Enhanced */}
          <motion.button
            onClick={() => setShowStore(p => !p)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#101010] border border-white/8 hover:border-white/20 transition-all text-sm font-bold text-white mt-5"
            aria-expanded={showStore}
          >
            <span className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF6200]/15 flex items-center justify-center">
                <ShoppingCart size={16} className="text-[#FF6200]" />
              </div>
              <span>🛒 While You Wait — Station Store</span>
            </span>
            <motion.div
              animate={{ rotate: showStore ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-neutral-500" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showStore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {STORE_ITEMS.map((item, idx) => {
                    const inCart = cartItems.includes(item.id);
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => toggleStoreItem(item.id)}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.02 * idx }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={`p-3.5 rounded-xl text-center border transition-all ${
                          inCart
                            ? 'border-[#00D16C]/50 bg-[#00D16C]/10'
                            : 'border-white/8 bg-[#101010] hover:border-white/20 hover:bg-[#141414]'
                        }`}
                        aria-pressed={inCart}
                      >
                        <div className="text-3xl mb-1.5">{item.emoji}</div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart summary & Book CTA - Enhanced */}
          <AnimatePresence>
            {canBook && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="mt-5 bg-gradient-to-br from-[#101010] to-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-xl"
              >
                {/* Summary */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <span className="text-sm text-neutral-400 flex items-center gap-2">
                    <Wrench size={14} className="text-[#FF6200]" />
                    Services ({selectedServices.length})
                  </span>
                  <span className="text-lg font-bold text-white">${svcTotal.toFixed(2)}</span>
                </div>
                {storeTotal > 0 && (
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                    <span className="text-sm text-neutral-400 flex items-center gap-2">
                      <ShoppingCart size={14} className="text-[#00D16C]" />
                      Store Items ({cartItems.length})
                    </span>
                    <span className="text-lg font-bold text-white">${storeTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-bold text-white">Total Estimate</span>
                  <span className="text-2xl font-black text-[#FF6200]">${grandTotal.toFixed(2)}</span>
                </div>

                <motion.button
                  onClick={handleBook}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-gradient-to-r from-[#00D16C] to-[#00E076] hover:from-[#00E076] hover:to-[#00F080] text-black font-black italic uppercase tracking-wide rounded-xl shadow-lg shadow-[#00D16C]/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} strokeWidth={2.5} />
                  Book {shop.driver} via WhatsApp →
                </motion.button>
                
                <div className="text-center mt-3 text-[9px] text-neutral-500">
                  🔒 Payment held in escrow · Released after job completion
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
