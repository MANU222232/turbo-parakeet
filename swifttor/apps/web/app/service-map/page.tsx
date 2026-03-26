'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { ChevronLeft, ShoppingCart, Loader2, Search, Clock } from 'lucide-react';

import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useCartStore } from '@/store/useCartStore';
import { MapSheet } from '@/components/ui/MapSheet';
import { ShopCard } from '@/components/ui/ShopCard';
import ShopDrawer from '@/components/ui/ShopDrawer';
import { Shop } from '@/lib/constants/shops';

const mapContainerStyle = { width: '100vw', height: '100vh' };
const DRIVER_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981' width='36px' height='36px'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E";

type SortParam = 'recommended' | 'nearest' | 'fastest' | 'rated';

/** Composite Best Match score — borrows the algorithm idea from SwiftTor reference */
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

function generateDummyDrivers(center: LatLng, count = 8): Shop[] {
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
    const distDeg = 0.0035 + rand() * 0.02;
    const dLat = Math.cos(angle) * distDeg;
    const dLng = Math.sin(angle) * distDeg;

    const lat = center.lat + dLat;
    const lng = center.lng + dLng;

    const dx = dLng * milesPerDegLng;
    const dy = dLat * milesPerDegLat;
    const distanceMi = clamp(Math.sqrt(dx * dx + dy * dy), 0.2, 12);

    const rating = clamp(4.2 + rand() * 0.8, 4.2, 5);
    const etaMins = Math.round(clamp(distanceMi * (3.0 + rand() * 1.5) + 6 + rand() * 8, 8, 60));
    const rate = Math.round(clamp(90 + rand() * 9, 88, 99));
    const reviews = Math.round(60 + rand() * 700);
    const jobs = Math.round(120 + rand() * 5000);

    const driver = driverNames[i % driverNames.length];
    const truck = `${truckTemplates[i % truckTemplates.length]}${100 + i}`;

    shops.push({
      id: `dummy_${i + 1}`,
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
      address: 'Pinned location (demo)',
      phone: '+1 (415) 555-01' + String(10 + i).padStart(2, '0'),
      image: `https://i.pravatar.cc/200?img=${(i + 10) % 70}`,
    });
  }

  return shops;
}

