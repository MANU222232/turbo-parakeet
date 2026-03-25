'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, ArrowRight, Loader2, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        setError('Failed to send OTP. Please check the number.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      phone,
      otp,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
        
        <div className="text-center mb-10">
          <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Truck className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">SwiftTor</h1>
          <p className="text-slate-500 font-medium">Verify your account to continue</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOTP} 
              className="space-y-6"
            >
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-bold"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Send Code <ArrowRight size={20} /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP} 
              className="space-y-6"
            >
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text"
                  placeholder="6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-bold tracking-[0.5em] text-center"
                  maxLength={6}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-500 text-sm font-bold uppercase tracking-tight hover:text-white transition-colors"
              >
                Change Phone Number
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-red-500 text-sm text-center mt-6 font-bold flex items-center justify-center gap-2"
          >
            <div className="w-1 h-1 bg-red-500 rounded-full" /> {error}
          </motion.p>
        )}
      </motion.div>
    </main>
  );
}
