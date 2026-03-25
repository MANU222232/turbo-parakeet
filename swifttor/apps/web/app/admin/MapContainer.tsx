"use client";

import React, { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Location { lat: number; lng: number; address?: string; }

const mapContainerStyle = { width: '100%', height: '100%' };

export const MapContainer = ({ 
  center, 
  zoom = 13, 
  markerPosition, 
  truckPosition,
  nearbyDrivers,
  onMapClick 
}: { 
  center: Location; 
  zoom?: number; 
  markerPosition?: Location;
  truckPosition?: Location;
  nearbyDrivers?: Location[];
  onMapClick?: (loc: Location) => void;
}) => {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-white/10 bg-neutral-900">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={(e) => {
          if (onMapClick && e.latLng) {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        }}
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
        {markerPosition && (
          <MarkerF 
            position={markerPosition} 
            icon={{
              url: "data:image/svg+xml,%3Csvg height='30' width='30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='10' fill='%23ef4444' stroke='%23ffffff' stroke-width='3' /%3E%3C/svg%3E",
              anchor: new google.maps.Point(15, 15)
            }}
          />
        )}
        
        {truckPosition && (
          <MarkerF 
            position={truckPosition}
            icon={{
              url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff' width='36' height='36'%3E%3Cpath d='M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 13l-1.5-3H15v3h4z'/%3E%3C/svg%3E",
              anchor: new google.maps.Point(18, 18)
            }}
          />
        )}

        {nearbyDrivers?.map((pos, i) => (
          <MarkerF 
            key={i} 
            position={pos}
            onClick={() => setSelectedDriver(i)}
            icon={{
              url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981' width='28' height='28'%3E%3Cpath d='M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 13l-1.5-3H15v3h4z'/%3E%3C/svg%3E",
              anchor: new google.maps.Point(14, 14)
            }}
          >
            {selectedDriver === i && (
              <InfoWindowF onCloseClick={() => setSelectedDriver(null)}>
                <div className="p-2 text-slate-900 font-bold min-w-[100px]">
                  <p className="text-xs uppercase tracking-tight">Active Unit</p>
                  <p className="text-micro text-slate-500 italic">En Route to Scene</p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
};
