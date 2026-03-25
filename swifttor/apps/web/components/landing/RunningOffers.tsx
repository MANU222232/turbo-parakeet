'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, Star } from 'lucide-react';

const OFFERS = [
  { id: 1, title: "First Tow Discount", description: "Get 20% off your first towing service with code SWIFT20", icon: <Zap className="text-amber-500" />, color: "bg-amber-50" },
  { id: 2, title: "Night Owl Special", description: "Flat $60 base rate for all services between 11 PM and 5 AM", icon: <Clock className="text-indigo-500" />, color: "bg-indigo-50" },
  { id: 3, title: "Refer a Friend", description: "Earn $10 credit for every friend you refer to SwiftTow", icon: <Star className="text-emerald-500" />, color: "bg-emerald-50" },
];

export default function RunningOffers() {
  return (
    <section className="py-12 bg-white relative z-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-slate-100" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Running Offers</h2>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <motion.div 
              key={offer.id}
              whileHover={{ y: -5 }}
              className={`${offer.color} p-6 rounded-[2rem] border border-black/5 flex items-start gap-4 group cursor-pointer transition-all hover:shadow-xl hover:shadow-black/5`}
            >
              <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                {offer.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{offer.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
