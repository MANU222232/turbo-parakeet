'use client';

import { motion } from 'framer-motion';

export default function FleetShowcase() {
  return (
    <>
      {/* Our Fleet Section */}
      <section className="py-24 bg-slate-50 overflow-hidden" id="fleet">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Our Fleet</h2>
              <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                On-The-Road <span className="text-emerald-500">Equipment.</span>
              </p>
            </div>
            <p className="text-slate-500 max-w-sm">
              No studio shots here. These are our actual trucks working 24/7 to keep the roads clear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Flatbed Recovery", 
                desc: "The gold standard for damage-free transport. Perfect for luxury, 4WD, and low-clearance vehicles.",
                img: "https://images.unsplash.com/photo-1597766353939-996076329780?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Integrated Tow Truck", 
                desc: "Equipped with a self-loading boom for rapid response in tight urban environments and parking garages.",
                img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Heavy Duty Rotator", 
                desc: "A 75-ton crane-style recovery vehicle for the most complex industrial and semi-truck accidents.",
                img: "https://images.unsplash.com/photo-1591768793355-74d7c80b0e17?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Medium Duty Wrecker", 
                desc: "Versatile recovery for box trucks, delivery vans, and larger commercial vehicles.",
                img: "https://images.unsplash.com/photo-1566367711988-89f40d4d9bc4?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Specialized Motorcycle Unit", 
                desc: "Custom-built trailers designed specifically for safe, upright motorcycle transport.",
                img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Off-Road Recovery 4x4", 
                desc: "Equipped with heavy-duty winches for vehicles stuck in mud, sand, or snow.",
                img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
              }
            ].map((truck, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl bg-white"
              >
                <img 
                  src={truck.img} 
                  alt={truck.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="bg-emerald-500 w-12 h-1 mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <h4 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none">{truck.title}</h4>
                  <p className="text-slate-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    {truck.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles We Service */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Versatility</h2>
            <p className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-slate-900">
              Vehicles We <br/><span className="text-emerald-500">Service.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Luxury & Exotic", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600", desc: "White-glove service for high-value assets." },
              { name: "Electric Vehicles", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600", desc: "Specialized handling for EV batteries and systems." },
              { name: "Heavy Duty Trucks", img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600", desc: "Semi-trucks, buses, and commercial fleets." },
              { name: "Motorcycles & ATVs", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600", desc: "Upright transport for two-wheeled vehicles." },
              { name: "Construction Gear", img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?auto=format&fit=crop&q=80&w=600", desc: "Forklifts, excavators, and site equipment." },
              { name: "Classic & Vintage", img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600", desc: "Preserving automotive history with care." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group relative h-[300px] rounded-[2rem] overflow-hidden border border-slate-100"
              >
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/20 transition-colors duration-500" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">{item.name}</h4>
                  <p className="text-slate-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
