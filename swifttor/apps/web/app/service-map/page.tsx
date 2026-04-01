'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import {
  ChevronLeft,
  ShoppingCart,
  Loader2,
  Search,
  Clock,
  MapPin,
  Filter,
  X,
  Star,
  Navigation,
  SlidersHorizontal,
  Target,
  Zap,
  Shield,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useCartStore } from '@/store/useCartStore';
import { MapSheet } from '@/components/ui/MapSheet';
import { ShopCard } from '@/components/ui/ShopCard';
import ShopDrawer from '@/components/ui/ShopDrawer';
import { Shop } from '@/lib/constants/shops';

const mapContainerStyle = { width: '100vw', height: '100vh' };

// Enhanced driver marker with green gradient (matches app theme)
const DRIVER_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52' width='52px' height='52px'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981CC;stop-opacity:1' /%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='2.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='26' cy='26' r='20' fill='url(%23grad)' filter='url(%23glow)'/%3E%3Ccircle cx='26' cy='26' r='16' fill='url(%23grad)' stroke='%23fff' stroke-width='3'/%3E%3Cpath d='M26 15 L28.8 20.5 L35 20.5 L30 24.5 L32 30.5 L26 26.5 L20 30.5 L22 24.5 L17 20.5 L23.2 20.5 Z' fill='%23ffffff'/%3E%3C/svg%3E";

type SortParam = 'recommended' | 'nearest' | 'fastest' | 'rated';
type RatingFilter = 'all' | '4+' | '4.5+';

/** Composite Best Match score */
function bestMatchScore(shop: Shop): number {
  return (
    (1 / shop.distanceMi) * 0.4 +
    shop.rating * 0.3 +
    (shop.rate / 100) * 0.2 -
    (shop.etaMins / 100) * 0.1
  );
}

type LatLng = { lat: number; lng: number };

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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (a + b).toUpperCase();
}

function generateAvailableDrivers(center: LatLng, count = 8): Shop[] {
  const rand = mulberry32(seedFromLatLng(center));

  const shopNames = [
    'Swift Mile Recovery',
    'Night Owl Flatbed',
    'RapidRoad Response',
    'Golden Hour Towing',
    'Metro Tow & Go',
    'Onsite Rescue Team',
    'Prime Wheel-Lift',
    'Express Tow Pros',
  ];

  const driverNames = [
    'Mike Okonkwo',
    'Priya Nair',
    'Carlos Rivera',
    'Elena Rodriguez',
    'David Chen',
    'Sarah Mwangi',
    'James Otieno',
    'Linda Wanjiku',
  ];

  const truckTemplates = [
    'White Flatbed #FT-',
    'Blue Pickup #PU-',
    'Yellow Tow Truck #TT-',
    'Silver Wrecker #WR-',
    'Orange Heavy Duty #HD-',
    'Black Rotator #RT-',
  ];

  const milesPerDegLat = 69;
  const milesPerDegLng = 69 * Math.cos((center.lat * Math.PI) / 180);

  const shops: Shop[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const distDeg = 0.01 + rand() * 0.035;
    const dLat = Math.cos(angle) * distDeg;
    const dLng = Math.sin(angle) * distDeg;

    const lat = center.lat + dLat;
    const lng = center.lng + dLng;

    const dx = dLng * milesPerDegLng;
    const dy = dLat * milesPerDegLat;
    const distanceMi = clamp(Math.sqrt(dx * dx + dy * dy), 0.3, 2.5);

    const rating = clamp(4.2 + rand() * 0.8, 4.2, 5);
    const etaMins = Math.round(clamp(distanceMi * 12 + 5 + rand() * 20, 17, 45));
    const rate = Math.round(clamp(90 + rand() * 9, 88, 99));
    const reviews = Math.round(60 + rand() * 700);
    const jobs = Math.round(120 + rand() * 5000);

    const driver = driverNames[i % driverNames.length];
    const truck = `${truckTemplates[i % truckTemplates.length]}${100 + i}`;

    shops.push({
      id: `driver_${i + 1}`,
      name: shopNames[i % shopNames.length],
      distanceMi: Math.round(distanceMi * 10) / 10,
      etaMins,
      rating: Math.round(rating * 10) / 10,
      reviews,
      rate,
      jobs,
      driver,
      driverInitials: initialsFromName(driver),
      truck,
      lat,
      lng,
      address: 'Service location',
      phone: '+1 (415) 555-01' + String(10 + i).padStart(2, '0'),
      image: `https://i.pravatar.cc/200?img=${(i + 10) % 70}`,
    });
  }

  return shops;
}

