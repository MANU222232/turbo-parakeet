'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Truck } from 'lucide-react';

interface Driver {
  id: string | number;
  name: string;
  unit?: string;
  vehicle_type?: string;
  truck_type?: string;
  distance_km?: number;
  status?: string;
  lat?: number;
  lng?: number;
}

export default function LiveDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/drivers/nearby?lat=37.7749&lng=-122.4194&limit=4`
        );
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.slice(0, 4));
        }
      } catch {
        // Use demo fallback
        setDrivers([
          { id: 4292, name: 'Mike', unit: '#4292', vehicle_type: 'Flatbed', distance_km: 1.2, status: 'available' },
          { id: 8810, name: 'Sarah', unit: '#8810', vehicle_type: 'Wrecker', distance_km: 2.5, status: 'on_job' },
          { id: 3301, name: 'James', unit: '#3301', vehicle_type: 'Flatbed', distance_km: 3.1, status: 'available' },
          { id: 7720, name: 'Priya', unit: '#7720', vehicle_type: 'Heavy Duty', distance_km: 4.8, status: 'available' },
        ]);
      }
    };
    load();
  }, []);

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    available: { label: 'Available', color: 'text-[#00D16C]', dot: 'bg-[#00D16C]' },
    on_job:    { label: 'On Job',    color: 'text-[#FF6200]', dot: 'bg-[#FF6200]' },
    offline:   { label: 'Offline',   color: 'text-[--muted]', dot: 'bg-[--dim]' },
  };

  return (
    <div className="flex flex-col gap-3">
      {drivers.length === 0 && (
        <>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-[--elevated] animate-pulse" />
          ))}
        </>
      )}
      {drivers.map((driver) => {
        const cfg = statusConfig[driver.status || 'available'] || statusConfig.available;
        const unit = driver.unit || `#${driver.id}`;
        const type = driver.vehicle_type || driver.truck_type || 'Flatbed';
        const dist = driver.distance_km?.toFixed(1) ?? '—';
        return (
          <div
            key={driver.id}
            className="flex items-center gap-4 bg-[--elevated] border border-[--border] rounded-xl px-4 py-3"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#FF6200] flex items-center justify-center shrink-0">
              <Truck size={18} color="#fff" strokeWidth={2.5} />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-black uppercase tracking-wide text-white truncate">
                Unit {unit} ({driver.name})
              </div>
              <div className="text-[11px] text-[--muted] flex items-center gap-2 mt-0.5">
                <span>{type}</span>
                {dist !== '—' && (
                  <>
                    <span>·</span>
                    <MapPin size={10} className="inline" />
                    <span>{dist} miles away</span>
                  </>
                )}
              </div>
            </div>
            {/* Status */}
            <div className={`flex items-center gap-1.5 shrink-0 ${cfg.color}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${driver.status === 'available' ? 'animate-pulse' : ''}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">{cfg.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
