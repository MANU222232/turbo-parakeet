'use client';

import { GoogleMap, MarkerF, InfoWindowF, Circle } from '@react-google-maps/api';
import { useState, useCallback, useMemo } from 'react';

// Premium dark map style optimized for roadside assistance UX
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#070707' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#070707' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#101010' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#101010' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#141414' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#2f2f2f' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f0f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2a2a2a' }] },
];

type LatLng = { lat: number; lng: number };

interface Driver {
  id: string | number;
  position: LatLng;
  name?: string;
  eta?: number;
  rating?: number;
  distance?: number;
  isSelected?: boolean;
}

interface MapContainerProps {
  center?: LatLng;
  drivers?: Driver[];
  selectedDriverId?: string | number | null;
  pinState?: 'demo' | 'pinning' | 'pinned';
  accuracyMeters?: number | null;
  onDriverClick?: (driverId: string | number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showZoomControls?: boolean;
  interactive?: boolean;
}

// Generate SVG marker for drivers with rating indicator and pulse animation
const generateDriverMarker = (isSelected: boolean, rating: number = 4.5, eta?: number) => {
  const color = isSelected ? '#00D16C' : '#FF6200';
  const scale = isSelected ? 1.3 : 1;
  const starFill = rating >= 4.5 ? '#FFD700' : rating >= 4.0 ? '#FFA500' : '#FF6B6B';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="${52 * scale}" height="${52 * scale}">
      <defs>
        <filter id="glow${isSelected ? 'Selected' : ''}">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="grad${isSelected ? 'Sel' : ''}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="26" cy="26" r="20" fill="url(#grad${isSelected ? 'Sel' : ''})" filter="url(#glow${isSelected ? 'Selected' : ''})"/>
      <circle cx="26" cy="26" r="16" fill="url(#grad${isSelected ? 'Sel' : ''})" stroke="#fff" stroke-width="3"/>
      <circle cx="26" cy="26" r="7" fill="#fff" opacity="0.25"/>
      <path d="M26 15 L28.8 20.5 L35 20.5 L30 24.5 L32 30.5 L26 26.5 L20 30.5 L22 24.5 L17 20.5 L23.2 20.5 Z" fill="${starFill}" stroke="#000" stroke-width="0.5"/>
      ${eta ? `<text x="26" y="48" font-family="DM Mono, monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${eta}m</text>` : ''}
    </svg>
  `)}`;
};

// Generate SVG for user location pin with enhanced pulse
const generateUserPin = (state: 'demo' | 'pinning' | 'pinned', accuracyMeters?: number | null) => {
  const config = {
    demo: { fill: '#64748b', stroke: '#94a3b8', pulse: false },
    pinning: { fill: '#FFA500', stroke: '#FFB84D', pulse: true },
    pinned: { fill: '#FF3B3B', stroke: '#FF6B6B', pulse: true },
  };

  const { fill, stroke, pulse } = config[state];

  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44">
        <defs>
          <filter id="pinGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${fill};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${fill}DD;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r="14" fill="url(#pinGrad)" stroke="${stroke}" stroke-width="3.5" filter="url(#pinGlow)"/>
        <circle cx="22" cy="22" r="6" fill="#fff"/>
        <circle cx="22" cy="22" r="3" fill="${fill}"/>
        ${pulse ? `<circle cx="22" cy="22" r="18" fill="none" stroke="${fill}" stroke-width="2" opacity="0.5">
          <animate attributeName="r" from="14" to="22" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="22" cy="22" r="18" fill="none" stroke="${fill}" stroke-width="2" opacity="0.3">
          <animate attributeName="r" from="14" to="22" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
        </circle>` : ''}
      </svg>
    `)}`,
    scaledSize: { width: 44, height: 44 },
    anchor: { x: 22, y: 22 },
  };
};

// Enhanced info window content with better styling
const renderInfoWindowContent = (driver: Driver) => {
  const ratingColor = (driver.rating ?? 4.5) >= 4.5 ? '#FFD700' : (driver.rating ?? 4.5) >= 4.0 ? '#FFA500' : '#FF6B6B';
  
  return `
    <div style="font-family: 'DM Sans', sans-serif; padding: 12px 16px; min-width: 180px; background: #101010; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="font-weight: 800; color: #FF6200; font-size: 15px; margin-bottom: 6px;">${driver.name || 'Driver'}</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${driver.eta ? `
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #00D16C;">
            <span style="font-weight: 700;">⏱ ${driver.eta}m</span>
            <span style="color: #6b6b6b;">ETA</span>
          </div>
        ` : ''}
        ${driver.distance ? `
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8b949e;">
            <span>📍 ${driver.distance.toFixed(1)}mi</span>
          </div>
        ` : ''}
        ${driver.rating ? `
          <div style="display: flex; align-items: center; gap: 4px; font-size: 12px;">
            <span style="color: ${ratingColor};">★</span>
            <span style="color: #fff; font-weight: 600;">${driver.rating}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

export default function MapContainer({
  center,
  drivers = [],
  selectedDriverId = null,
  pinState = 'demo',
  accuracyMeters = null,
  onDriverClick,
  onMapClick,
  showZoomControls = false,
  interactive = false,
}: MapContainerProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [infoWindowData, setInfoWindowData] = useState<{ position: LatLng; content: string } | null>(null);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const handleMarkerClick = useCallback((driver: Driver, e: google.maps.MapMouseEvent) => {
    e.stop();
    if (onDriverClick) {
      onDriverClick(driver.id);
    }
    if (driver.name) {
      setInfoWindowData({
        position: driver.position,
        content: renderInfoWindowContent(driver),
      });
    }
  }, [onDriverClick]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
    setInfoWindowData(null);
  }, [onMapClick]);

  const activeCenter = center ?? { lat: 37.7749, lng: -122.4194 };

  // Memoize marker icons for performance
  const driverMarkers = useMemo(() => drivers.map(driver => ({
    ...driver,
    icon: {
      url: generateDriverMarker(driver.isSelected || driver.id === selectedDriverId, driver.rating ?? 4.5, driver.eta),
      scaledSize: { width: 52, height: 52 } as google.maps.Size,
      anchor: { x: 26, y: 26 } as google.maps.Point,
    },
  })), [drivers, selectedDriverId]);

  const userPinIcon = useMemo(() => generateUserPin(pinState, accuracyMeters), [pinState, accuracyMeters]);

  return (
    <div className="relative w-full h-full bg-[#070707] group">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={activeCenter}
        zoom={13}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        options={{
          styles: MAP_STYLES,
          draggable: interactive,
          keyboardShortcuts: interactive,
          scrollwheel: interactive,
          disableDoubleClickZoom: !interactive,
          clickableIcons: false,
          disableDefaultUI: !showZoomControls,
          zoomControl: showZoomControls,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: interactive ? 'greedy' : 'none',
          backgroundColor: '#070707',
        }}
      >
        {/* Driver Markers */}
        {driverMarkers.map((driver) => (
          <MarkerF
            key={driver.id}
            position={driver.position}
            icon={driver.icon as google.maps.Icon}
            onClick={(e) => handleMarkerClick(driver, e)}
            animation={driver.id === selectedDriverId ? google.maps.Animation.BOUNCE : undefined}
            zIndex={driver.id === selectedDriverId ? 10 : 1}
          />
        ))}

        {/* User Location Pin */}
        <MarkerF
          position={activeCenter}
          icon={userPinIcon as google.maps.Icon}
          zIndex={100}
        />

        {/* Accuracy Circle for Pinned Location */}
        {pinState === 'pinned' && accuracyMeters && mapInstance && (
          <Circle
            center={activeCenter}
            radius={accuracyMeters}
            options={{
              strokeColor: '#FF3B3B',
              strokeOpacity: 0.25,
              strokeWeight: 1,
              fillColor: '#FF3B3B',
              fillOpacity: 0.08,
              clickable: false,
            }}
          />
        )}

        {/* Info Window */}
        {infoWindowData && (
          <InfoWindowF
            position={infoWindowData.position}
            onCloseClick={() => setInfoWindowData(null)}
            options={{
              pixelOffset: { width: 0, height: -60 } as google.maps.Size,
              disableAutoPan: true,
              maxWidth: 220,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: infoWindowData.content }} />
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 bg-[#070707]/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md text-[9px] text-neutral-600 border border-white/5 z-10 select-none">
        Map data ©2024
      </div>

      {/* Interactive Mode Indicator */}
      {interactive && (
        <div className="absolute top-4 left-4 bg-[#101010]/95 backdrop-blur-sm text-white px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2.5 z-10 border border-white/10">
          <div className="w-2 h-2 bg-[#00D16C] rounded-full animate-pulse" />
          Interactive Map
        </div>
      )}

      {/* Compass / North indicator */}
      <div className="absolute top-4 right-4 bg-[#101010]/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center z-10 border border-white/10 shadow-lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#FF6200" opacity="0.3"/>
          <path d="M12 4V10M12 14V20M4 12H10M14 12H20" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