export default function ServiceMapPage() {
  const router = useRouter();
  const store = useEmergencyStore();
  const cart = useCartStore();
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [drawerShop, setDrawerShop] = useState<Shop | null>(null);
  const [sortParam, setSortParam] = useState<SortParam>('recommended');

  const [locating, setLocating] = useState(false);
  // `hasPinned` means we have a GPS pin from the user's click.
  // Until then, the map shows demo pins around the last stored center (if any).
  const [hasPinned, setHasPinned] = useState(false);
  const [pinnedCenter, setPinnedCenter] = useState<LatLng | null>(null);
  const [pinnedAccuracyM, setPinnedAccuracyM] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pinTimeoutRef = useRef<number | null>(null);

  const logPin = (stage: string, data?: Record<string, unknown>) => {
    // One place to tweak log prefix/format.
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

  // ✅ AGENT: Removed redundant useJsApiLoader as it is now handled by the global GoogleMapsProvider
  const isLoaded = true; 

  const dummyShops = useMemo(() => generateDummyDrivers(center, 8), [center.lat, center.lng]);

  const onSelectShop = (id: string) => setSelectedShop(id);

  const sortedShops = useMemo(() => {
    const list = [...dummyShops];
    list.sort((a, b) => {
      if (sortParam === 'nearest') return a.distanceMi - b.distanceMi;
      if (sortParam === 'fastest') return a.etaMins - b.etaMins;
      if (sortParam === 'rated') return b.rating - a.rating;
      return bestMatchScore(b) - bestMatchScore(a); // recommended
    });
    return list;
  }, [dummyShops, sortParam]);

  const handlePinLocation = () => {
    if (!('geolocation' in navigator)) return;
    logPin('CLICK/START');
    // Clean up any previous watch (user may click repeatedly).
    if (watchIdRef.current != null) {
      logPin('CLEAR_WATCH_PREVIOUS', { watchId: watchIdRef.current });
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (pinTimeoutRef.current != null) {
      logPin('CLEAR_TIMEOUT_PREVIOUS', { timeoutId: pinTimeoutRef.current });
      window.clearTimeout(pinTimeoutRef.current);
      pinTimeoutRef.current = null;
    }

    setLocating(true);
    setHasPinned(false);
    setPinnedCenter(null);
    setPinnedAccuracyM(null);

    let bestAcc: number | null = null;
    let bestCenter: LatLng | null = null;
    const ACCCEPTABLE_M = 600; // prefer a decent GPS fix
    const DEADLINE_MS = 60000;

    const handlePosition = (pos: GeolocationPosition, source: string) => {
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const acc = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
      logPin('GPS_UPDATE', { source, lat: next.lat, lng: next.lng, accuracyM: acc });

      // Keep updating UI to the best accuracy candidate.
      const shouldReplace = acc != null && (bestAcc == null || acc < bestAcc);
      if (shouldReplace) {
        logPin('UPDATE_BEST', { prevBestAccM: bestAcc, nextAccM: acc, nextLat: next.lat, nextLng: next.lng });
        bestAcc = acc;
        bestCenter = next;
        setPinnedCenter(next);
        setPinnedAccuracyM(acc);
      } else if (bestCenter == null) {
        // If we don't have any candidate yet, still show something.
        logPin('FIRST_CANDIDATE', { source, nextAccM: acc, nextLat: next.lat, nextLng: next.lng });
        bestCenter = next;
        setPinnedCenter(next);
        setPinnedAccuracyM(acc);
      }

      // Accept immediately if accuracy is good.
      if (acc != null && acc <= ACCCEPTABLE_M) {
        logPin('ACCEPT_EARLY', { source, acceptedAccM: acc, thresholdM: ACCCEPTABLE_M });
        if (watchIdRef.current != null) {
          logPin('CLEAR_WATCH_ACCEPT', { watchId: watchIdRef.current });
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (pinTimeoutRef.current != null) {
          logPin('CLEAR_TIMEOUT_ACCEPT', { timeoutId: pinTimeoutRef.current });
          window.clearTimeout(pinTimeoutRef.current);
          pinTimeoutRef.current = null;
        }
        store.setLocation(next.lat, next.lng, 'Pinned location (demo)');
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
      // Silent fallback: keep current center and demo pins.
      logPin('GPS_FAILURE', { code: err?.code, message: err?.message });
      if (watchIdRef.current != null) {
        logPin('CLEAR_WATCH_FAILURE', { watchId: watchIdRef.current });
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (pinTimeoutRef.current != null) {
        logPin('CLEAR_TIMEOUT_FAILURE', { timeoutId: pinTimeoutRef.current });
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
    logPin('WATCH_STARTED', { watchId: watchIdRef.current, enableHighAccuracy: true, maximumAge: 0, timeoutMs: DEADLINE_MS });

    // Fallback: some browsers/devices may not fire watch callbacks.
    // If that happens, getCurrentPosition often succeeds and gives us a usable fix.
    try {
      logPin('GETCURRENT_REQUESTED', { enableHighAccuracy: false, timeoutMs: 20000 });
      navigator.geolocation.getCurrentPosition(
        (pos) => handlePosition(pos, 'getCurrentPosition'),
        (err) => logPin('GETCURRENT_FAILURE', { code: err?.code, message: err?.message }),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
      );
    } catch {
      logPin('GETCURRENT_THROW');
    }

    pinTimeoutRef.current = window.setTimeout(() => {
      // Deadline reached: if we found any candidate, accept it; otherwise keep demo center.
      logPin('DEADLINE_TIMEOUT_FIRED', { bestAccM: bestAcc, bestCenter });
      if (watchIdRef.current != null) {
        logPin('CLEAR_WATCH_DEADLINE', { watchId: watchIdRef.current });
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (pinTimeoutRef.current != null) {
        logPin('CLEAR_TIMEOUT_DEADLINE', { timeoutId: pinTimeoutRef.current });
        window.clearTimeout(pinTimeoutRef.current);
        pinTimeoutRef.current = null;
      }

      if (bestCenter) {
        logPin('ACCEPT_AT_DEADLINE', { bestAccM, bestLat: bestCenter.lat, bestLng: bestCenter.lng });
        setPinnedCenter(bestCenter);
        setPinnedAccuracyM(bestAcc);
        store.setLocation(bestCenter.lat, bestCenter.lng, 'Pinned location (demo)');
        setHasPinned(true);
      } else {
        logPin('NO_CANDIDATE_DEADLINE');
        setHasPinned(false);
      }

      setSelectedShop(null);
      setDrawerShop(null);
      setLocating(false);
    }, DEADLINE_MS);
  };

  return (
    <main className="relative min-h-[100dvh] w-full bg-background overflow-hidden font-sans text-foreground">

      {/* Top Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background via-background/80 to-transparent pb-10">
        <button
          onClick={() => router.push('/emergency-report')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-white/10 shadow-xl active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-6 w-6 pr-0.5" />
        </button>

        <button
          onClick={() => router.push('/checkout')}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-white/10 shadow-xl active:scale-95 transition-transform"
        >
          <ShoppingCart className="h-5 w-5" />
          {cart.items.length > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-surface">
              {cart.items.length}
            </div>
          )}
        </button>
      </div>

      {/* Map Layer */}
      <div className="absolute inset-0 z-0 bg-neutral-900 flex items-center justify-center">
        {!isLoaded ? (
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-small font-bold uppercase tracking-widest text-primary">Map Engine</span>
          </div>
        ) : (
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
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252528' }] },
              ],
            }}
          >
            {/* Map overlay action */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePinLocation}
                disabled={locating}
                className="flex items-center gap-2 bg-surface border border-white/10 text-white px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform disabled:opacity-60"
              >
                <Search size={14} />
                {locating ? 'Pinning…' : hasPinned ? 'Pinned • Search again' : 'Search for drivers'}
              </button>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3 py-2 rounded-full">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {locating
                    ? 'Pinning…'
                    : hasPinned
                      ? pinnedAccuracyM != null
                        ? `Pinned • ±${Math.round(pinnedAccuracyM)}m`
                        : 'Pinned • GPS'
                      : `Demo • ${center.lat.toFixed(2)},${center.lng.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* User/GPS marker (red) or demo-center marker (gray) */}
            {locating ? (
              <MarkerF
                position={center}
                icon={{
                  url: "data:image/svg+xml,%3Csvg height='26' width='26' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='13' cy='13' r='10' fill='%23f59e0b' stroke='%23ffffff' stroke-width='2' /%3E%3C/svg%3E",
                }}
              />
            ) : hasPinned && pinnedCenter ? (
              <MarkerF
                position={pinnedCenter}
                icon={{
                  url: "data:image/svg+xml,%3Csvg height='26' width='26' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='13' cy='13' r='10' fill='%23ef4444' stroke='%23ffffff' stroke-width='2' /%3E%3C/svg%3E",
                }}
              />
            ) : (
              <MarkerF
                position={center}
                icon={{
                  url: "data:image/svg+xml,%3Csvg height='22' width='22' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='8' fill='%2394a3b8' stroke='%23ffffff' stroke-width='2' /%3E%3C/svg%3E",
                }}
              />
            )}

            {/* Shop Locations */}
            {dummyShops.map(shop => (
              <MarkerF
                key={shop.id}
                position={{ lat: shop.lat, lng: shop.lng }}
                icon={{ url: DRIVER_ICON, scaledSize: { width: 32, height: 32 } as any }}
                onClick={() => { onSelectShop(shop.id); setDrawerShop(shop); }}
                animation={selectedShop === shop.id ? 1 : undefined}
              />
            ))}
          </GoogleMap>
        )}
      </div>

      {/* Bottom Sheet */}
      <MapSheet>
        <div className="space-y-4">
          <div className="flex items-center justify-between sticky top-0 bg-surface/95 pt-2 pb-4 z-10">
            <h2 className="text-h3 font-black text-white">Drivers near you</h2>
            <div className="text-micro text-neutral-400 font-bold uppercase tracking-widest border border-white/10 rounded-full px-2 py-1 bg-white/5">
              {dummyShops.length} Available
            </div>
          </div>

          {/* Where the app thinks the center/pins are */}
          <div className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
            Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}{" "}
            {locating
              ? "• pinning GPS"
              : hasPinned
                ? pinnedAccuracyM != null
                  ? `• GPS ±${Math.round(pinnedAccuracyM)}m`
                  : "• GPS"
                : "• demo / stored center"}
          </div>

          {/* Sort Pills — Best Match is now the default */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1 text-micro font-bold uppercase tracking-widest">
            {([
              ['recommended', '⭐ Best Match'],
              ['nearest',    '📍 Nearest'],
              ['fastest',    '⚡ Fastest'],
              ['rated',      '🏆 Top Rated'],
            ] as [SortParam, string][]).map(([p, label]) => (
              <button
                key={p}
                onClick={() => setSortParam(p)}
                className={`flex-none px-4 py-2 rounded-full border transition-all ${
                  sortParam === p
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 bg-surface text-neutral-400 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Shop List */}
          <div className="space-y-3 pb-safe">
            {sortedShops.map((shop, i) => (
              <div key={shop.id} onClick={() => { onSelectShop(shop.id); setDrawerShop(shop); }}>
                  <ShopCard
                    {...shop}
                    image={shop.image || ''}
                    selected={selectedShop === shop.id}
                    onClick={() => { onSelectShop(shop.id); setDrawerShop(shop); }}
                  />
                {i === 0 && sortParam === 'recommended' && (
                  <div className="mt-1 ml-3 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                    ⭐ Best Match
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </MapSheet>

      {/* Shop Drawer */}
      {drawerShop && (
        <ShopDrawer shop={drawerShop} onClose={() => setDrawerShop(null)} />
      )}
    </main>
  );
}
