'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';

// Generic sleek silver map style
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
];

type LatLng = { lat: number; lng: number };
type DummyDriver = { id: number; position: LatLng };

const DEFAULT_CENTER: LatLng = { lat: 37.7749, lng: -122.4194 }; // Fallback center

export default function MapContainer({
  center,
  drivers,
  selectedDriverId,
  pinState = 'demo',
}: {
  center?: LatLng;
  drivers?: DummyDriver[];
  selectedDriverId?: number | null;
  // Controls how we visually represent the "your location" pin.
  // - 'pinned' = real GPS pin (red)
  // - 'pinning' = GPS request in progress (amber)
  // - 'demo' = demo/stored center (gray)
  pinState?: 'demo' | 'pinning' | 'pinned';
}) {
  const activeCenter = center ?? DEFAULT_CENTER;
  const activeDrivers = drivers ?? [];

  const clientPinFill =
    pinState === 'pinned' ? '#ef4444' : pinState === 'pinning' ? '#f59e0b' : '#94a3b8';
  const clientPinScale = pinState === 'demo' ? 9 : 10;

  return (
    <div className="relative w-full h-full bg-slate-100 group">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={activeCenter}
        zoom={13}
        options={{
          styles: MAP_STYLES,
          // View-only behavior (no interaction while browsing).
          draggable: false,
          keyboardShortcuts: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          clickableIcons: false,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'none', // Prevent user scrolling on the landing page map
        }}
      >
        {/* Plot actual Google Maps Markers */}
        {activeDrivers.map((driver) => (
          <MarkerF
            key={driver.id}
            position={driver.position}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
              fillColor: driver.id === selectedDriverId ? '#2563eb' : '#10b981', // blue-600 vs emerald-500
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#ffffff',
              scale: driver.id === selectedDriverId ? 2.0 : 1.5,
              anchor: new google.maps.Point(12, 24),
            }}
          />
        ))}

        {/* Highlight Main Client Area */}
        <MarkerF
          position={activeCenter}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: clientPinFill,
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#ffffff',
            scale: clientPinScale,
          }}
        />
      </GoogleMap>

      {/* Dynamic Overlay indicating real map */}
      <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Live Fleet Map
      </div>
    </div>
  );
}
