'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, Shield, Clock, Star, ChevronRight, MapPin } from 'lucide-react';
import RunningOffers from '@/components/landing/RunningOffers';
import LiveDispatch from '@/components/landing/LiveDispatch';
import Testimonials from '@/components/landing/Testimonials';
import FleetShowcase from '@/components/landing/FleetShowcase';
import LiveTicker from '@/components/landing/LiveTicker';

export default function LandingPage() {
  const router = useRouter();

  const services = [
    { id: 'towing',   icon: <Truck size={26} />,   name: 'Emergency Towing',    desc: '24/7 flatbed and wheel-lift towing for all vehicle types.' },
    { id: 'lockout',  icon: <Shield size={26} />,  name: 'Lockout Service',     desc: 'Professional entry into your vehicle without damage.' },
    { id: 'battery',  icon: <Star size={26} />,    name: 'Battery Jumpstart',   desc: 'Quick jumpstarts or on-site battery replacement.' },
    { id: 'fuel',     icon: <MapPin size={26} />,  name: 'Fuel Delivery',       desc: 'Emergency gas or diesel delivery to get you to the next station.' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── Flash offer banner ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-40" />
        <div className="relative bg-slate-900/95 py-2 text-center text-[10px] font-black italic uppercase tracking-[0.2em] text-white">
          <span className="text-emerald-400">⚡ Flash Offer</span>:
          15% Off All Battery Jumpstarts Today! Use Code:&nbsp;
          <span className="text-amber-300">JUMP15</span>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="bg-slate-900 p-2 rounded-xl text-white"><Truck size={20} /></div>
            <span className="text-lg font-black tracking-tighter uppercase italic">SwiftTow</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
            <a href="#fleet" className="hover:text-slate-900 transition-colors">Fleet</a>
            <button 
              onClick={() => router.push('/service-map')}
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <MapPin size={15} /> Track My Driver
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow shadow-slate-200/50">
              Call +1 (415) 555-0123
            </button>
          </div>
        </div>
      </nav>
      <LiveTicker />

      {/* ── Hero Background ── */}
      <div className="relative w-full h-64 md:h-96 lg:h-screen max-h-[500px] bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?auto=format&fit=crop&q=80&w=2000"
          alt="Night driving"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
        {/* Overlay text */}
        <div className="absolute inset-0 flex items-end px-6 md:px-12 pb-12">
          <div className="max-w-2xl w-full">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white px-4 py-2 rounded-full">
                <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                Night driving
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full">
                <Clock size={14} />
                Live ETA updates
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9] mb-4">
              Stranded on <br />
              the Road?
            </h2>
            <p className="text-base md:text-lg text-slate-100 font-bold">
              Live ETA updates • Upfront pricing • Dispatching now.
            </p>
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Background skew accent */}
        <div className="absolute top-0 right-0 h-full w-1/2 -skew-x-12 translate-x-1/4 bg-slate-100/60 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left side text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Guarantee badge */}
              <div className="inline-flex items-center gap-2 bg-white/70 text-slate-900 px-4 py-2 rounded-full text-xs font-black mb-4 border border-slate-200 shadow-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white">
                  🏆
                </span>
                FAST ARRIVAL PROMISE
              </div>
              {/* ETA pill */}
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                <Clock size={14} /> Live ETA updates
              </div>

              <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9] mb-8">
                Stranded?<br />
                <span className="text-emerald-500">Nearest Driver, Fast.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-4 max-w-lg">
                SwiftTow dispatches certified towing and roadside help with live tracking and upfront pricing.
                No surprises. Just fast support when you need it most.
              </p>
              <p className="font-bold text-emerald-600 mb-8">
                Need help right now? Tap WhatsApp and we&apos;ll match you in seconds.
              </p>

              {/* Stats Bar (Borrowed from SwiftTor reference) */}
              <div className="grid grid-cols-3 gap-4 mb-10 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="text-center border-r border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 mx-auto mb-3 flex items-center justify-center">
                    <Truck size={22} />
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono italic uppercase">Dispatching Now</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nearby drivers routed</div>
                </div>
                <div className="text-center border-r border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-900 mx-auto mb-3 flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono italic uppercase">Live Tracking</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ETA + status updates</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-emerald-700 mx-auto mb-3 flex items-center justify-center">
                    <Shield size={22} />
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono italic uppercase">Certified Support</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Upfront + transparent</div>
                </div>
              </div>

              {/* CTA group */}
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => router.push('/emergency-report')}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-tight shadow-emerald transition-all active:scale-95"
                >
                  Request Service Now <ChevronRight size={18} />
                </button>

                {/* Social proof */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[11,12,13,14].map(i => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/100?img=${i}`}
                        className="w-11 h-11 rounded-full border-4 border-white shadow-sm object-cover"
                        alt={`Happy driver ${i}`}
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Thousands of happy drivers</p>
                    <div className="flex text-amber-400 mt-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right side: Request Assistance card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="bg-slate-900 text-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20">
                {/* Card header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold not-italic normal-case tracking-normal">Request Assistance</h2>
                    {/* Step progress pills */}
                    <div className="flex gap-1.5">
                      {[1,2,3].map(n => (
                        <div key={n} className={`h-1.5 rounded-full ${n === 1 ? 'w-8 bg-emerald-400' : 'w-4 bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-normal normal-case not-italic">
                    Step 1 of 3 • Choose a service to get matched instantly.
                  </p>
                </div>

                {/* Service grid */}
                <div className="p-6">
                  <p className="text-sm font-semibold text-slate-300 mb-5 normal-case not-italic font-sans">
                    What service do you need?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => router.push('/emergency-report')}
                        className="group flex flex-col items-start gap-3 p-4 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 rounded-2xl transition-all text-left active:scale-95"
                      >
                        <div className="text-slate-400 group-hover:text-emerald-400 transition-colors">
                          {svc.icon}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white normal-case not-italic">{svc.name}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 normal-case not-italic font-normal">{svc.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push('/emergency-report')}
                    className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm uppercase italic tracking-wide transition-all active:scale-95 shadow shadow-emerald-500/30"
                  >
                    Continue to Dispatch →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust Stats Bar ── */}
      <section className="border-y border-slate-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Truck size={20} />, title: 'Drivers on standby', subtitle: 'Nearby certified dispatch', color: 'text-emerald-500' },
              { icon: <Clock size={20} />, title: 'Live ETA updates', subtitle: 'Real-time routing info', color: 'text-slate-900' },
              { icon: <Star size={20} />, title: 'Top-rated recoveries', subtitle: 'Customer-loved service', color: 'text-amber-500' },
              { icon: <Shield size={20} />, title: '24/7 emergency support', subtitle: 'Always on call', color: 'text-slate-900' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <p className="mt-4 text-sm font-black italic uppercase text-slate-900">{s.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{s.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Running Offers ── */}
      <RunningOffers />

      {/* ── Live Dispatch & Availability ── */}
      <LiveDispatch />


      {/* ── Services Section ── */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3">Our Services</p>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              Everything You Need To Get Back On The Road
            </h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              Pick what you need. We&apos;ll route the closest certified driver for the job.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={() => router.push('/emergency-report')}
                className="group cursor-pointer p-8 rounded-3xl bg-white border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-card"
              >
                <div className="mb-5 text-slate-400 group-hover:text-emerald-400 transition-colors">
                  {svc.icon}
                </div>
                <h3 className="text-base font-bold normal-case not-italic mb-3 text-slate-900 group-hover:text-white">{svc.name}</h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed normal-case not-italic font-normal">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">3-Step Dispatch</p>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
                Dispatch in minutes, not hours.
              </h2>
            </div>
            <p className="text-slate-600 max-w-md">
              Track the driver in real time, confirm updates, and get help without the stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: <MapPin size={18} />,
                title: "Choose your service",
                desc: "Emergency towing, lockout, jumpstart, or fuel delivery.",
              },
              {
                step: 2,
                icon: <Shield size={18} />,
                title: "We match you instantly",
                desc: "Closest certified driver routed for your exact needs.",
              },
              {
                step: 3,
                icon: <Truck size={18} />,
                title: "Track your recovery",
                desc: "Live ETA + updates until you&apos;re back on the road.",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: item.step * 0.06 }}
                viewport={{ once: true }}
                className="card p-8 rounded-[2rem] border-slate-100"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black italic">
                    {item.step}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Fleet Showcase ── */}
      <FleetShowcase />


      {/* ── CTA Banner ── */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">24/7 Dispatch</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Still on the Roadside?</h2>
          <p className="text-slate-400 mb-8">
            Don&apos;t wait. We dispatch the nearest certified driver immediately and keep you updated.
          </p>
          <button
            onClick={() => router.push('/emergency-report')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black italic uppercase tracking-tight transition-all shadow-emerald active:scale-95"
          >
            Get Help Now
          </button>
        </div>
      </section>

      {/* ── Floating WhatsApp ── */}
      <a
        href="https://wa.me/12089695688?text=Hi%20SwiftTow,%20I%20need%20roadside%20assistance."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

    </main>
  );
}
