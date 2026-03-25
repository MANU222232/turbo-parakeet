'use client';

import { Star, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-20 bg-white" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Testimonials</h2>
            <p className="text-4xl font-black text-slate-900 tracking-tight">Don&apos;t Just Take Our Word For It</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-100 p-4 rounded-full text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
              <ChevronRight className="rotate-180" />
            </div>
            <div className="bg-slate-900 p-4 rounded-full text-white shadow-lg shadow-slate-200 cursor-pointer hover:bg-slate-800 transition-colors">
              <ChevronRight />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Sarah Jenkins", text: "SwiftTow saved me when I was stranded at 2 AM. The tracking feature was so reassuring!", role: "Commuter" },
            { name: "David Chen", text: "Fastest service I&apos;ve ever had. Mike was professional and got my car to the shop in no time.", role: "Business Owner" },
            { name: "Elena Rodriguez", text: "Transparent pricing is a game changer. No haggling with the driver. Highly recommend!", role: "Traveler" }
          ].map((review, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all shadow-sm">
              <div className="flex text-amber-400 mb-6">
                {[1, 2, 3, 4, 5].map(j => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 italic mb-8 leading-relaxed">&quot;{review.text}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${review.name}`} alt={review.name} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
