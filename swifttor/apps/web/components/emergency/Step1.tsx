'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { useEmergencyStore } from '@/store/useEmergencyStore';

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  location: z.string().min(3, 'Detailed location is required'),
  landmark: z.string().optional(),
  vehicleInfo: z.string().min(3, 'Vehicle description (e.g. 2019 White Toyota) is required'),
});

type Step1Data = z.infer<typeof step1Schema>;

export default function Step1({ onNext }: { onNext: () => void }) {
  const store = useEmergencyStore();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [gpsAttempted, setGpsAttempted] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { 
      name: store.name, 
      phone: store.phone,
      location: store.address && !store.address.includes(',') ? store.address : '',
      landmark: store.landmark,
      vehicleInfo: store.vehicle.make ? `${store.vehicle.year} ${store.vehicle.color} ${store.vehicle.make} ${store.vehicle.plate}`.trim() : ''
    },
  });

  // Auto-request GPS on component mount
  useEffect(() => {
    if (!store.lat && !gpsAttempted) {
      setTimeout(() => {
        handleCaptureGPS();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureGPS = () => {
    setLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const address = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        store.setEmergencyData({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: address,
        });
        setValue('location', address, { shouldValidate: true }); // Sync with form field
        setLocating(false);
        setLocationError('');
      },
      (error) => {
        console.error('GPS Error:', error.code, error.message);
        setLocating(false);
        
        let errorMsg = 'Unable to get GPS location. ';
        if (error.code === 1) {
          errorMsg += 'Please allow location access and try again.';
        } else if (error.code === 2) {
          errorMsg += 'Location service unavailable.';
        } else if (error.code === 3) {
          errorMsg += 'Location request timed out.';
        }
        
        setLocationError(errorMsg);
        
        // Still allow manual entry - don't set mock location automatically
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  const onSubmit = (data: Step1Data) => {
    // Validate that we have either GPS coordinates OR a detailed manual address
    const hasGPS = store.lat != null && store.lng != null;
    const hasDetailedAddress = data.location.length >= 10;
    
    if (!hasGPS && !hasDetailedAddress) {
      setLocationError('Please provide GPS coordinates or a detailed manual address for dispatch.');
      return;
    }
    
    store.setEmergencyData({
      name: data.name,
      phone: data.phone,
      address: data.location,
      landmark: data.landmark || '',
      vehicle: {
        ...store.vehicle,
        make: data.vehicleInfo, 
      }
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col px-6 overflow-y-auto no-scrollbar pb-40">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8 pt-6"
      >
        
        {/* Futuristic Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/80">System Ready</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Basic <span className="text-emerald-500 text-shadow-sm shadow-emerald-100">Info</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Transmission requires identity & telemetry.</p>
        </div>

        {/* Command Center: Location Scanner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative group overflow-hidden rounded-[2.5rem] border p-1 transition-all duration-500",
            store.lat ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
          )}
        >
          <div className="p-6 flex flex-col items-center text-center gap-5">
            {/* Animated Scanner Ring */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 rounded-full border-2 transition-all duration-700",
                locating ? "border-emerald-400 animate-ping opacity-20" : "border-emerald-100 group-hover:border-emerald-200"
              )} />
              <div className={cn(
                "absolute inset-2 rounded-full border border-dashed transition-all duration-1000",
                locating ? "border-emerald-500 animate-spin" : "border-slate-100"
              )} />
              
              <div className={cn(
                "relative h-14 w-14 rounded-full flex items-center justify-center border-4 shadow-inner transition-all duration-500",
                store.lat ? "bg-emerald-500 border-emerald-400 shadow-emerald-600/20" : "bg-slate-50 border-white shadow-slate-200"
              )}>
                {locating ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : store.lat ? (
                  <CheckCircle2 className="h-7 w-7 text-white" />
                ) : (
                  <MapPin className="h-7 w-7 text-slate-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              {!store.lat ? (
                <>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Global Telemetry</h3>
                  <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
                    {locating 
                      ? 'Acquiring satellite signal...' 
                      : gpsAttempted && locationError
                        ? 'GPS unavailable. Please enter location manually.'
                        : 'Securely lock your GPS coordinates to coordinate recovery.'}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 italic">Target Locked</h3>
                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full inline-block">
                    <p className="text-[10px] font-black font-mono text-emerald-600 truncate max-w-[180px]">{store.address}</p>
                  </div>
                </>
              )}
            </div>

            {!store.lat && (
              <button
                type="button"
                onClick={handleCaptureGPS}
                disabled={locating}
                className={cn(
                  "relative px-8 h-12 rounded-2xl font-black italic uppercase tracking-[0.15em] text-[11px] transition-all duration-300 active:scale-95 group overflow-hidden",
                  locating 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-slate-900 hover:bg-emerald-500 text-white"
                )}
              >
                <span className="relative z-10">
                  {locating ? 'Locking Target...' : gpsAttempted ? 'Retry Scan' : 'Initiate Scan'}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {locationError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{locationError}</p>
                <p className="text-[9px] text-red-500 font-medium">Please allow location access in your browser settings, or enter your location manually below.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form Fields — Command Style */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Identity Tag <span className="text-red-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Alex J."
                className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-slate-900 font-black italic text-sm placeholder:text-slate-300 placeholder:font-normal focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-50 shadow-sm transition-all outline-none"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase">{errors.name.message}</p>}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Comm Line <span className="text-red-500">*</span></label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-slate-900 font-black italic text-sm placeholder:text-slate-300 placeholder:font-normal focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-50 shadow-sm transition-all outline-none"
              />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase">{errors.phone.message}</p>}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Manual Location Description <span className="text-red-500">*</span></label>
            <div className="relative group">
              <input
                {...register('location')}
                placeholder="e.g. Main Street, near the library"
                className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-5 pr-12 text-slate-900 font-black italic text-sm placeholder:text-slate-300 placeholder:font-normal focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-50 shadow-sm transition-all outline-none"
              />
              <button 
                type="button"
                onClick={handleCaptureGPS}
                disabled={locating}
                className="absolute right-3 top-2.5 h-9 w-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </button>
            </div>
            {errors.location && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase">{errors.location.message}</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Proximal Landmark</label>
            <input
              {...register('landmark')}
              placeholder="e.g. Near milestone 30, under overpass"
              className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-slate-900 font-black italic text-sm placeholder:text-slate-300 placeholder:font-normal focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-50 shadow-sm transition-all outline-none"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Vehicle Blueprint <span className="text-red-500">*</span></label>
            <input
              {...register('vehicleInfo')}
              placeholder="e.g. 2019 Toyota Corolla White KCB 234A"
              className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-slate-900 font-black italic text-sm placeholder:text-slate-300 placeholder:font-normal focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-50 shadow-sm transition-all outline-none"
            />
            {errors.vehicleInfo && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase">{errors.vehicleInfo.message}</p>}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Action — Command Center CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-16">
        <button
          type="submit"
          className="group w-full h-16 bg-slate-900 hover:bg-emerald-500 text-white font-black italic uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-slate-900/20 hover:shadow-emerald-500/40 transition-all duration-500 active:scale-[0.97] flex items-center justify-center gap-3"
        >
          <span>Progress to Diagnostics</span>
          <div className="h-px w-8 bg-white/20 group-hover:w-12 transition-all" />
          <span className="text-xl">→</span>
        </button>
      </div>
    </form>
  );
}
