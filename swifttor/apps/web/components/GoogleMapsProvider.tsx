'use client';

import { useJsApiLoader, Libraries } from '@react-google-maps/api';
import { ReactNode } from 'react';

const LIBRARIES: Libraries = ['maps'];

export default function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
