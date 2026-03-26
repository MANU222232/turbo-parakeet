'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Settings,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  LogOut
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'accepted':
      case 'en_route':
        return 'bg-blue-500';
      case 'arrived':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  const handleLogout = async () => {
    window.location.href = '/api/auth/signout';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-2 rounded-xl text-white">
                <Truck size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase italic tracking-tighter">SwiftTow</h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Customer Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">{session?.user?.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Customer</p>
                </div>
                <img 
                  src={session?.user?.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session?.user?.name || 'User')} 
                  className="w-10 h-10 rounded-full border-2 border-slate-200" 
                  alt="Profile" 
                />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white mb-8 shadow-xl"
          >
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
              Welcome back, {session?.user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-slate-300 font-medium">
              Manage your orders and profile settings
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-200">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'orders', label: 'My Orders', icon: Clock },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs transition-all ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                    <Clock size={24} />
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    {orders.filter(o => o.status === 'pending' || o.status === 'accepted').length}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Orders</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    {orders.filter(o => o.status === 'completed').length}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Completed</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    ${orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Spent</p>
              </motion.div>

              {/* Recent Orders */}
              <div className="md:col-span-3 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Recent Orders</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1"
                  >
                    View All <ChevronRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-slate-400">Loading...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold mb-4">No orders yet</p>
                    <button 
                      onClick={() => router.push('/emergency-report')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                    >
                      Request Service
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
                        onClick={() => router.push(`/order/${order.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                            <div>
                              <p className="font-bold text-slate-900">{order.locationAddress}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">${order.finalAmount}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold mb-4">No orders found</p>
                  <button 
                    onClick={() => router.push('/emergency-report')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    Request Your First Service
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">{order.locationAddress}</h3>
                        <p className="text-sm text-slate-600 mt-2">{order.issueDescription}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">${order.finalAmount}</p>
                        <button 
                          onClick={() => router.push(`/order/${order.id}`)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-bold mt-2 inline-flex items-center gap-1"
                        >
                          View Details <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Profile Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{session?.user?.name}</p>
                    <p className="text-sm text-slate-500">{session?.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Phone size={18} className="text-slate-400" />
                      <span className="font-bold text-slate-900">Not provided</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Mail size={18} className="text-slate-400" />
                      <span className="font-bold text-slate-900">{session?.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2">
                    <Settings size={18} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
