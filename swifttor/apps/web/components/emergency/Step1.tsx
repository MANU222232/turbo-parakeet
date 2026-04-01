'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, MapPin, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useEmergencyStore } from '@/store/useEmergencyStore';

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  location: z.string().min(3, 'Location description is required'),
  landmark: z.string().optional(),
  vehicleInfo: z.string().min(3, 'Vehicle description is required'),
});

type Step1Data = z.infer<typeof step1Schema>;

export default function Step1({ onNext }: { onNext: () => void }) {
  const store = useEmergencyStore();
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { 
      name: store.name, 
      phone: store.phone,
      location: store.address || '',
      landmark: store.landmark,
      vehicleInfo: store.vehicle.make ? `${store.vehicle.year} ${store.vehicle.color} ${store.vehicle.make} ${store.vehicle.plate}`.trim() : ''
    },
  });

  const onSubmit = (data: Step1Data) => {
    setSubmitError('');
    
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
        
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/80">Ready to Assist</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Your <span className="text-emerald-500">Details</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Driver will contact you to confirm your exact location.</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name & Phone - Two Columns */}
          <div className="grid grid-cols-2 gap-5">
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Phone className="w-3 h-3 text-emerald-500" />
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Alex J."
                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name.message}</p>}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Phone className="w-3 h-3 text-emerald-500" />
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
              />
              {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone.message}</p>}
            </motion.div>
          </div>

          {/* Location */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-emerald-500" />
              Where Are You? <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('location')}
              placeholder="e.g. Main Street near the library, mile marker 30, highway interchange..."
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none resize-none"
            />
            <p className="text-[9px] text-slate-400 font-medium ml-1">Be as descriptive as possible so the driver can find you easily.</p>
            {errors.location && <p className="text-red-500 text-[10px] font-bold">{errors.location.message}</p>}
          </motion.div>

          {/* Landmark */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-slate-400" />
              Nearby Landmark (Optional)
            </label>
            <input
              {...register('landmark')}
              placeholder="e.g. Shell gas station, red building, under bridge..."
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            />
            <p className="text-[9px] text-slate-400 font-medium ml-1">Additional details help faster arrival.</p>
          </motion.div>

          {/* Vehicle Info */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
              <Truck className="w-3 h-3 text-emerald-500" />
              Vehicle Details <span className="text-red-500">*</span>
            </label>
            <input
              {...register('vehicleInfo')}
              placeholder="e.g. 2019 White Toyota Corolla, Plate: ABC-123"
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            />
            {errors.vehicleInfo && <p className="text-red-500 text-[10px] font-bold">{errors.vehicleInfo.message}</p>}
          </motion.div>

          {/* Info Box */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">💬 Driver Communication</p>
            <p className="text-[12px] text-blue-600 leading-relaxed">
              After submitting, the driver will call or message you to confirm your exact location and provide arrival time.
            </p>
          </motion.div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-semibold text-sm">{submitError}</p>
          </div>
        )}
      </motion.div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-16">
        <button
          type="submit"
          className="group w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Next Step</span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </form>
  );
}
