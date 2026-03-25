'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, X, Info } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';

const CATEGORIES = ['All', 'Hot Food', 'Drinks', 'Snacks', 'Supplies'];

export default function SupermarketPanel({ onClose, shopId, etaMins }: { onClose: () => void, shopId: string, etaMins?: number }) {
  const store = useEmergencyStore();
  const cartStore = useCartStore();
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shops/${shopId}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error("Fetch products failed:", e);
      }
    };
    if (shopId) fetchProducts();
  }, [shopId]);

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.category === activeTab);

  // Spec A31: Meal Combo suggestion if ETA > 30 mins
  const showMealBundle = (etaMins || 0) > 30;

  const handleAdd = (product: any) => {
    cartStore.setShopId(shopId);
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      type: 'product',
    });
  };

  const currentQuantity = (id: string) => {
    return cartStore.items.find((i: any) => i.id === id)?.quantity || 0;
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] z-30 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Supermarket</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
          <X size={20} />
        </button>
      </div>

      {showMealBundle && (
        <div className="mx-6 mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-2xl flex items-start gap-3 shadow-lg shadow-yellow-500/5">
          <Info className="flex-shrink-0 text-yellow-500 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-black text-yellow-500 uppercase tracking-tight italic">Hungry? Long Wait Ahead.</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Provider ETA is {etaMins}m. Add our "Meal Bundle" (Sandwich + Drink) for $8.00?</p>
            <button 
              onClick={() => handleAdd({ id: 'bundle_meal', name: 'Meal Bundle', price: 8 })}
              className="mt-3 text-[10px] font-black uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-2 rounded-full transition-all active:scale-95 shadow-md"
            >
              Add to Order
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-800">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActiveTab(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight transition-all ${
              activeTab === c ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth grid grid-cols-2 gap-4 content-start">
        {filteredProducts.map(p => {
          const qty = currentQuantity(p.id);
          return (
            <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-center flex flex-col items-center relative overflow-hidden group">
              <div className="text-5xl mb-3 mt-2">{p.img}</div>
              <p className="text-sm font-bold text-white mb-1 line-clamp-1">{p.name}</p>
              <p className="text-emerald-500 font-black italic tracking-tighter mb-4">${p.price.toFixed(2)}</p>
              
              {qty > 0 ? (
                <div className="flex items-center justify-between w-full bg-emerald-500/20 rounded-full p-1 border border-emerald-500/30">
                  <button onClick={() => cartStore.updateQuantity(p.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full"><Minus size={14}/></button>
                  <span className="font-bold text-emerald-500 text-sm">{qty}</span>
                  <button onClick={() => cartStore.updateQuantity(p.id, 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full shadow"><Plus size={14}/></button>
                </div>
              ) : (
                <button 
                  onClick={() => handleAdd(p)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>

      {cartStore.items.filter((i: any) => i.type === 'product').length > 0 && (
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-400">Products Subtotal</span>
            <span className="text-lg font-black text-white italic tracking-tighter">${cartStore.subtotal.toFixed(2)}</span>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-emerald-500/20">
            Done Adding
          </button>
        </div>
      )}
    </motion.div>
  );
}
