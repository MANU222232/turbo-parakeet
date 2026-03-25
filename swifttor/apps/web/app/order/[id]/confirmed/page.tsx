'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, Share2, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details from backend
    const fetchOrder = async () => {
       try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/id/${params.id}`);
         const data = await res.json();
         setOrder(data);
       } catch (e) {
         console.error("Fetch order failed", e);
       } finally {
         setLoading(false);
       }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Animated Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.3)]">
          <CheckCircle2 size={64} className="text-white" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black uppercase italic tracking-tighter mb-4"
      >
        Rescue Dispatched!
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10 text-xs font-black uppercase tracking-widest text-emerald-500"
      >
        ID: {order?.display_id || 'ST-LOADING...'}
      </motion.div>

      <div className="max-w-md w-full grid gap-4 mb-10 text-left">
          {/* Driver Card */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
             <div className="flex items-center gap-4 relative z-10">
                {order?.driver_photo ? (
                  <img src={order.driver_photo} alt="driver" className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                ) : (
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">👨‍🔧</div>
                )}
                <div>
                   <div className="font-black text-lg uppercase italic tracking-tighter">{order?.driver_name || 'Driver Assigned'}</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">{order?.vehicle_desc || 'Recovery Vehicle'}</div>
                </div>
             </div>
             <div className="text-right relative z-10">
                <div className="text-emerald-500 text-[10px] font-black italic uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Active</div>
             </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 grid grid-cols-2 gap-4 shadow-2xl">
             <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-2">Arriving At</div>
                <div className="text-xl font-black italic flex items-center gap-2">
                   <Clock size={16} className="text-emerald-500" />
                   {order?.arrives_at || 'CALCULATING...'}
                </div>
             </div>
             <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-2">Authorizable</div>
                <div className="text-xl font-black italic text-emerald-500">${(order?.total_amount * 1.08).toFixed(2)}</div>
             </div>
          </div>

          {/* Special Unlock if ETA > 20 (Spec C22) */}
          {order?.eta_mins > 20 && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="text-2xl">🥤</div>
              <div className="text-[10px] font-black uppercase tracking-widest">
                <span className="text-blue-400">Patience Reward:</span> Free drink unlocked at station for your {order.eta_mins}m wait.
              </div>
            </motion.div>
          )}

          {/* Safety Tips (Spec C23) */}
          <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                Safety Protocol
             </h4>
             <ul className="space-y-3">
                {[
                  "Stay in your vehicle with seatbelts securely fastened",
                  "Keep hazard lights flashing until the driver arrives",
                  "Only exit if you can reach a spot behind the barrier"
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">{tip}</span>
                  </li>
                ))}
             </ul>
          </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
         <Link 
            href={`/order/${params.id}/track`}
            className="w-full py-6 bg-emerald-500 text-white font-black uppercase italic tracking-widest rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
         >
            Track Live Location
            <ArrowRight size={20} />
         </Link>
         <button 
           onClick={async () => {
             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${params.id}/share-token`, { method: 'POST' });
             const data = await res.json();
             navigator.clipboard.writeText(data.url);
             alert(`Tracking link copied!`);
           }}
           className="w-full py-6 bg-white/5 border border-white/10 text-slate-400 font-black uppercase italic tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
         >
            <Share2 size={20} />
            Share Tracking Link
         </button>
      </div>

      <div className="mt-16 text-slate-800 text-[10px] font-black uppercase tracking-[0.5em] italic">
         SwiftTor AI Rescue Network
      </div>
    </main>
  );
}