// Map style constants - Light theme with green accents
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d1fae5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cffafe' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0891b2' }] },
];

export default function ServiceMapPage() {
  const router = useRouter();
  const store = useEmergencyStore();
  const cart = useCartStore();

  // Map loading state
  const { isLoaded: mapLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['maps'],
    version: 'weekly',
  });

  // Selection state
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [drawerShop, setDrawerShop] = useState<Shop | null>(null);

  // Sort and filter state
  const [sortParam, setSortParam] = useState<SortParam>('recommended');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [showFilters, setShowFilters] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchDebounced, setSearchDebounced] = useState('');

  // Location state
  const [locating, setLocating] = useState(false);
  const [hasPinned, setHasPinned] = useState(false);
  const [pinnedCenter, setPinnedCenter] = useState<LatLng | null>(null);
  const [pinnedAccuracyM, setPinnedAccuracyM] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pinTimeoutRef = useRef<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const logPin = (stage: string, data?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(`[ServiceMapPin] ${new Date().toISOString()}`, stage, data ?? {});
  };

  const fallbackCenter = useMemo<LatLng>(
    () => ({
      lat: store.lat ?? 34.0522,
      lng: store.lng ?? -118.2437,
    }),
    [store.lat, store.lng],
  );
  const center = pinnedCenter ?? fallbackCenter;

  const availableDrivers = useMemo(() => generateAvailableDrivers(center, 8), [center.lat, center.lng]);

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    let list = [...availableDrivers];

    // Apply search filter
    if (searchDebounced.trim()) {
      const query = searchDebounced.toLowerCase();
      list = list.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        shop.driver.toLowerCase().includes(query) ||
        shop.truck.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (ratingFilter === '4+') {
      list = list.filter(shop => shop.rating >= 4.0);
    } else if (ratingFilter === '4.5+') {
      list = list.filter(shop => shop.rating >= 4.5);
    }

    // Apply distance filter
    list = list.filter(shop => shop.distanceMi <= maxDistance);

    // Apply sorting
    list.sort((a, b) => {
      if (sortParam === 'nearest') return a.distanceMi - b.distanceMi;
      if (sortParam === 'fastest') return a.etaMins - b.etaMins;
      if (sortParam === 'rated') return b.rating - a.rating;
      return bestMatchScore(b) - bestMatchScore(a);
    });

    return list;
  }, [availableDrivers, sortParam, ratingFilter, maxDistance, searchDebounced]);

  const onSelectShop = useCallback((id: string) => setSelectedShop(id), []);

  const handlePinLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    logPin('CLICK/START');

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (pinTimeoutRef.current != null) {
      window.clearTimeout(pinTimeoutRef.current);
      pinTimeoutRef.current = null;
    }

    setLocating(true);
    setHasPinned(false);
    setPinnedCenter(null);
    setPinnedAccuracyM(null);

    let bestAcc: number | null = null;
    let bestCenter: LatLng | null = null;
    const ACCEPTABLE_M = 600;
    const DEADLINE_MS = 60000;

    const handlePosition = (pos: GeolocationPosition, source: string) => {
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const acc = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
      logPin('GPS_UPDATE', { source, lat: next.lat, lng: next.lng, accuracyM: acc });

      const shouldReplace = acc != null && (bestAcc == null || acc < bestAcc);
      if (shouldReplace) {
        bestAcc = acc;
        bestCenter = next;
        setPinnedCenter(next);
        setPinnedAccuracyM(acc);
      } else if (bestCenter == null) {
        bestCenter = next;
        setPinnedCenter(next);
        setPinnedAccuracyM(acc);
      }

      if (acc != null && acc <= ACCEPTABLE_M) {
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (pinTimeoutRef.current != null) {
          window.clearTimeout(pinTimeoutRef.current);
          pinTimeoutRef.current = null;
        }
        store.setLocation(next.lat, next.lng, 'Current location');
        setHasPinned(true);
        setSelectedShop(null);
        setDrawerShop(null);
        setLocating(false);
      }
    };

    const success = (pos: GeolocationPosition) => {
      handlePosition(pos, 'watchPosition');
    };

    const failure = (err: GeolocationPositionError) => {
      logPin('GPS_FAILURE', { code: err?.code, message: err?.message });
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (pinTimeoutRef.current != null) {
        window.clearTimeout(pinTimeoutRef.current);
        pinTimeoutRef.current = null;
      }
      setHasPinned(false);
      setPinnedCenter(null);
      setPinnedAccuracyM(null);
      setSelectedShop(null);
      setDrawerShop(null);
      setLocating(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(success, failure, {
      enableHighAccuracy: true,
      maximumAge: 0,
    });
    logPin('WATCH_STARTED', { watchId: watchIdRef.current });

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => handlePosition(pos, 'getCurrentPosition'),
        (err) => logPin('GETCURRENT_FAILURE', { code: err?.code, message: err?.message }),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
      );
    } catch {
      logPin('GETCURRENT_THROW');
    }

    pinTimeoutRef.current = window.setTimeout(() => {
      logPin('DEADLINE_TIMEOUT_FIRED', { bestAccM: bestAcc, bestCenter });
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (pinTimeoutRef.current != null) {
        window.clearTimeout(pinTimeoutRef.current);
        pinTimeoutRef.current = null;
      }

      if (bestCenter) {
        setPinnedCenter(bestCenter);
        setPinnedAccuracyM(bestAcc);
        store.setLocation(bestCenter.lat, bestCenter.lng, 'Current location');
        setHasPinned(true);
      } else {
        setHasPinned(false);
      }

      setSelectedShop(null);
      setDrawerShop(null);
      setLocating(false);
    }, DEADLINE_MS);
  }, [store]);

  const clearFilters = useCallback(() => {
    setRatingFilter('all');
    setMaxDistance(15);
    setSearchQuery('');
  }, []);

  const hasActiveFilters = ratingFilter !== 'all' || maxDistance < 15 || searchDebounced.trim();

  // Quick filter presets
  const quickFilters = [
    { label: '⚡ Under 15min', fn: () => { setSortParam('fastest'); setMaxDistance(5); } },
    { label: '⭐ 4.5+ Only', fn: () => setRatingFilter('4.5+') },
    { label: '📍 Within 5mi', fn: () => setMaxDistance(5) },
  ];

  return (
    <main className="relative min-h-[100dvh] w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Top Floating Header - Enhanced */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-0 left-0 right-0 z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-white via-white/95 to-transparent pb-6"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => router.push('/emergency-report')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <motion.button
            onClick={() => router.push('/checkout')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl active:scale-95 transition-transform"
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {cart.items.length > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-[10px] font-bold text-white border-2 border-white shadow-lg"
                >
                  {cart.items.length}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Search bar - Enhanced */}
        <motion.div
          className="relative"
          animate={{
            scale: isSearchFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${isSearchFocused ? 'text-[#10b981]' : 'text-neutral-400'}`} />
          <input
            type="text"
            placeholder="Search by name, driver, or truck..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full h-12 pl-11 pr-10 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#10b981]/50 focus:ring-2 focus:ring-[#10b981]/20 transition-all"
            aria-label="Search service providers"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X size={15} className="text-neutral-500" />
            </motion.button>
          )}
        </motion.div>

        {/* Action buttons - Enhanced */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={handlePinLocation}
            disabled={locating}
            whileHover={{ scale: locating ? 1 : 1.02 }}
            whileTap={{ scale: locating ? 1 : 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] backdrop-blur-sm border border-slate-200 text-white px-3 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : hasPinned ? (
              <Target size={14} className="text-white" />
            ) : (
              <MapPin size={14} />
            )}
            {locating ? 'Searching…' : hasPinned ? 'Results Found' : 'Search Drivers'}
          </motion.button>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#10b981]'
                : 'bg-white/90 backdrop-blur-sm border-slate-200 text-neutral-400'
            }`}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-[#10b981] rounded-full"
              />
            )}
          </motion.button>

          <motion.div 
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-white px-3 py-2.5 rounded-full"
            whileHover={{ scale: 1.02 }}
          >
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {locating
                ? 'Searching…'
                : hasPinned
                  ? pinnedAccuracyM != null
                    ? `±${Math.round(pinnedAccuracyM)}m`
                    : 'Active'
                  : 'Standby'}
            </span>
          </motion.div>
        </div>

        {/* Quick filter presets */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {quickFilters.map((filter, idx) => (
            <motion.button
              key={filter.label}
              onClick={filter.fn}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-none px-3 py-1.5 bg-white/80 border border-slate-200 rounded-full text-[9px] font-bold text-neutral-400 hover:text-white hover:border-slate-300 transition-all whitespace-nowrap"
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Filter panel - Enhanced */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#10b981]" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Filters</span>
                </div>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={clearFilters}
                    className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <X size={10} />
                    Clear All
                  </motion.button>
                )}
              </div>

              {/* Rating filter */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Star size={10} className="text-[#FFD700]" />
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {(['all', '4+', '4.5+'] as RatingFilter[]).map((rating) => (
                    <motion.button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        ratingFilter === rating
                          ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg shadow-[#10b981]/20'
                          : 'bg-slate-100 text-neutral-400 hover:bg-white/10'
                      }`}
                    >
                      {rating === 'all' ? 'All' : `⭐ ${rating}`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Distance filter */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={10} className="text-[#10b981]" />
                    Max Distance
                  </label>
                  <span className="text-xs font-black text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-lg">{maxDistance} mi</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#10b981] [&::-webkit-slider-thumb]:to-[#059669] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                  aria-label="Maximum distance filter"
                />
                <div className="flex justify-between mt-1.5 text-[9px] text-slate-500 font-bold">
                  <span>1mi</span>
                  <span>15mi</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Map Layer - Enhanced */}
      <div className="absolute inset-0 z-0 bg-[#070707]">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400">
            <AlertCircle className="h-12 w-12 text-[#10b981]" />
            <div className="text-center">
              <p className="text-base font-bold text-white mb-1">Map Loading Error</p>
              <p className="text-sm text-neutral-500 mb-4">Unable to load the map. Please check your connection.</p>
              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#10b981] text-white rounded-full text-xs font-bold uppercase tracking-widest"
              >
                <RefreshCw size={14} />
                Retry
              </motion.button>
            </div>
          </div>
        ) : mapLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              draggable: false,
              keyboardShortcuts: false,
              scrollwheel: false,
              disableDoubleClickZoom: true,
              clickableIcons: false,
              styles: MAP_STYLES,
            }}
          >
            {/* User/GPS marker - Enhanced */}
            <MarkerF
              position={center}
              icon={{
                url: locating
                  ? "data:image/svg+xml,%3Csvg height='34' width='34' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='17' cy='17' r='12' fill='%23FFA500' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='17' cy='17' r='6' fill='%23fff'/%3E%3C/svg%3E"
                  : hasPinned
                    ? "data:image/svg+xml,%3Csvg height='34' width='34' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='17' cy='17' r='12' fill='%23FF3B3B' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='17' cy='17' r='6' fill='%23fff'/%3E%3C/svg%3E"
                    : "data:image/svg+xml,%3Csvg height='28' width='28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='14' cy='14' r='10' fill='%2364748b' stroke='%23ffffff' stroke-width='2.5'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%23fff'/%3E%3C/svg%3E",
                scaledSize: { width: locating || hasPinned ? 34 : 28, height: locating || hasPinned ? 34 : 28 } as any,
              }}
              zIndex={100}
            />

            {/* Shop Locations */}
            {filteredAndSortedShops.map((shop) => (
              <MarkerF
                key={shop.id}
                position={{ lat: shop.lat, lng: shop.lng }}
                icon={{
                  url: DRIVER_ICON,
                  scaledSize: { width: 46, height: 46 } as any,
                  anchor: { x: 23, y: 23 } as any,
                }}
                onClick={() => { onSelectShop(shop.id); setDrawerShop(shop); }}
                animation={selectedShop === shop.id ? 1 : undefined}
                zIndex={selectedShop === shop.id ? 10 : 1}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-10 w-10 text-[#10b981]" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-[#10b981]">Loading Map</p>
              <p className="text-xs text-slate-500 mt-1">Please wait...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet - Enhanced */}
      <MapSheet
        title="Available Drivers"
        subtitle={`${filteredAndSortedShops.length} found`}
      >
        {/* Sort Pills - Enhanced */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
          {([
            ['recommended', '⭐ Best Match'],
            ['nearest',    '📍 Nearest'],
            ['fastest',    '⚡ Fastest'],
            ['rated',      '🏆 Top Rated'],
          ] as [SortParam, string][]).map(([p, label]) => (
            <motion.button
              key={p}
              onClick={() => setSortParam(p)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-none px-4 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                sortParam === p
                  ? 'border-[#10b981] bg-gradient-to-r from-[#10b981]/15 to-[#10b981]/5 text-[#10b981] shadow-lg shadow-[#10b981]/10'
                  : 'border-slate-200 bg-white text-neutral-400 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Results info */}
        {hasActiveFilters && (
          <motion.div 
            className="flex items-center justify-between mb-3 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Filter size={8} />
              {filteredAndSortedShops.length} of {availableDrivers.length} drivers
            </span>
            <button
              onClick={clearFilters}
              className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {/* Shop List - Enhanced with loading and empty states */}
        <div className="space-y-3 pb-safe">
          {!mapLoaded ? (
            // Loading state
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-28 bg-white rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredAndSortedShops.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <motion.div 
                className="text-5xl mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">No drivers found</h3>
              <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
                {searchDebounced 
                  ? `No results for "${searchDebounced}". Try a different search term.`
                  : 'Try adjusting your filters or expanding your search area.'}
              </p>
              <div className="flex flex-col gap-2">
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-[#10b981] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#10b981]/90 transition-colors"
                  >
                    Clear All Filters
                  </motion.button>
                )}
                <motion.button
                  onClick={() => { setMaxDistance(15); setRatingFilter('all'); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-white text-white rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  Expand Search Area
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // Shop cards
            filteredAndSortedShops.map((shop, i) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ShopCard
                  {...shop}
                  image={shop.image || ''}
                  selected={selectedShop === shop.id}
                  isBestMatch={i === 0 && sortParam === 'recommended'}
                  onClick={() => { onSelectShop(shop.id); setDrawerShop(shop); }}
                />
              </motion.div>
            ))
          )}
        </div>
      </MapSheet>

      {/* Shop Drawer */}
      <AnimatePresence>
        {drawerShop && (
          <ShopDrawer shop={drawerShop} onClose={() => setDrawerShop(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}


