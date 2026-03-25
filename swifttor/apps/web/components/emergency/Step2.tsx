'use client';

import { useState } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Camera, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmergencyButton } from '@/components/ui/EmergencyButton';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

const SYMPTOMS = [
  'Engine Wont Start', 'Flat Tire', 'Locked Out', 'Out of Fuel', 
  'Accident / Crash', 'Check Engine', 'Battery Dead', 'Stuck in Mud/Snow'
];

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const store = useEmergencyStore();
  const [selected, setSelected] = useState<string[]>(store.symptoms || []);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const severityLevel = selected.includes('Accident / Crash') ? 3 : selected.length > 2 ? 2 : 1;
  const severityColors = ['bg-safe', 'bg-warning', 'bg-primary'];

  const toggleSymptom = (s: string) => {
    setSelected(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImagePreview(URL.createObjectURL(file));
      // In production, would upload to presigned URL here and save returned DB URL to store
      store.addImageKey('uploaded-local-photo.jpg');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const handleNext = () => {
    store.setEmergencyData({ symptoms: selected });
    onNext();
  };

  return (
    <div className="h-full flex flex-col px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8 pt-6 pb-32"
      >
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/80">Diagnostic Mode</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">What's<br/>Wrong?</h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Select everything that applies.</p>
        </div>

        {/* Severity Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 bg-slate-50 p-4 rounded-3xl border border-slate-100"
        >
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1">
            <span>Threat Level</span>
            <span className={cn(
              "transition-colors duration-300",
              severityLevel === 3 ? "text-red-500" : severityLevel === 2 ? "text-amber-500" : "text-emerald-500"
            )}>
              {severityLevel === 3 ? '⚠️ CRITICAL' : severityLevel === 2 ? '🟡 MODERATE' : '✅ ROUTINE'}
            </span>
          </div>
          <div className="flex h-1.5 gap-1 rounded-full overflow-hidden bg-slate-200/50">
            {[1, 2, 3].map((level) => (
              <div 
                key={level} 
                className={cn(
                  "flex-1 transition-all duration-400",
                  level <= severityLevel ? severityColors[severityLevel - 1] : "opacity-0"
                )}
              />
            ))}
          </div>
        </motion.div>

        {/* Chip Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {SYMPTOMS.map((s, i) => {
            const isSelected = selected.includes(s);
            return (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                onClick={() => toggleSymptom(s)}
                className={cn(
                  "flex min-h-[56px] items-center justify-center p-3 rounded-2xl text-[13px] font-bold transition-all active:scale-[0.98] border",
                  isSelected 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {s}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Photo Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Evidence Capture <span className="text-slate-300 lowercase font-normal italic">(Optional)</span></label>
          
          <div 
            {...getRootProps()} 
            className={cn(
              "relative overflow-hidden rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center min-h-[160px] text-center p-6 cursor-pointer group",
              isDragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-sm",
              imagePreview && "border-solid border-slate-100 p-0"
            )}
          >
            <input {...getInputProps()} />
            
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Uploaded vehicle" className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in duration-500" />
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="h-7 w-7 text-slate-400" />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Initiate Capture</div>
                <div className="text-[10px] text-slate-400 font-medium">Visual intelligence accelerates dispatch</div>
              </>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-16">
        <button 
          onClick={handleNext} 
          disabled={selected.length === 0}
          className="group w-full h-16 bg-slate-900 hover:bg-emerald-500 text-white font-black italic uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-slate-900/20 hover:shadow-emerald-500/40 transition-all duration-500 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <span>Confirm Selection</span>
          <div className="h-px w-8 bg-white/20 group-hover:w-12 transition-all" />
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
