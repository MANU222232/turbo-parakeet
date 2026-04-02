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

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp?: number;
  source: string;
}

type MethodState = 'idle' | 'trying' | 'ok' | 'fail';

function getLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
          source: 'getCurrentPosition',
        });
      },
      (error) => {
        reject(new Error(`Location error (${error.code}): ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

type AvailableDriver = {
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

function generateAvailableDrivers(center: LatLng, count = 8): AvailableDriver[] {
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

  const drivers: AvailableDriver[] = [];
  const baseLat = center.lat;
  const baseLng = center.lng;

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 0.12 + rand() * 0.18;

    const dLat = Math.cos(angle) * dist;
    const dLng = Math.sin(angle) * dist;

    const position = { lat: baseLat + dLat, lng: baseLng + dLng };

    const milesPerDegLat = 69;
    const milesPerDegLng = 69 * Math.cos((baseLat * Math.PI) / 180);
    const dx = dLng * milesPerDegLng;
    const dy = dLat * milesPerDegLat;
    const distanceMi = clamp(Math.sqrt(dx * dx + dy * dy), 8, 18);

    const rating = clamp(4.2 + rand() * 0.8, 4.2, 5);
    const etaMins = Math.round(clamp(distanceMi * 2.5 + 5 + rand() * 12, 30, 56));

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
  const defaultCenter: LatLng = useMemo(() => ({ lat: 1.2921, lng: 36.8219 }), []); // Default to Nairobi, Kenya (can be changed)
  const [mapCenter, setMapCenter] = useState<LatLng>(defaultCenter);
  const [drivers, setDrivers] = useState<AvailableDriver[]>(() => generateAvailableDrivers(defaultCenter, 8));
  const [locating, setLocating] = useState(true);
  const [pinState, setPinState] = useState<'available' | 'searching' | 'found'>('searching');
  const [pinnedAccuracyM, setPinnedAccuracyM] = useState<number | null>(null);
  const [locationFailed, setLocationFailed] = useState(false);
  const locationAttemptedRef = useRef(false);
  const [methodStatus, setMethodStatus] = useState<[MethodState, MethodState, MethodState]>(['idle', 'idle', 'idle']);
  const watchIdRef = useRef<number | null>(null);
  const [statusText, setStatusText] = useState('Finding your location...');

  type DriverTab = 'best' | 'nearest' | 'fastest' | 'top';
  const [activeTab, setActiveTab] = useState<DriverTab>('best');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(1);

  const logPin = (stage: string, data?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(`[LiveDispatchPin] ${new Date().toTimeString().slice(0, 8)}`, stage, data ?? {});
  };

  const setMethod = (i: 0 | 1 | 2, state: MethodState) => {
    setMethodStatus(prev => {
      const next = [...prev] as [MethodState, MethodState, MethodState];
      next[i] = state;
      return next;
    });
  };

  // Enhanced multi-method GPS location logic
  useEffect(() => {
    let cancelled = false;
    let finalized = false;

    const applyCoords = (pos: GeolocationPosition, source: string) => {
      if (finalized || cancelled) return;
      
      const c = pos.coords;
      const result: LocationResult = {
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        altitude: c.altitude,
        speed: c.speed,
        heading: c.heading,
        timestamp: pos.timestamp,
        source,
      };
      
      logPin('GPS_UPDATE', { source, lat: result.latitude, lng: result.longitude, accuracy: Math.round(result.accuracy) });
      
      const center: LatLng = { lat: result.latitude, lng: result.longitude };
      setMapCenter(center);
      setPinState('found');
      setPinnedAccuracyM(result.accuracy);
      const newDrivers = generateAvailableDrivers(center, 10);
      setDrivers(newDrivers);
      setSelectedDriverId(newDrivers[0]?.id ?? null);
      setLocating(false);
      
      // Store for later
      try {
        window.localStorage.setItem('swiftTow.lastLocation', JSON.stringify(center));
      } catch (e) {
        logPin('STORAGE_ERROR', { error: e });
      }
      
      finalized = true;
      setStatusText(`GPS active ±${Math.round(result.accuracy)}m via ${source}`);
    };

    const fallbackToAvailable = async () => {
      if (finalized || cancelled) return;
      finalized = true;

      logPin('USING_FALLBACK');

      // Try to get stored location first
      let stored: LatLng | null = null;
      try {
        const raw = window.localStorage.getItem('swiftTow.lastLocation');
        if (raw) {
          const parsed = JSON.parse(raw) as LatLng;
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            stored = parsed;
            logPin('USING_STORED_LOCATION', stored);
          }
        }
      } catch (e) {
        logPin('STORAGE_READ_ERROR', { error: e });
      }

      if (stored) {
        setMapCenter(stored);
        setPinState('available');
        setPinnedAccuracyM(null);
        const newDrivers = generateAvailableDrivers(stored, 10);
        setDrivers(newDrivers);
        setSelectedDriverId(newDrivers[0]?.id ?? null);
        setLocating(false);
        setStatusText(`Stored location ±unknown`);
        return;
      }

      // Try IP-based geolocation as a better fallback than hardcoded coordinates
      try {
        logPin('FETCHING_IP_LOCATION');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          const ipLocation: LatLng = { lat: data.latitude, lng: data.longitude };
          logPin('IP_LOCATION_SUCCESS', ipLocation);
          setMapCenter(ipLocation);
          setPinState('available');
          setPinnedAccuracyM(null);
          const newDrivers = generateAvailableDrivers(ipLocation, 10);
          setDrivers(newDrivers);
          setSelectedDriverId(newDrivers[0]?.id ?? null);
          setLocating(false);
          setStatusText(`IP-based location (${data.city || 'Unknown'})`);
          return;
        }
      } catch (e) {
        logPin('IP_LOCATION_FAILED', { error: e });
      }

      // Last resort: use default center
      setMapCenter(defaultCenter);
      setPinState('available');
      setPinnedAccuracyM(null);
      const newDrivers = generateAvailableDrivers(defaultCenter, 10);
      setDrivers(newDrivers);
      setSelectedDriverId(newDrivers[0]?.id ?? null);
      setLocating(false);
      setLocationFailed(true);
      setStatusText('Searching for nearby drivers...');
    };

    const requestLocation = () => {
      // Use ref to prevent duplicate requests across Strict Mode re-mounts
      if (locationAttemptedRef.current) return;
      locationAttemptedRef.current = true;
      
      logPin('STARTING_GPS_REQUEST');
      setStatusText('Acquiring position…');
      
      // Method 0: Instant cached position (fast path)
      setMethod(0, 'trying');
      navigator.geolocation.getCurrentPosition(
        pos => {
          setMethod(0, 'ok');
          logPin('CACHED_FIX', { accuracy: Math.round(pos.coords.accuracy) });
          applyCoords(pos, 'cached');
          if (!cancelled) {
            setStatusText(`Pinned via cached fix ±${Math.round(pos.coords.accuracy)}m`);
          }
        },
        err => {
          setMethod(0, 'fail');
          logPin('CACHED_FAILED', { error: err.message });
          // Silently continue to Method 1
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: Infinity }
      );

      // Method 1: Low-accuracy live fix (WiFi/cell triangulation)
      setMethod(1, 'trying');
      navigator.geolocation.getCurrentPosition(
        pos => {
          setMethod(1, 'ok');
          logPin('LOW_ACCURACY_FIX', { accuracy: Math.round(pos.coords.accuracy), source: 'WiFi/cell' });
          if (!finalized) {
            applyCoords(pos, 'WiFi/cell');
            if (!cancelled) {
              setStatusText(`Pinned via WiFi/cell ±${Math.round(pos.coords.accuracy)}m`);
            }
          }
        },
        err => {
          setMethod(1, 'fail');
          logPin('LOW_ACCURACY_FAILED', { error: err.message });
          // Continue to Method 2
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
      );

      // Method 2: High-accuracy GPS watch (continuous refinement)
      setMethod(2, 'trying');
      watchIdRef.current = navigator.geolocation.watchPosition(
        pos => {
          setMethod(2, 'ok');
          if (!finalized || pos.coords.accuracy < pinnedAccuracyM!) {
            applyCoords(pos, 'GPS');
            if (!cancelled) {
              setStatusText(`GPS active ±${Math.round(pos.coords.accuracy)}m — refining`);
            }
          }
        },
        err => {
          setMethod(2, 'fail');
          logPin('GPS_WATCH_FAILED', { error: err.message });
          // If all methods failed, fallback
          if (methodStatus[0] === 'fail' && methodStatus[1] === 'fail') {
            fallbackToAvailable();
          }
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      
      logPin('GPS_WATCH_STARTED');
      
      // Hard timeout - if nothing works after 20 seconds, fallback
      setTimeout(() => {
        if (!finalized && !cancelled) {
          logPin('DEADLINE_TIMEOUT');
          fallbackToAvailable();
        }
      }, 20000);
    };

    requestLocation();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [defaultCenter]);

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
                {locating
                  ? 'Finding your location... GPS pin will update automatically.'
                  : pinState === 'found'
                    ? `GPS pinned at ${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)}${
                        pinnedAccuracyM != null ? ` (±${Math.round(pinnedAccuracyM)}m)` : ''
                      }. Tap a driver to highlight it.`
                    : `Stored/fallback center at ${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)}. Tap a driver to highlight it.`}
              </p>
            </div>
            
            <div className="lg:col-span-2 h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white relative group">
              <MapContainer
                center={mapCenter}
                drivers={drivers}
                selectedDriverId={selectedDriverId}
                pinState={locating ? 'searching' : pinState}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">
                    {locating
                      ? 'Pinning GPS…'
                      : pinState === 'found'
                        ? pinnedAccuracyM != null
                          ? `Pinned • ±${Math.round(pinnedAccuracyM)}m • available drivers`
                          : 'Pinned • GPS • available drivers'
                        : `Available drivers • ${mapCenter.lat.toFixed(2)}, ${mapCenter.lng.toFixed(2)}`}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    logPin('REFRESH_CLICKED');
                    
                    // Reset state
                    setLocating(true);
                    setPinState('searching');
                    setPinnedAccuracyM(null);
                    setSelectedDriverId(null);
                    
                    try {
                      const result = await getLocation();
                      
                      logPin('REFRESH_GPS_SUCCESS', { 
                        lat: result.latitude, 
                        lng: result.longitude, 
                        accuracy: result.accuracy 
                      });
                      
                      const center = { lat: result.latitude, lng: result.longitude };
                      setMapCenter(center);
                      setPinState('found');
                      setPinnedAccuracyM(result.accuracy);
                      const newDrivers = generateAvailableDrivers(center, 10);
                      setDrivers(newDrivers);
                      setSelectedDriverId(newDrivers[0]?.id ?? null);
                      setLocating(false);
                      
                      try {
                        window.localStorage.setItem('swiftTow.lastLocation', JSON.stringify(center));
                      } catch (e) {
                        logPin('STORAGE_ERROR', { error: e });
                      }
                      
                    } catch (error) {
                      logPin('REFRESH_GPS_ERROR', {
                        error: error instanceof Error ? error.message : String(error)
                      });

                      // Try stored location
                      let stored: LatLng | null = null;
                      try {
                        const raw = window.localStorage.getItem('swiftTow.lastLocation');
                        if (raw) {
                          stored = JSON.parse(raw) as LatLng;
                        }
                      } catch (e) {
                        logPin('STORAGE_READ_ERROR', { error: e });
                      }

                      if (stored) {
                        setMapCenter(stored);
                        setPinState('available');
                        setPinnedAccuracyM(null);
                        const newDrivers = generateAvailableDrivers(stored, 10);
                        setDrivers(newDrivers);
                        setSelectedDriverId(newDrivers[0]?.id ?? null);
                        setLocating(false);
                        return;
                      }

                      // Try IP-based geolocation
                      try {
                        const response = await fetch('https://ipapi.co/json/');
                        const data = await response.json();
                        if (data.latitude && data.longitude) {
                          const ipLocation: LatLng = { lat: data.latitude, lng: data.longitude };
                          setMapCenter(ipLocation);
                          setPinState('available');
                          setPinnedAccuracyM(null);
                          const newDrivers = generateAvailableDrivers(ipLocation, 10);
                          setDrivers(newDrivers);
                          setSelectedDriverId(newDrivers[0]?.id ?? null);
                          setLocating(false);
                          return;
                        }
                      } catch (e) {
                        logPin('IP_LOCATION_FAILED', { error: e });
                      }

                      // Last resort: keep current center
                      setPinState('available');
                      setPinnedAccuracyM(null);
                      setLocating(false);
                      setLocationFailed(true);
                    }
                  }}
                  className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={locating}
                >
                  {locating ? 'Locating...' : (
                    <>
                      <Search size={14} />
                      Refresh Location
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="h-[450px] rounded-[2.5rem] bg-white border border-slate-100 p-6 shadow-card flex flex-col">
                {locationFailed || locating ? (
                  <>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-900 mb-3">
                        {locating ? 'Locating...' : 'Unable to get your location'}
                      </h3>
                      <p className="text-sm text-slate-600 mb-6">
                        {locating 
                          ? 'Getting your GPS location...' 
                          : 'Please enable location services or contact us directly via WhatsApp.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">Nearby drivers</p>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mt-1">Select a driver</h3>
                        <p className="text-sm text-slate-600 mt-2">
                          {`GPS pinned at ${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)}${
                            pinnedAccuracyM != null ? ` (±${Math.round(pinnedAccuracyM)}m)` : ''
                          }. Tap a driver to highlight it.`}
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
                  </>
                )}

                <button
                  type="button"
                  onClick={() => window.open('https://wa.me/12089695688?text=Hi%20SwiftTow,%20I%20need%20roadside%20assistance.', '_blank')}
                  className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-emerald"
                >
                  Request Assistance
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}