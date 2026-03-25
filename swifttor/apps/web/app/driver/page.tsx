'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSession } from "next-auth/react";
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  LogOut,
  Navigation,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DriverDashboard() {
  const { data: session, status: authStatus } = useSession();
  // ✅ AGENT: Use session driver ID from NextAuth; fallback prevents app crash but warns in console
  const driverId = (session?.user as any)?.id || 'unauth-driver';
  const driverName = session?.user?.name || 'Driver';
  
  // Redirect if not authenticated or not a driver
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      window.location.href = '/api/auth/signin?callbackUrl=/driver';
    } else if (authStatus === 'authenticated' && (session?.user as any)?.role !== 'driver') {
      // For now we allow it but show a warning if it's not explicitly a driver role
      // In a strict production environment, we would redirect to home or access-denied
      console.warn('User authenticated but role is not "driver":', (session?.user as any)?.role);
    }
  }, [authStatus, session]);

  const [isOnline, setIsOnline] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({ today: 450.00, total: 12450.00 });
  const [status, setStatus] = useState<"idle" | "accepted" | "en_route" | "arrived" | "completed">("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Chat States
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<any>(null);

  // 1. Initialize Socket & Get Location
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      path: '/socket.io'
    });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        // ✅ AGENT: Only emit location if online, have active job, and valid driver session
        if (isOnline && activeJob && driverId !== 'unauth-driver') {
          socketRef.current.emit('driver:location_update', {
            driver_id: driverId,
            order_id: activeJob.id,
            lat: newLoc.lat,
            lng: newLoc.lng,
            heading: pos.coords.heading || 0
          });
        }
      });
    }

    socketRef.current.on('new_chat_message', (chat: any) => {
      if (activeJob && chat.order_id === activeJob.id) {
        setChatMessages(prev => [...prev, chat]);
        if (!showChat) setUnreadCount(c => c + 1);
      }
    });

    return () => socketRef.current.disconnect();
  }, [isOnline, activeJob, showChat, driverId]);

  // 2. Fetch Available Jobs
  // ✅ AGENT: Added proper error handling and API URL fallback
  useEffect(() => {
    if (isOnline && !activeJob && location && driverId !== 'unauth-driver') {
      const fetchJobs = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${apiUrl}/api/v1/orders/available?lat=${location.lat}&lng=${location.lng}&driver_id=${driverId}`);
          
          if (!res.ok) {
            console.error(`Failed to fetch jobs: ${res.status}`);
            return;
          }
          
          const data = await res.json();
          setAvailableJobs(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Fetch jobs failed', e);
        }
      };
      const interval = setInterval(fetchJobs, 10000);
      fetchJobs();
      return () => clearInterval(interval);
    }
  }, [isOnline, activeJob, location, driverId]);

  const handleAcceptJob = async (job: any) => {
    // ✅ AGENT: Validate driver authentication before accepting job
    if (!driverId || driverId === 'unauth-driver') {
      alert('You must be logged in to accept jobs. Please sign in.');
      return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/orders/${job.id}/accept?driver_id=${driverId}`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          alert('This job was already taken by another driver.');
        } else {
          alert('Failed to accept job. Please try again.');
        }
        return;
      }
      
      setActiveJob(job);
      setStatus('accepted');
      socketRef.current.emit('join_order', { order_id: job.id });
      socketRef.current.emit('order:status_change', { order_id: job.id, status: 'accepted' });
    } catch (e) {
      console.error('Job acceptance error:', e);
      alert('Connection error. Please check your network and try again.');
    }
  };

  // ✅ AGENT: Enhanced status update with error handling and validation
  const updateStatus = async (newStatus: any) => {
    if (!activeJob) {
      console.error('No active job to update');
      return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/orders/${activeJob.id}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      
      if (!res.ok) {
        throw new Error(`Status update failed: ${res.statusText}`);
      }
      
      setStatus(newStatus);
      socketRef.current.emit('order:status_change', { order_id: activeJob.id, status: newStatus });
      
      if (newStatus === 'completed') {
         setActiveJob(null);
         setStatus('idle');
         setEarnings(prev => ({ ...prev, today: prev.today + activeJob.price }));
      }
    } catch (e) {
      console.error('Status update failed', e);
      alert('Failed to update mission status. Please check your signal.');
    }
  };
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !activeJob) return;

    const message = {
      order_id: activeJob.id,
      text: chatInput.trim(),
      sender: 'driver',
      timestamp: new Date().toISOString()
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/orders/${activeJob.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      socketRef.current.emit('send_chat_message', message);
      setChatInput('');
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const [uploading, setUploading] = useState(false);
  const handleImageUpload = async (type: 'before' | 'after') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) return alert("File size must be under 5MB");

      setUploading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload/presigned`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: `order_${activeJob.id}_${type}.jpg`, content_type: file.type })
        });
        const { url, key } = await res.json();
        
        await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        
        // Update order in DB with image key if needed, or just let the socket relay it
        socketRef.current.emit('order:image_added', { order_id: activeJob.id, key, type });
        alert(`${type.toUpperCase()} photo uploaded successfully.`);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <main className="min-h-screen bg-[#050510] text-slate-200 font-sans selection:bg-emerald-500/30 pb-24 lg:pb-0">
      
      {/* Header Profile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=10b981&color=fff`} alt="Driver" />
            </div>
            <div>
               <h3 className="font-black uppercase italic text-sm tracking-tight text-white leading-none mb-1">{driverName}</h3>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {isOnline ? 'Accepting Missions' : 'Off-Duty'}
                  </span>
               </div>
            </div>
         </div>
         <button onClick={() => setIsOnline(!isOnline)} className={`px-6 py-2.5 rounded-full font-black uppercase italic text-xs tracking-widest transition-all ${isOnline ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20'}`}>
            {isOnline ? 'Go Offline' : 'Go Online'}
         </button>
      </header>

      <div className="max-w-xl mx-auto pt-32 p-6 space-y-8">
        
        {/* Earnings Radar */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -translate-y-1/2 translate-x-1/2" />
           <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Today&apos;s Earnings</p>
                <h2 className="text-5xl font-black italic tracking-tighter text-white">${earnings.today.toFixed(2)}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Weekly Streak</p>
                <div className="flex gap-1">
                   {[1,1,1,1,0,0,0].map((v, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${v ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                   ))}
                </div>
              </div>
           </div>
        </section>

        {/* Active Job Mission Flow */}
        <AnimatePresence mode="wait">
          {activeJob ? (
            <motion.section 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-[40px] p-8 space-y-8 shadow-2xl shadow-emerald-500/5"
            >
               <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">
                       <Truck size={12} className="text-emerald-500" />
                       <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest leading-none">In-Progress Task</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">{activeJob.name}</h3>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                       <MapPin size={12} /> {activeJob.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white italic tracking-tighter">${activeJob.price}</div>
                    <div className="text-[10px] font-black uppercase text-slate-600">Authorized</div>
                  </div>
               </div>

               {/* Mission Controls */}
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={status === 'arrived' || status === 'completed'}
                    onClick={() => updateStatus('arrived')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${status === 'en_route' ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                  >
                     <Navigation size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Mark Arrived</span>
                  </button>
                  <button 
                    disabled={status !== 'arrived'}
                    onClick={() => updateStatus('completed')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${status === 'arrived' ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                  >
                     <CheckCircle2 size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Finalize Job</span>
                  </button>
               </div>

               <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Camera size={14} /> Recovery Photos Required (Audit)
                  </h4>
                  <div className="flex gap-3">
                     <button 
                        disabled={uploading}
                        onClick={() => handleImageUpload('before')}
                        className="flex-1 h-20 bg-slate-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors disabled:opacity-50"
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Before</span>
                     </button>
                     <button 
                        disabled={uploading}
                        onClick={() => handleImageUpload('after')}
                        className="flex-1 h-20 bg-slate-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors disabled:opacity-50"
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">After</span>
                     </button>
                  </div>
               </div>
            </motion.section>
          ) : (
            <motion.section 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1">Live Job Radar</h4>
               {!isOnline ? (
                 <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-slate-600">
                       <ShieldCheck size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase italic text-white tracking-widest">System Offline</h3>
                      <p className="text-xs text-slate-500 font-medium px-8 leading-relaxed">Go online to start receiving recovery requests in your area.</p>
                    </div>
                 </div>
               ) : availableJobs.length === 0 ? (
                 <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto opacity-30" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600 animate-pulse">Scanning Horizon for Alerts...</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {availableJobs.map((job) => (
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        key={job.id} 
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex justify-between items-center group hover:border-emerald-500/40 transition-all cursor-pointer"
                        onClick={() => handleAcceptJob(job)}
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                               <AlertTriangle size={24} />
                            </div>
                            <div>
                               <h3 className="font-black uppercase italic text-lg tracking-tight text-white mb-1 group-hover:text-emerald-500 transition-colors">{job.name}</h3>
                               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                  <span>{job.distance}</span>
                                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                  <span className="truncate max-w-[120px]">{job.address}</span>
                                </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xl font-black italic tracking-tighter text-white">${job.price}</div>
                            <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic flex items-center gap-1 justify-end">
                               Accept <ChevronRight size={12} />
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Sheet */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#050510] flex flex-col pt-24"
          >
             <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-500/20 p-2 rounded-xl">
                      <MessageCircle size={20} className="text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Dispatch Comms</h3>
                </div>
                <button onClick={() => setShowChat(false)} className="p-2 bg-slate-900 rounded-full text-slate-400">
                   <X size={24} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                     <ShieldCheck size={48} className="opacity-20" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Channel Secure</p>
                  </div>
                ) : (
                  chatMessages.map((msg: any, i: number) => (
                    <div key={i} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-4 rounded-3xl ${msg.sender === 'driver' ? 'bg-emerald-500 text-slate-950 rounded-tr-none' : 'bg-slate-900 text-white rounded-tl-none border border-white/5'}`}>
                          <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                          <p className={`text-[8px] mt-2 font-black uppercase tracking-widest ${msg.sender === 'driver' ? 'text-slate-950/60' : 'text-slate-500'}`}>
                             {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>

             <div className="p-6 bg-[#050510] border-t border-white/5 pb-12">
                <div className="flex gap-3">
                   <input 
                      type="text" 
                      placeholder="Message dispatch..."
                      className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                   />
                   <button 
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                      className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                   >
                      <Navigation size={20} className="rotate-90" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Bottom Bar (PWA Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 p-6 lg:relative lg:bg-transparent lg:border-none z-40">
         <div className="max-w-xl mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1 text-emerald-500">
               <Truck size={20} />
               <span className="text-[8px] font-black uppercase tracking-widest">Missions</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-white transition-colors">
               <DollarSign size={20} />
               <span className="text-[8px] font-black uppercase tracking-widest">Earnings</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-white transition-colors">
               <Clock size={20} />
               <span className="text-[8px] font-black uppercase tracking-widest">History</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-600 hover:text-red-500 transition-colors">
               <LogOut size={20} />
               <span className="text-[8px] font-black uppercase tracking-widest">Exit</span>
            </button>
         </div>
      </nav>
    </main>
  );
}
