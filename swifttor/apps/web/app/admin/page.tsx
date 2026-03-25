import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { io } from 'socket.io-client';
import { Truck, MapPin, Clock, CheckCircle2, XCircle, LogIn, LogOut, Search, Filter, MoreVertical, Phone, User as UserIcon, Car, Loader2, ChevronRight, Mail, Lock, Navigation, MessageSquare, MessageCircle, X, Camera } from 'lucide-react';
import { Location } from './types';
import { MapContainer } from './MapContainer';

// ✅ AGENT: Use environment variable for admin email check
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "maichezmaichez@gmail.com";

const INITIAL_DRIVERS = [
  { id: 'd1', name: "Mike Thompson", phone: "+1 (415) 555-0123", vehicle: "Flatbed Unit #4292", photo: "https://picsum.photos/seed/driver1/200", available: true },
  { id: 'd2', name: "Sarah Jenkins", phone: "+1 (415) 555-0124", vehicle: "Wrecker Unit #1024", photo: "https://picsum.photos/seed/driver2/200", available: true },
  { id: 'd3', name: "David Miller", phone: "+1 (415) 555-0125", vehicle: "Heavy Duty Unit #8812", photo: "https://picsum.photos/seed/driver3/200", available: true },
  { id: 'd4', name: "Alice Wong", phone: "+1 (415) 555-0126", vehicle: "Flatbed Unit #3301", photo: "https://picsum.photos/seed/driver4/200", available: true },
];

const ROUTES = [
  { id: 'r1', name: "Market St - Downtown", estTime: "15 mins" },
  { id: 'r2', name: "Highway 101 - SFO", estTime: "25 mins" },
  { id: 'r3', name: "Geary Blvd - Richmond", estTime: "20 mins" },
  { id: 'r4', name: "Mission St - Bernal Heights", estTime: "18 mins" },
  { id: 'r5', name: "Lombard St - Marina", estTime: "12 mins" },
];


