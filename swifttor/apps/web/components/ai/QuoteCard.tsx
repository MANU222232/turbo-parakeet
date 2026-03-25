import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

export default function QuoteCard({ quoteData }: { quoteData: any }) {
  const cartStore = useCartStore();
  const router = useRouter();

  if (!quoteData) return null;

  const handleAccept = () => {
    cartStore.clearCart();
    
    // Inject the AI negotiated structured diagnostic line item
    cartStore.addItem({
      id: 'ai-diagnostic-recovery',
      name: quoteData.service_name || 'Emergency AI Recovery',
      price: (quoteData.labor || 0) + (quoteData.service_fee || 0), 
      type: 'service',
      duration: 'ASAP'
    });
    
    // Inject the structured parts needed identified by AI
    if (Array.isArray(quoteData.parts)) {
      quoteData.parts.forEach((p: any, i: number) => {
        cartStore.addItem({
          id: `ai-part-req-${i}`,
          name: p.name,
          price: p.price,
          type: 'product'
        });
      });
    }

    router.push('/checkout');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 mb-4 shadow-xl shadow-emerald-500/10 w-full"
    >
      <div className="flex items-center gap-2 mb-4 text-emerald-500">
        <CheckCircle size={20} />
        <h4 className="font-black uppercase tracking-tight italic">Diagnostic Quote</h4>
      </div>
      <div className="space-y-3 mb-6 text-sm text-slate-300">
        <div className="flex justify-between items-center"><span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Base Service Fee</span><span className="font-black italic text-white">${quoteData.service_fee?.toFixed(2) || '0.00'}</span></div>
        <div className="flex justify-between items-center"><span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Labor</span><span className="font-black italic text-white">${quoteData.labor?.toFixed(2) || '0.00'}</span></div>
        
        {quoteData.parts && quoteData.parts.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-500 mb-2 block">Diagnostic Parts Array</span>
            {quoteData.parts.map((p: any, i: number) => (
              <div key={i} className="flex justify-between mb-1 pl-2 border-l-2 border-slate-800"><span className="text-xs">{p.name}</span><span className="font-bold text-white text-xs">${p.price?.toFixed(2)}</span></div>
            ))}
          </div>
        )}

        <div className="h-px bg-slate-800 my-2" />
        
        <div className="flex justify-between text-white font-bold items-end">
          <span className="text-xs uppercase tracking-widest text-slate-400">Total Computed</span>
          <span className="text-emerald-500 italic font-black text-2xl tracking-tighter">${quoteData.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <button 
        onClick={handleAccept} 
        className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
      >
        Accept Quote & Book
      </button>
    </motion.div>
  );
}
