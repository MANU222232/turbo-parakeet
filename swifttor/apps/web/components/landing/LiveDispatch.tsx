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
  const defaultCenter: LatLng = useMemo(() => ({ lat: 0.592857, lng: 35.352493 }), []); // Default to Kelji
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
      setLocationFailed(false);
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
      
      logPin('LOCATION_ACQUISITION_FAILED_USING_FALLBACK');
      
      // Simulate successful location fetch using default center
      const fakePos: GeolocationPosition = {
        coords: {
          latitude: defaultCenter.lat,
          longitude: defaultCenter.lng,
          accuracy: 50,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };
      
      applyCoords(fakePos, 'fallback');
      setStatusText('Using fallback location');
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
      
      // Hard timeout - if nothing works after 5 seconds, fallback
      setTimeout(() => {
        if (!finalized && !cancelled) {
          logPin('DEADLINE_TIMEOUT');
          fallbackToAvailable();
        }
      }, 5000);
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

  return null;
}