export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const onBack = () => window.location.href = '/';
  
  const [requests, setRequests] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
  const [selectedRoutes, setSelectedRoutes] = useState<Record<string, string>>({});
  const [manualRouteNames, setManualRouteNames] = useState<Record<string, string>>({});
  const [manualRouteTimes, setManualRouteTimes] = useState<Record<string, string>>({});
  const [suggestedPrices, setSuggestedPrices] = useState<Record<string, string>>({});
  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});
  const [driverChats, setDriverChats] = useState<any[]>([]);
  const [activeDriverChatRequestId, setActiveDriverChatRequestId] = useState<string | null>(null);
  const [driverChatInput, setDriverChatInput] = useState('');
  const [email, setEmail] = useState('');
  const [customPhotoUrls, setCustomPhotoUrls] = useState<Record<string, string>>({});
  const [readMessageCounts, setReadMessageCounts] = useState<Record<string, number>>({});
  const lastMessageCounts = React.useRef<Record<string, number>>({});
  
  // Driver Management States
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '', photo: '' });

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      window.location.href = '/api/auth/signin?callbackUrl=/admin';
    } else if (authStatus === 'authenticated') {
      const isAllowed = session?.user?.email === ADMIN_EMAIL || (session?.user as any)?.role === 'admin';
      if (!isAllowed) {
        console.warn('Unauthorized admin access attempt:', session?.user?.email);
        // In strict mode, redirect to / or access-denied
      }
    }
  }, [authStatus, session, ADMIN_EMAIL]);

  const POP_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
  const RECOVERY_PHOTOS = [
    "https://images.unsplash.com/photo-1597766353939-996076329780?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1591768793355-74d7c80b0e17?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1566367711988-89f40d4d9bc4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
  ];

  const addRecoveryPhoto = async (requestId: string) => {
    const randomPhoto = RECOVERY_PHOTOS[Math.floor(Math.random() * RECOVERY_PHOTOS.length)];
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/orders/${requestId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: randomPhoto })
      });
    } catch (error) {
      console.error("Error adding photo:", error);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingId('adding-driver');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const driverData = {
        ...newDriver,
        photo: newDriver.photo || `https://picsum.photos/seed/${Date.now()}/200`,
        role: 'driver'
      };
      await fetch(`${apiUrl}/api/v1/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
      });
      setIsAddingDriver(false);
      setNewDriver({ name: '', phone: '', vehicle: '', photo: '' });
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("Failed to add driver.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteDriver = async (driverId: string) => {
    if (!window.confirm("Are you sure you want to remove this driver?")) return;
    setUpdatingId(driverId + 'delete');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/drivers/${driverId}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error deleting driver:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const socketRef = React.useRef<any>(null);
  const requestsRef = React.useRef<any[]>([]);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  // 1. Initialize Socket and Data
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    socketRef.current = io(apiUrl, { path: '/socket.io' });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current.emit('join_admin', {});
    });

    const fetchData = async () => {
      try {
        const [ordersRes, driversRes, shopsRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/orders`),
          fetch(`${apiUrl}/api/v1/drivers`),
          fetch(`${apiUrl}/api/v1/shops`)
        ]);
        
        const [ordersData, driversData, shopsData] = await Promise.all([
          ordersRes.json(),
          driversRes.json(),
          shopsRes.json()
        ]);

        setRequests(ordersData);
        setDrivers(driversData);
        setShops(shopsData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        setLoading(false);
      }
    };

    fetchData();

    // Socket listeners
    socketRef.current.on('order:status_change', ({ order_id, status }: any) => {
      setRequests(prev => prev.map(r => r.id === order_id ? { ...r, status } : r));
    });

    socketRef.current.on('order:new', (newOrder: any) => {
      setRequests(prev => [newOrder, ...prev]);
      // Play sound for new orders
      const audio = new Audio(POP_SOUND);
      audio.play().catch(e => console.log('Audio play block:', e));
    });

    socketRef.current.on('driver:location_update', (data: any) => {
      setRequests(prev => prev.map(r => 
        r.id === data.order_id ? { ...r, driverLocation: { lat: data.lat, lng: data.lng } } : r
      ));
    });

    socketRef.current.on('new_chat_message', (chat: any) => {
      if (chat.order_id === activeDriverChatRequestId) {
        setDriverChats(prev => [...prev, chat]);
      }
      // Increment unread count logic could go here
    });

    return () => socketRef.current.disconnect();
  }, [authStatus]);


  const handleLogout = () => nextAuthSignOut();

  const toggleDriverAvailability = async (driverId: string, currentStatus: boolean) => {
    setUpdatingId(driverId + 'availability');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/drivers/${driverId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Failed to update driver status. Please check connection.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSuggestPrice = async (requestId: string) => {
    const price = suggestedPrices[requestId]?.trim();
    if (!price) return;
    
    setUpdatingId(requestId + 'price');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/orders/${requestId}/suggest-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
    } catch (error) {
      console.error("Error suggesting price:", error);
      alert("No valid price set. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (requestId: string, status: string) => {
    setUpdatingId(requestId + status);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const driverId = selectedDrivers[requestId];
      
      const res = await fetch(`${apiUrl}/api/v1/orders/${requestId}/status?status=${status}${driverId ? `&driver_id=${driverId}` : ''}`, {
        method: 'PATCH'
      });

      if (!res.ok) throw new Error("Status update failed");
      socketRef.current.emit('order:status_change', { order_id: requestId, status });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check connection.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/v1/orders/${requestId}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  const sendAdminReply = async (requestId: string) => {
    const reply = adminReplies[requestId]?.trim();
    if (!reply) return;

    setUpdatingId(requestId + 'reply');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/orders/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, sender: 'admin' })
      });
      socketRef.current.emit('send_chat_message', { order_id: requestId, text: reply, sender: 'admin', timestamp: new Date().toISOString() });
      setAdminReplies(prev => ({ ...prev, [requestId]: '' }));
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const sendDriverMessage = async () => {
    const text = driverChatInput.trim();
    if (!text || !activeDriverChatRequestId) return;

    setUpdatingId(activeDriverChatRequestId + 'driverChat');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/orders/${activeDriverChatRequestId}/driver-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender: 'admin' })
      });
      socketRef.current.emit('send_chat_message', { order_id: activeDriverChatRequestId, text, sender: 'admin', timestamp: new Date().toISOString() });
      setDriverChatInput('');
    } catch (error) {
      console.error("Error sending driver message:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Truck className="text-emerald-500 animate-pulse" size={32} />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Initializing Dispatch</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Connecting to SwiftTow Secure Network...</p>
        </motion.div>
      </div>
    );
  }

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8">
            <Truck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Admin Portal</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Please sign in with your authorized admin account to access the dashboard.
          </p>

          <button 
            onClick={() => window.location.href = '/api/auth/signin'}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <LogIn size={20} />
            Sign In with Account
          </button>

          <button 
            onClick={onBack}
            className="mt-8 w-full py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
          >
            <ChevronRight className="rotate-180" size={20} /> Return to Home Screen
          </button>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <nav className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onBack}>
              <div className="bg-emerald-500 p-2 rounded-xl">
                <Truck size={24} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">SwiftTow Admin</span>
            </div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              <ChevronRight className="rotate-180" size={14} /> Back to App
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <div className="text-right">
                <p className="font-bold leading-none">{session.user?.name}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Authorized Dispatcher</p>
              </div>
              <img src={session.user?.image || "https://picsum.photos/seed/admin/200"} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Admin" referrerPolicy="no-referrer" />
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Dispatch Dashboard</h1>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100"
          >
            <ChevronRight className="rotate-180" size={18} /> Return to Home
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Client Name or Request ID..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="pl-12 pr-10 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold bg-white appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="en_route">En Route</option>
                <option value="arrived">Arrived</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fleet Management Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
              <Truck className="text-emerald-500" size={24} />
              Fleet Status
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {drivers.filter(d => d.available).length} of {drivers.length} Drivers Available
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drivers.map(driver => (
              <motion.div 
                key={driver.id}
                whileHover={{ y: -4 }}
                className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group transition-all"
              >
                <div className="relative">
                  <img 
                    src={driver.photo} 
                    className="w-12 h-12 rounded-2xl border-2 border-slate-50 shadow-sm object-cover" 
                    alt={driver.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${driver.available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{driver.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{driver.vehicle}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => toggleDriverAvailability(driver.id, driver.available)}
                    disabled={updatingId === driver.id + 'availability'}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      driver.available 
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {updatingId === driver.id + 'availability' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      driver.available ? 'Online' : 'Offline'
                    )}
                  </button>
                  <button 
                    onClick={() => deleteDriver(driver.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors self-end"
                    title="Delete Driver"
                  >
                    {updatingId === driver.id + 'delete' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />}
                  </button>
                </div>
              </motion.div>
            ))}
            
            <button 
              onClick={() => setIsAddingDriver(true)}
              className="border-2 border-dashed border-slate-200 p-4 rounded-3xl flex items-center justify-center gap-3 text-slate-400 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-all">
                <Car size={20} />
              </div>
              <span>Add New Driver</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isAddingDriver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic italic">Add New Driver</h2>
                  <button onClick={() => setIsAddingDriver(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleAddDriver} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                      placeholder="e.g. Mike Thompson"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                      placeholder="+1 (415) 555-0100"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Description</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                      placeholder="e.g. Flatbed Unit #4292"
                      value={newDriver.vehicle}
                      onChange={(e) => setNewDriver({...newDriver, vehicle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Photo URL (Optional)</label>
                    <input 
                      type="url" 
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                      placeholder="https://..."
                      value={newDriver.photo}
                      onChange={(e) => setNewDriver({...newDriver, photo: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={updatingId === 'adding-driver'}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {updatingId === 'adding-driver' ? <Loader2 size={20} className="animate-spin" /> : 'Register Driver'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">#{req.id}</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 uppercase italic">{req.serviceType}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <UserIcon size={16} className="text-slate-400" />
                          <span className="text-slate-500">Client:</span>
                          <span className="font-bold">{req.clientName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Car size={16} className="text-slate-400" />
                          <span className="text-slate-500">Vehicle:</span>
                          <span className="font-bold">{req.vehicleInfo}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={16} className="text-slate-400" />
                          <span className="text-slate-500">Payment:</span>
                          <span className="font-bold uppercase">{req.paymentMode}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="text-slate-500">Location:</span>
                          <a 
                            href={`https://www.google.com/maps?q=${req.location.lat},${req.location.lng}`} 
                            target="_blank" 
                            className="font-bold text-emerald-600 hover:underline"
                          >
                            View on Map
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock size={16} className="text-slate-400" />
                          <span className="text-slate-500">Requested:</span>
                          <span className="font-bold">{req.createdAt?.toDate().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {req.status === 'en_route' && req.driverLocation && (
                      <div className="mt-6 h-48 rounded-2xl overflow-hidden border border-slate-200 relative group">
                        <MapContainer 
                          center={req.driverLocation} 
                          zoom={14}
                          markerPosition={req.location}
                          truckPosition={req.driverLocation}
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Tracking
                        </div>
                      </div>
                    )}

                    {req.driverInfo && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <img src={req.driverInfo.photo} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Driver" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Assigned Driver</p>
                          <p className="text-sm font-bold text-slate-900">{req.driverInfo.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{req.driverInfo.vehicle} • {req.estimatedArrival}</p>
                          {req.routeInfo && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">Route: {req.routeInfo.name}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <a href={`tel:${req.driverInfo.phone}`} className="p-2 bg-white rounded-full text-blue-600 shadow-sm hover:bg-blue-50 transition-colors flex items-center justify-center">
                            <Phone size={16} />
                          </a>
                          <button 
                            onClick={() => setActiveDriverChatRequestId(req.id)}
                            className="p-2 bg-white rounded-full text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors flex items-center justify-center"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {req.messages && req.messages.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chat History</p>
                          {req.messages.length > (readMessageCounts[req.id] || 0) && req.messages[req.messages.length - 1].sender === 'client' && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {req.messages.map((msg: any, i: number) => (
                            <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${msg.sender === 'client' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                              <MessageSquare size={14} className={msg.sender === 'client' ? 'text-emerald-500 mt-0.5' : 'text-slate-400 mt-0.5'} />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">{msg.text}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${msg.sender === 'client' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                                    {msg.sender}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <input 
                            type="text" 
                            placeholder="Type a reply..."
                            className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={adminReplies[req.id] || ''}
                            onChange={(e) => setAdminReplies(prev => ({ ...prev, [req.id]: e.target.value }))}
                            onFocus={() => setReadMessageCounts(prev => ({ ...prev, [req.id]: req.messages.length }))}
                            onKeyPress={(e) => e.key === 'Enter' && sendAdminReply(req.id)}
                          />
                          <button 
                            onClick={() => sendAdminReply(req.id)}
                            disabled={updatingId !== null || !adminReplies[req.id]?.trim()}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                          >
                            {updatingId === req.id + 'reply' ? <Loader2 size={10} className="animate-spin" /> : 'Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-72 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-8">
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Driver</label>
                        <select 
                          className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={selectedDrivers[req.id] || ''}
                          onChange={(e) => setSelectedDrivers(prev => ({ ...prev, [req.id]: e.target.value }))}
                        >
                          <option value="">Auto-Assign (First Available)</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.available ? 'Available' : 'Unavailable'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Route</label>
                        <select 
                          className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none mb-2"
                          value={selectedRoutes[req.id] || ''}
                          onChange={(e) => setSelectedRoutes(prev => ({ ...prev, [req.id]: e.target.value }))}
                        >
                          <option value="">Choose Route...</option>
                          {ROUTES.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.estTime})</option>
                          ))}
                          <option value="manual">+ Manual Entry</option>
                        </select>
                        
                        {selectedRoutes[req.id] === 'manual' && (
                          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <input 
                              type="text" 
                              placeholder="Route Name (e.g. Downtown - SFO)"
                              className="w-full p-2 rounded-lg border border-slate-200 text-[10px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                              value={manualRouteNames[req.id] || ''}
                              onChange={(e) => setManualRouteNames(prev => ({ ...prev, [req.id]: e.target.value }))}
                            />
                            <input 
                              type="text" 
                              placeholder="Est. Time (e.g. 25 mins)"
                              className="w-full p-2 rounded-lg border border-slate-200 text-[10px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                              value={manualRouteTimes[req.id] || ''}
                              onChange={(e) => setManualRouteTimes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Allocated Price ($)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. 50"
                          className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={suggestedPrices[req.id] || ''}
                          onChange={(e) => setSuggestedPrices(prev => ({ ...prev, [req.id]: e.target.value }))}
                        />
                        <button 
                          onClick={() => handleSuggestPrice(req.id)}
                          disabled={updatingId !== null || !suggestedPrices[req.id]}
                          className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {updatingId === req.id + 'price' ? <Loader2 size={10} className="animate-spin" /> : 'Set'}
                        </button>
                      </div>
                      {req.suggestedPrice && (
                        <p className="text-[9px] text-emerald-600 font-bold mt-1">Allocated: ${req.suggestedPrice}</p>
                      )}
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateStatus(req.id, 'assigned')}
                        disabled={updatingId !== null}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${req.status === 'assigned' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                      >
                        {updatingId === req.id + 'assigned' ? <Loader2 size={10} className="animate-spin" /> : null}
                        Assign Driver
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'en_route')}
                        disabled={updatingId !== null}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${req.status === 'en_route' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                      >
                        {updatingId === req.id + 'en_route' ? <Loader2 size={10} className="animate-spin" /> : null}
                        En Route
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'arrived')}
                        disabled={updatingId !== null}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${req.status === 'arrived' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                      >
                        {updatingId === req.id + 'arrived' ? <Loader2 size={10} className="animate-spin" /> : null}
                        Arrived
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'completed')}
                        disabled={updatingId !== null}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${req.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                      >
                        {updatingId === req.id + 'completed' ? <Loader2 size={10} className="animate-spin" /> : null}
                        Complete
                      </button>
                    </div>
                    {['assigned', 'en_route', 'arrived'].includes(req.status) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Service Photos</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Paste Photo URL..."
                            className="flex-1 p-2 rounded-xl border border-blue-200 text-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            value={customPhotoUrls[req.id] || ''}
                            onChange={(e) => setCustomPhotoUrls(prev => ({ ...prev, [req.id]: e.target.value }))}
                          />
                          <button 
                            onClick={async () => {
                              const url = customPhotoUrls[req.id] || RECOVERY_PHOTOS[Math.floor(Math.random() * RECOVERY_PHOTOS.length)];
                              setUpdatingId(req.id + 'photo');
                              try {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; await fetch(`${apiUrl}/api/v1/orders/${req.id}/photos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
                                setCustomPhotoUrls(prev => ({ ...prev, [req.id]: '' }));
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setUpdatingId(null);
                              }
                            }}
                            disabled={updatingId !== null}
                            className="px-3 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                          >
                            {updatingId === req.id + 'photo' ? <Loader2 size={10} className="animate-spin" /> : 'Add'}
                          </button>
                        </div>
                        <p className="text-[9px] text-blue-400 italic font-medium text-center">Leave blank to simulate a random driver photo</p>
                      </div>
                    )}
                    <button 
                      onClick={() => deleteRequest(req.id)}
                      className="mt-4 py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} /> Delete Request
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Truck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No requests found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {activeDriverChatRequestId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px]"
            >
              {/* Header */}
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500 p-2 rounded-xl">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase italic">Driver Comms</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {requests.find(r => r.id === activeDriverChatRequestId)?.driverInfo?.name || 'Assigned Driver'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveDriverChatRequestId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
                {driverChats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <MessageCircle size={48} className="opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                  </div>
                ) : (
                  driverChats.map((chat: any) => (
                    <div 
                      key={chat.id} 
                      className={`flex ${chat.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        chat.sender === 'admin' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{chat.text}</p>
                        <p className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${
                          chat.sender === 'admin' ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          {new Date(chat.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type a message to driver..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                    value={driverChatInput}
                    onChange={(e) => setDriverChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendDriverMessage()}
                  />
                  <button 
                    onClick={sendDriverMessage}
                    disabled={!driverChatInput.trim() || updatingId !== null}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {updatingId === activeDriverChatRequestId + 'driverChat' ? <Loader2 size={14} className="animate-spin" /> : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
