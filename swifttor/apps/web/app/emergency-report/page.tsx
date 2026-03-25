'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Step1 from '@/components/emergency/Step1';
import Step2 from '@/components/emergency/Step2';
import Step3 from '@/components/emergency/Step3';

export default function EmergencyReportPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <main className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top App Bar & Progress */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md pt-4 pb-2 px-4 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => step === 1 ? router.push('/') : prevStep()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Step {step} of 3
          </div>
          <div className="w-10"></div>
        </div>

        {/* Continuous Progress Bar — emerald */}
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3].map((s) => (
            <motion.div 
              key={s}
              className="h-full bg-emerald-500 origin-left rounded-full flex-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: s <= step ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 relative overflow-x-hidden overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Step1 onNext={nextStep} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Step2 onNext={nextStep} onPrev={prevStep} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Step3 onPrev={prevStep} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
}
