'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';

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

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // Using a generic center

const MOCK_DRIVERS = [
  { id: 1, position: { lat: 37.7850, lng: -122.4100 } },
  { id: 2, position: { lat: 37.7650, lng: -122.4200 } },
  { id: 3, position: { lat: 37.7700, lng: -122.4000 } },
];

export default function MapContainer() {

  return (
    <div className="relative w-full h-full bg-slate-100 group">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={DEFAULT_CENTER}
        zoom={13}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'none', // Prevent user scrolling on the landing page map
        }}
      >
        {/* Plot actual Google Maps Markers */}
        {MOCK_DRIVERS.map((driver) => (
          <MarkerF
            key={driver.id}
            position={driver.position}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
              fillColor: '#10b981', // emerald-500
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#ffffff',
              scale: 1.5,
              anchor: new google.maps.Point(12, 24),
            }}
          />
        ))}

        {/* Highlight Main Client Area */}
        <MarkerF
          position={DEFAULT_CENTER}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#ef4444', // red-500
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#ffffff',
            scale: 8,
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
