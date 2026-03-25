'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

import { MapSheet } from '@/components/ui/MapSheet';
import { OrderTimeline, TimelineStep } from '@/components/ui/OrderTimeline';
import { DriverCard } from '@/components/ui/DriverCard';

const mapContainerStyle = { width: '100vw', height: '100vh' };
const DRIVER_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F4A261' width='40px' height='40px'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E";
const USER_ICON = "data:image/svg+xml,%3Csvg height='24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='10' fill='%232DC653' stroke='%23ffffff' stroke-width='3' /%3E%3C/svg%3E";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const initialEtaSeconds = 14 * 60;
  const [secs, setSecs] = useState(initialEtaSeconds);
  const isArrived = secs <= 0;

  // Live countdown timer — borrowed from SwiftTor reference
  useEffect(() => {
    if (secs <= 0) return;
    const interval = setInterval(() => {
      setSecs(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secs]);

  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");

  // ✅ AGENT: Removed redundant useJsApiLoader as it is now handled by the global GoogleMapsProvider
  const isLoaded = true;

  const center = { lat: 34.0522, lng: -118.2437 }; // User
  const driverLoc = { lat: 34.0450, lng: -118.2500 }; // Driver slightly off

  const timelineSteps: TimelineStep[] = [
    { id: '1', title: 'Order Received', description: 'Matched with nearest driver.', status: 'completed', time: '10:42 AM' },
    { id: '2', title: 'Driver En Route', description: 'John is heading to your location now.', status: isArrived ? 'completed' : 'active', time: '10:44 AM' },
    { id: '3', title: 'Driver Arrived', description: 'Vehicle is on site.', status: isArrived ? 'active' : 'pending' },
    { id: '4', title: 'Service Complete', description: 'Resolving ticket.', status: 'pending' },
  ];

  return (
    <main className="relative min-h-[100dvh] w-full bg-background overflow-hidden font-sans text-foreground">
      
      {/* Top Floating ETA Plate */}
      <div className="absolute top-12 left-6 right-6 z-20 pointer-events-none flex justify-center dropshadow-xl transition-all">
        <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-6 flex flex-col items-center justify-center shadow-2xl min-w-[240px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
            {isArrived ? 'Status' : 'Driver Arrives In'}
          </div>
          
          <div className={`text-6xl font-black font-mono leading-none tracking-tighter ${isArrived ? 'text-emerald-500' : 'text-slate-100'}`}>
            {isArrived ? 'ARRIVED' : `${m}:${s}`}
          </div>

          {!isArrived && (
            <div className="w-full mt-6">
               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((initialEtaSeconds - secs) / initialEtaSeconds) * 100}%` }}
                />
              </div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-2 text-center">
                Updating in Real-Time · Traffic-Aware
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Layer */}
      <div className="absolute inset-0 z-0 bg-neutral-900 flex items-center justify-center">
        {!isLoaded ? (
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: (center.lat + driverLoc.lat)/2, lng: (center.lng + driverLoc.lng)/2 }}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#1A1A2E' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252528' }] },
              ]
            }}
          >
            <MarkerF position={center} icon={{ url: USER_ICON }} />
            <MarkerF position={driverLoc} icon={{ url: DRIVER_ICON, scaledSize: { width: 40, height: 40 } as any }} />
          </GoogleMap>
        )}
      </div>

      {/* Bottom Sheet Tracker Layer */}
      <MapSheet defaultSnap={380} snapPoints={[140, 380, 750]}>
        <div className="space-y-8 pt-2 pb-safe">
          
          <DriverCard 
            driverName="Mike Okonkwo"
            photoUrl="https://i.pravatar.cc/150?u=mikeo"
            rating={4.9}
            vehicleMake="F-450 Flatbed"
            vehicleColor="White"
            plateNumber="ST-01"
            etaMins={Math.ceil(secs / 60)}
            status={isArrived ? 'arrived' : 'en_route'}
            onCall={() => window.location.href = `tel:+14155550000`}
            className="border-none shadow-none bg-slate-50/50 rounded-3xl" 
          />

          <div className="px-2">
            <h3 className="text-micro font-bold text-neutral-400 mb-6 pl-4 tracking-[0.15em] uppercase border-l-4 border-emerald-500 py-1">Trip Progress</h3>
            <OrderTimeline steps={timelineSteps} />
          </div>

          {/* Safety Tips — Borrowed from SwiftTor reference */}
          <div className="px-4 pb-12">
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mb-4 flex items-center gap-2">
                <span className="text-sm">⚠️</span> Stay Safe While You Wait
              </div>
              <div className="space-y-4">
                {[
                  "Stay in your vehicle with your seatbelt on",
                  "Turn on your hazard / emergency lights",
                  "If possible, move far away from traffic",
                  "Lock your doors and stay vigilant"
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 text-sm text-slate-600 leading-snug">
                    <span className="text-emerald-500 font-black shrink-0 italic">0{i+1}</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </MapSheet>

    </main>
  );
}
