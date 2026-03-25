'use client';

import { Truck, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('@/components/map/MapContainer').catch(() => {
  // Fallback if MapContainer doesn't exist yet, we’ll just render a placeholder.
  return function MapPlaceholder() { 
    return <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">Map Component Loading...</div>;
  };
}), { ssr: false });

export default function LiveDispatch() {
  const liveRecoveries = [
    { loc: "Downtown SF", time: "2 mins ago", img: "https://images.unsplash.com/photo-1597766353939-996076329780?auto=format&fit=crop&q=80&w=600" },
    { loc: "Highway 101", time: "5 mins ago", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600" },
    { loc: "Oakland Hills", time: "12 mins ago", img: "https://images.unsplash.com/photo-1586191582151-f73770706260?auto=format&fit=crop&q=80&w=600" },
    { loc: "San Jose", time: "18 mins ago", img: "https://images.unsplash.com/photo-1566367711988-89f40d4d9bc4?auto=format&fit=crop&q=80&w=600" },
    { loc: "Palo Alto", time: "25 mins ago", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600" }
  ];

  return (
    <>
      {/* Availability Map Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Availability
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tighter uppercase italic">
                Drivers <br/>
                <span className="text-emerald-500">Nearby Now.</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We have over <span className="font-bold text-slate-900">20+ professional drivers</span> active in your area right now. 
                Average response time is currently under <span className="font-bold text-emerald-600">12 minutes</span>.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">24 Active Trucks</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Within 5 miles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">12 Min ETA</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fastest Dispatch</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white relative group">
              <MapContainer />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">Real-time fleet tracking active</span>
                </div>
                <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Refresh Map</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Dispatch Feed Marquee */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live Dispatch Feed
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none">
                Real-Time <span className="text-emerald-500">Recoveries.</span>
              </h2>
            </div>
            <p className="text-slate-400 max-w-sm text-sm">
              Our drivers upload photos from every job to ensure transparency and safety. Here's what's happening on the road right now.
            </p>
          </div>

          <div className="flex gap-6 overflow-hidden relative">
            <div className="flex gap-6 animate-marquee whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
              {[...liveRecoveries, ...liveRecoveries].map((job, i) => (
                <div key={i} className="inline-block w-80 shrink-0">
                  <div className="relative h-96 rounded-[2rem] overflow-hidden border border-white/10 group">
                    <img 
                      src={job.img} 
                      alt="Live recovery" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">{job.loc}</p>
                      <p className="text-lg font-black italic uppercase tracking-tight">{job.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </>
  );
}
