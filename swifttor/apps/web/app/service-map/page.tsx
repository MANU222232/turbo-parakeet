'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { ChevronLeft, ShoppingCart, Loader2 } from 'lucide-react';

import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useCartStore } from '@/store/useCartStore';
import { MapSheet } from '@/components/ui/MapSheet';
import { ShopCard } from '@/components/ui/ShopCard';
import ShopDrawer from '@/components/ui/ShopDrawer';
import { SHOPS, Shop } from '@/lib/constants/shops';

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

export default function ServiceMapPage() {
  const router = useRouter();
  const store = useEmergencyStore();
  const cart = useCartStore();
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [drawerShop, setDrawerShop] = useState<Shop | null>(null);
  const [sortParam, setSortParam] = useState<SortParam>('recommended');

  const center = {
    lat: store.lat || 34.0522,
    lng: store.lng || -118.2437,
  };

  // ✅ AGENT: Removed redundant useJsApiLoader as it is now handled by the global GoogleMapsProvider
  const isLoaded = true; 

  const onSelectShop = (id: string) => setSelectedShop(id);

  const sortedShops = [...SHOPS].sort((a, b) => {
    if (sortParam === 'nearest') return a.distanceMi - b.distanceMi;
    if (sortParam === 'fastest') return a.etaMins - b.etaMins;
    if (sortParam === 'rated')   return b.rating - a.rating;
    return bestMatchScore(b) - bestMatchScore(a); // recommended
  });

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
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252528' }] },
              ],
            }}
          >
            {/* User Location */}
            <MarkerF position={center} icon={{ url: "data:image/svg+xml,%3Csvg height='20' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' fill='%234FC3F7' stroke='%23ffffff' stroke-width='2' /%3E%3C/svg%3E" }} />

            {/* Shop Locations */}
            {SHOPS.map(shop => (
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
            <h2 className="text-h3 font-black text-white">Nearby Trucks</h2>
            <div className="text-micro text-neutral-400 font-bold uppercase tracking-widest border border-white/10 rounded-full px-2 py-1 bg-white/5">
              {SHOPS.length} Available
            </div>
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
