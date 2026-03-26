'use client';

import { Truck, Clock, Star, MapPin, Shield, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const MapContainer = dynamic(() => import('@/components/map/MapContainer').catch(() => {
  return function MapPlaceholder() { 
    return <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">Map Component Loading...</div>;
  };
}), { ssr: false });

type LatLng = { lat: number; lng: number };
type DummyDriver = {
  id: number;
  position: LatLng;
  name: string;
  rating: number;
  distanceMi: number;
  etaMins: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function seedFromLatLng(center: LatLng) {
  return Math.floor(Math.abs(center.lat * 100000) + Math.abs(center.lng * 100000)) % 2147483647;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDummyDrivers(center: LatLng, count = 8): DummyDriver[] {
  const rand = mulberry32(seedFromLatLng(center));

  const names = [
    'Swift Mile Recovery',
    "Night Owl Flatbed",
    'RapidRoad Response',
    "Golden Hour Towing",
    'Metro Tow & Go',
    'Onsite Rescue Team',
    'Prime Wheel-Lift',
    'Express Tow Pros',
    'Harborline Recovery',
    'RoadRunner Dispatch',
  ];

  const drivers: DummyDriver[] = [];
  const baseLat = center.lat;
  const baseLng = center.lng;

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 0.0035 + rand() * 0.02;

    const dLat = Math.cos(angle) * dist;
    const dLng = Math.sin(angle) * dist;

    const position = { lat: baseLat + dLat, lng: baseLng + dLng };

    const milesPerDegLat = 69;
    const milesPerDegLng = 69 * Math.cos((baseLat * Math.PI) / 180);
    const dx = dLng * milesPerDegLng;
    const dy = dLat * milesPerDegLat;
    const distanceMi = clamp(Math.sqrt(dx * dx + dy * dy), 0.2, 8);

    const rating = clamp(4.2 + rand() * 0.8, 4.2, 5);
    const etaMins = Math.round(clamp(distanceMi * (3.2 + rand() * 1.2) + 6 + rand() * 8, 8, 45));

    drivers.push({
      id: i + 1,
      position,
      name: names[i % names.length],
      rating: Math.round(rating * 10) / 10,
      distanceMi: Math.round(distanceMi * 10) / 10,
      etaMins,
    });
  }

  return drivers;
}

export default function LiveDispatch() {
  const router = useRouter();
  const defaultCenter: LatLng = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);
  const [mapCenter, setMapCenter] = useState<LatLng>(defaultCenter);
  const [drivers, setDrivers] = useState<DummyDriver[]>(() => generateDummyDrivers(defaultCenter, 8));
  const [locating, setLocating] = useState(false);
  const [pinState, setPinState] = useState<'demo' | 'pinning' | 'pinned'>('demo');
  const [pinnedAccuracyM, setPinnedAccuracyM] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pinTimeoutRef = useRef<number | null>(null);

  type DriverTab = 'best' | 'nearest' | 'fastest' | 'top';
  const [activeTab, setActiveTab] = useState<DriverTab>('best');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(1);

  const logPin = (stage: string, data?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(`[LiveDispatchPin] ${new Date().toISOString()}`, stage, data ?? {});
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('swiftTow.lastLocation');
      if (!raw) return;
      const parsed = JSON.parse(raw) as LatLng;
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        logPin('CACHE_LOADED', { lat: parsed.lat, lng: parsed.lng });
        setMapCenter(parsed);
        setDrivers(generateDummyDrivers(parsed, 10));
        setPinState('demo');
        setPinnedAccuracyM(null);
        setSelectedDriverId(1);
      }
    } catch {
      // Ignore cache parsing errors.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveRecoveries = [
    { loc: "Expert Recovery", time: "Top-rated recovery team", img: "https://images.unsplash.com/photo-1597766353939-996076329780?auto=format&fit=crop&q=80&w=600" },
    { loc: "Fast Arrival", time: "Fast dispatch", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600" },
    { loc: "Safe & Secure", time: "Certified professionals", img: "https://images.unsplash.com/photo-1586191582151-f73770706260?auto=format&fit=crop&q=80&w=600" },
    { loc: "24/7 Support", time: "Always On Call", img: "https://images.unsplash.com/photo-1566367711988-89f40d4d9bc4?auto=format&fit=crop&q=80&w=600" },
    { loc: "Local Trusted", time: "Preferred partner network", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600" }
  ];

  const sortedDrivers = useMemo(() => {
    const list = [...drivers];
    if (activeTab === 'nearest') {
      list.sort((a, b) => a.distanceMi - b.distanceMi);
      return list;
    }
    if (activeTab === 'fastest') {
      list.sort((a, b) => a.etaMins - b.etaMins);
      return list;
    }
    if (activeTab === 'top') {
      list.sort((a, b) => b.rating - a.rating);
      return list;
    }
    list.sort((a, b) => {
      const scoreA = a.rating * 10 - a.etaMins;
      const scoreB = b.rating * 10 - b.etaMins;
      return scoreB - scoreA;
    });
    return list;
  }, [drivers, activeTab]);

  return (
    <>
      {/* Availability Map Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Driver Finder
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tighter uppercase italic">
                Drivers <br/>
                <span className="text-emerald-500">near you</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Click <span className="font-bold text-slate-900">Search for drivers</span> to pin your location.
                For now, this page shows demo driver pins and estimates around your pinned point.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Demo drivers around you</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pins + list stay in sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Est. arrival time</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dummy estimates for now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-700">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">View-only map</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pinned location only</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white relative group">
              <MapContainer
                center={mapCenter}
                drivers={drivers}
                selectedDriverId={selectedDriverId}
                pinState={locating ? 'pinning' : pinState}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">
                    {locating
                      ? 'Pinning GPS…'
                      : pinState === 'pinned'
                        ? pinnedAccuracyM != null
                          ? `Pinned • ±${Math.round(pinnedAccuracyM)}m • demo drivers`
                          : 'Pinned • GPS • demo drivers'
                        : `Demo pins • ${mapCenter.lat.toFixed(2)}, ${mapCenter.lng.toFixed(2)}`}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    logPin('CLICK/START');

                    // Clear any previous watch/timeout on repeated clicks.
                    if (watchIdRef.current != null) {
                      navigator.geolocation.clearWatch(watchIdRef.current);
                      watchIdRef.current = null;
                    }
                    if (pinTimeoutRef.current != null) {
                      window.clearTimeout(pinTimeoutRef.current);
                      pinTimeoutRef.current = null;
                    }

                    setLocating(true);
                    setPinState('pinning');
                    setPinnedAccuracyM(null);
                    setSelectedDriverId(null);

                    if (!('geolocation' in navigator)) {
                      logPin('NO_GEOLOCATION_SUPPORT');
                      setPinState('demo');
                      setDrivers(generateDummyDrivers(mapCenter, 10));
                      setLocating(false);
                      return;
                    }

                    // Log permission state if the browser supports it.
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const perms = (navigator as any).permissions;
                      if (perms?.query) {
                        const status = await perms.query({ name: 'geolocation' });
                        logPin('PERMISSION_STATE', { state: status?.state });
                      }
                    } catch {
                      // Permission API is optional; ignore.
                    }

                    let bestAcc: number | null = null;
                    let bestCenter: LatLng | null = null;
                    let finalized = false;

                    const DEADLINE_MS = 30000;

                    const finalize = (center: LatLng, acc: number | null, source: string) => {
                      if (finalized) return; // guard against double-finalize
                      finalized = true;
                      logPin('FINALIZE', { source, accM: acc });

                      if (watchIdRef.current != null) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                      }
                      if (pinTimeoutRef.current != null) {
                        window.clearTimeout(pinTimeoutRef.current);
                        pinTimeoutRef.current = null;
                      }

                      setPinState('pinned');
                      setPinnedAccuracyM(acc);
                      setMapCenter(center);
                      const nextDrivers = generateDummyDrivers(center, 10);
                      setDrivers(nextDrivers);
                      setSelectedDriverId(nextDrivers[0]?.id ?? null);

                      try {
                        window.localStorage.setItem('swiftTow.lastLocation', JSON.stringify(center));
                      } catch {
                        // Ignore storage failures.
                      }

                      setLocating(false);
                    };

                    const handlePosition = (pos: GeolocationPosition, source: string) => {
                      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                      const acc = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
                      logPin('GPS_UPDATE', { source, lat: next.lat, lng: next.lng, accuracyM: acc });

                      // Always keep the best (lowest accuracy number = most precise) fix seen.
                      const isBetter = acc != null && (bestAcc == null || acc < bestAcc);
                      if (isBetter || bestCenter == null) {
                        bestAcc = acc;
                        bestCenter = next;
                        // Update map live while we refine — but don't finalize yet.
                        setMapCenter(next);
                        const nextDrivers = generateDummyDrivers(next, 10);
                        setDrivers(nextDrivers);
                        setSelectedDriverId(nextDrivers[0]?.id ?? null);
                      }

                      // Any fix from getCurrentPosition (low-accuracy fast path) is good enough
                      // to show the map immediately. watchPosition refinements are a bonus.
                      if (source === 'getCurrentPosition') {
                        finalize(next, acc, source);
                      }
                    };

                    const handleFailure = (err: GeolocationPositionError, source: string) => {
                      logPin('GPS_FAILURE', { source, code: err?.code, message: err?.message });

                      // Only bail if BOTH paths have failed (watchPosition may still succeed).
                      if (source === 'watchPosition' || finalized) return;

                      if (watchIdRef.current != null) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                      }
                      if (pinTimeoutRef.current != null) {
                        window.clearTimeout(pinTimeoutRef.current);
                        pinTimeoutRef.current = null;
                      }

                      let stored: LatLng | null = null;
                      try {
                        const raw = window.localStorage.getItem('swiftTow.lastLocation');
                        if (raw) {
                          const parsed = JSON.parse(raw) as LatLng;
                          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
                            stored = parsed;
                          }
                        }
                      } catch {
                        // Ignore.
                      }

                      const centerToUse = bestCenter ?? stored ?? mapCenter;
                      logPin('FALLBACK_ON_FAILURE', { bestCenter, stored, centerToUse });

                      setPinState('demo');
                      setPinnedAccuracyM(null);
                      setMapCenter(centerToUse);
                      const nextDrivers = generateDummyDrivers(centerToUse, 10);
                      setDrivers(nextDrivers);
                      setSelectedDriverId(nextDrivers[0]?.id ?? null);
                      setLocating(false);
                    };

                    // STRATEGY: Two-stage approach.
                    //
                    // Stage 1 — getCurrentPosition with LOW accuracy (enableHighAccuracy: false).
                    //   Uses WiFi/cell/IP — resolves in <1s, works indoors, never times out on
                    //   a typical device. This is the PRIMARY path that pins the map quickly.
                    //
                    // Stage 2 — watchPosition with HIGH accuracy (enableHighAccuracy: true),
                    //   NO timeout so the browser can take as long as it needs for a GPS fix.
                    //   Silently refines the pin if a better signal arrives later.
                    //   This is BONUS — the map is already pinned from Stage 1.

                    // Stage 0 — try any cached browser position first (returns instantly if available)
                    logPin('GETCURRENT_CACHED_REQUESTED');
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        logPin('GETCURRENT_CACHED_HIT', { accuracyM: pos.coords.accuracy });
                        handlePosition(pos, 'getCurrentPosition');
                      },
                      (err) => {
                        logPin('GETCURRENT_CACHED_MISS', { code: err?.code, message: err?.message });
                        // Silently ignore — Stage 1 will try with a live request next.
                      },
                      { enableHighAccuracy: false, timeout: 2000, maximumAge: Infinity }
                    );

                    // Stage 1 — fast low-accuracy live fix (WiFi/cell, the primary pin path)
                    logPin('GETCURRENT_REQUESTED', { enableHighAccuracy: false });
                    navigator.geolocation.getCurrentPosition(
                      (pos) => handlePosition(pos, 'getCurrentPosition'),
                      (err) => handleFailure(err, 'getCurrentPosition'),
                      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
                    );

                    // Stage 2 — high-accuracy GPS refinement in background (bonus, no timeout)
                    watchIdRef.current = navigator.geolocation.watchPosition(
                      (pos) => {
                        if (finalized) return; // already pinned from Stage 0/1, skip
                        handlePosition(pos, 'watchPosition');
                      },
                      (err) => handleFailure(err, 'watchPosition'),
                      { enableHighAccuracy: true, maximumAge: 0 }
                    );
                    logPin('WATCH_STARTED', { watchId: watchIdRef.current });

                    // Hard deadline: if somehow both paths produce nothing, give up gracefully.
                    pinTimeoutRef.current = window.setTimeout(() => {
                      pinTimeoutRef.current = null;
                      if (finalized) return;
                      logPin('DEADLINE_TIMEOUT_FIRED', { bestAccM: bestAcc, bestCenter });

                      if (bestCenter) {
                        finalize(bestCenter, bestAcc, 'deadline');
                      } else {
                        let stored: LatLng | null = null;
                        try {
                          const raw = window.localStorage.getItem('swiftTow.lastLocation');
                          if (raw) {
                            const parsed = JSON.parse(raw) as LatLng;
                            if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
                              stored = parsed;
                            }
                          }
                        } catch {
                          // Ignore.
                        }

                        const centerToUse = stored ?? mapCenter;
                        logPin('FALLBACK_ON_DEADLINE', { stored, centerToUse });

                        if (watchIdRef.current != null) {
                          navigator.geolocation.clearWatch(watchIdRef.current);
                          watchIdRef.current = null;
                        }

                        setPinState('demo');
                        setPinnedAccuracyM(null);
                        setMapCenter(centerToUse);
                        const nextDrivers = generateDummyDrivers(centerToUse, 10);
                        setDrivers(nextDrivers);
                        setSelectedDriverId(nextDrivers[0]?.id ?? null);
                        setLocating(false);
                      }
                    }, DEADLINE_MS);
                  }}
                  className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={locating}
                >
                  {locating ? 'Pinning location…' : (
                    <>
                      <Search size={14} />
                      Search for drivers
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="h-[450px] rounded-[2.5rem] bg-white border border-slate-100 p-6 shadow-card flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">Nearby drivers</p>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mt-1">Select a driver</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      {locating
                        ? 'Pinning GPS… drivers will update as we get a fix.'
                        : pinState === 'pinned'
                          ? `GPS pinned at ${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)}${
                              pinnedAccuracyM != null ? ` (±${Math.round(pinnedAccuracyM)}m)` : ''
                            }. Tap a driver to highlight it.`
                          : `Demo/stored center at ${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)}. Tap a driver to highlight it.`}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
                  {(
                    [
                      ['best', 'Best Match'],
                      ['nearest', 'Nearest'],
                      ['fastest', 'Fastest'],
                      ['top', 'Top Rated'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-2xl transition-all ${
                        activeTab === key
                          ? 'bg-emerald-500 text-white'
                          : 'bg-transparent text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Driver list */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                  {sortedDrivers.slice(0, 7).map((driver) => {
                    const etaLow = Math.max(1, driver.etaMins - 3);
                    const etaHigh = driver.etaMins + 3;
                    const isSelected = driver.id === selectedDriverId;
                    return (
                      <button
                        key={driver.id}
                        type="button"
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`w-full text-left p-4 rounded-[1.75rem] border transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{driver.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Available</p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm shrink-0">
                            <Star size={14} fill="currentColor" />
                            {driver.rating.toFixed(1)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <MapPin size={14} />
                          {driver.distanceMi.toFixed(1)} mi
                        </div>

                        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Clock size={14} />
                          Est. ETA {etaLow}-{etaHigh}m
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/emergency-report')}
                  className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-emerald"
                >
                  Request Assistance
                </button>
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
              Our drivers upload photos from every job to ensure transparency and safety. Here&apos;s what&apos;s happening on the road right now.
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