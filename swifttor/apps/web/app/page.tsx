'use client';

import { useEffect, useState } from 'react';
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
  const [onlineDrivers, setOnlineDrivers] = useState(0);
  const [rescuedToday, setRescuedToday] = useState(147);

  // Animate counter from 0 → 147
  useEffect(() => {
    let startTs: number | null = null;
    const target = 147, duration = 1500;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setOnlineDrivers(Math.floor(ease * target));
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, []);

  // Slowly increment rescued count every 4s
  useEffect(() => {
    const id = setInterval(() => setRescuedToday(c => c + Math.floor(Math.random() * 2)), 4000);
    return () => clearInterval(id);
  }, []);

  const services = [
    { id: 'towing',   icon: <Truck size={26} />,   name: 'Emergency Towing',    desc: '24/7 flatbed and wheel-lift towing for all vehicle types.' },
    { id: 'lockout',  icon: <Shield size={26} />,  name: 'Lockout Service',     desc: 'Professional entry into your vehicle without damage.' },
    { id: 'battery',  icon: <Star size={26} />,    name: 'Battery Jumpstart',   desc: 'Quick jumpstarts or on-site battery replacement.' },
    { id: 'fuel',     icon: <MapPin size={26} />,  name: 'Fuel Delivery',       desc: 'Emergency gas or diesel delivery to get you to the next station.' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── Flash offer banner ── */}
      <div className="bg-slate-900 py-2 text-center text-[10px] font-black italic uppercase tracking-[0.2em] text-white">
        ⚡ Flash Offer: 15% Off All Battery Jumpstarts Today! Use Code:&nbsp;
        <span className="text-emerald-400">JUMP15</span>
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
            <button 
              onClick={() => router.push('/auth/signin')}
              className="hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/auth/signup')}
              className="text-emerald-600 hover:text-emerald-700 transition-colors font-bold"
            >
              Create Account
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
        <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-12">
          <div className="max-w-md">
            <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4 leading-[0.9]">
              Stranded on <br />
              the Road?
            </h2>
            <p className="text-lg text-emerald-300 font-bold">We&apos;re 15 minutes away.</p>
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
            >              {/* Guarantee badge */}
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-xs font-black mb-4 border border-red-200">
                <span>🏆</span> 30-MIN OR 50% OFF GUARANTEE
              </div>
              {/* ETA pill */}
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                <Clock size={14} /> 15 Min Average Arrival Time
              </div>

              <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9] mb-8">
                Stranded?<br />
                <span className="text-emerald-500">We&apos;ve Got Your Back.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-4 max-w-lg">
                Professional towing and roadside assistance across the nation.
                Fast, reliable, and transparent pricing.
              </p>
              <p className="font-bold text-emerald-600 mb-8">For immediate dispatch, WhatsApp us below.</p>

              {/* Stats Bar (Borrowed from SwiftTor reference) */}
              <div className="grid grid-cols-3 gap-4 mb-10 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="text-center border-r border-slate-100">
                  <div className="text-2xl font-black text-slate-900 font-mono italic">{rescuedToday}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rescued Today</div>
                </div>
                <div className="text-center border-r border-slate-100">
                  <div className="text-2xl font-black text-slate-900 font-mono italic">18m</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 font-mono italic">98%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completion</div>
                </div>
              </div>

              {/* CTA group */}
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-tight shadow-emerald transition-all active:scale-95"
                >
                  Create Account <ChevronRight size={18} />
                </button>

                {/* Social proof */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[11,12,13,14].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} className="w-11 h-11 rounded-full border-4 border-white shadow-sm object-cover" alt="user" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">10k+ Happy Drivers</p>
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
                  <p className="text-xs text-slate-400 font-normal normal-case not-italic">Step 1 of 3</p>
                </div>

                {/* Service grid */}
                <div className="p-6">
                  <p className="text-sm font-semibold text-slate-300 mb-5 normal-case not-italic font-sans">What service do you need?</p>
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
                    Continue →
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
              { value: `${onlineDrivers}`, label: 'Drivers Online Now', color: 'text-emerald-500' },
              { value: '15 min', label: 'Avg Arrival Time', color: 'text-slate-900' },
              { value: '10k+', label: 'Happy Customers', color: 'text-slate-900' },
              { value: '4.9★',  label: 'Customer Rating', color: 'text-amber-500' },
            ].map((s, i) => (
              <div key={i}>
                <p className={`text-3xl font-black italic uppercase ${s.color}`}>{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
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
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Everything You Need To Get Back On The Road</h2>
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

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Fleet Showcase ── */}
      <FleetShowcase />


      {/* ── CTA Banner ── */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">24/7 Dispatch</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Stranded Right Now?</h2>
          <p className="text-slate-400 mb-8">Don&apos;t wait. We dispatch the nearest driver immediately.</p>
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
        href="https://wa.me/14155550123?text=Hi%20SwiftTow,%20I%20need%20roadside%20assistance."
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
