'use client';

import { useEffect } from 'react';

/**
 * BackendPinger
 * 
 * Simple component that pings the backend health endpoint every 5 minutes
 * to prevent Render/Heroku free instances from spinning down due to inactivity.
 */
export default function BackendPinger() {
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://swifttor-api.onrender.com';
    const HEALTH_ENDPOINT = `${API_URL}/health`;

    const pingBackend = async () => {
      try {
        console.log('pinging backend to keep it active...');
        const res = await fetch(HEALTH_ENDPOINT, { mode: 'no-cors' });
        // 'no-cors' is used because we don't necessarily need to read the response,
        // just making the request is enough to wake up the server.
      } catch (err) {
        console.error('Failed to ping backend:', err);
      }
    };

    // Initial ping
    pingBackend();

    // Set interval for every 5 minutes (300,000 ms)
    const interval = setInterval(pingBackend, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
