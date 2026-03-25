'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Loader2, Bot } from 'lucide-react';
import { QuoteCard } from '@/components/ui/QuoteCard';
import { useCartStore } from '@/store/useCartStore';

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  isQuote?: boolean;
  quoteData?: any;
};

export default function AIAssistantPage() {
  const router = useRouter();
  const cart = useCartStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', text: 'I see your location and vehicle details. Can you describe exactly what happened?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMsgs = [...messages, { id: Date.now().toString(), role: 'user' as const, text: input }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    // Simulate AI diagnosis delay
    setTimeout(() => {
      setMessages(m => [
        ...m, 
        { 
          id: Date.now().toString() + 'q', 
          role: 'ai', 
          text: 'Based on the engine clicking sound, it sounds like a dead battery. I can dispatch a jumpstart truck immediately. Here is your guaranteed quote:',
          isQuote: true,
          quoteData: {
            serviceName: 'Emergency Jumpstart',
            description: 'Includes 12V/24V heavy duty jumpstart. Battery replacement available on-site if cell is dead.',
            partsTotal: 0,
            laborTotal: 85.00,
            finalTotal: 85.00,
            etaMins: 14
          }
        }
      ]);
      setIsTyping(false);
    }, 2000);
  };

  const handleAcceptQuote = (quote: any) => {
    cart.clearCart();
    cart.addItem({
      id: 'AI-JUMP',
      name: quote.serviceName,
      price: quote.finalTotal,
      type: 'service'
    });
    router.push('/checkout?shop=AI-DISPATCH');
  };

  return (
    <main className="flex flex-col h-[100dvh] bg-background text-foreground font-sans">
      
      {/* Top App Bar */}
      <div className="shrink-0 sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-4 pb-3 px-4 shadow-sm border-b border-white/5">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/emergency-report')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-6 w-6 relative pr-0.5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-body font-bold text-white">AI Diagnostic</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
              <span className="text-micro font-bold uppercase tracking-widest text-safe text-[8px]">Connected</span>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full px-4 py-6 space-y-6">
        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'ai' && !m.isQuote && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            
            {m.isQuote ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-full sm:w-auto"
              >
                <div className="text-small text-neutral-400 mb-2 pl-2 max-w-[85%]">{m.text}</div>
                <QuoteCard 
                  {...m.quoteData} 
                  onAccept={() => handleAcceptQuote(m.quoteData)} 
                />
              </motion.div>
            ) : (
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-body ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm shadow-md' 
                    : 'bg-surface text-foreground rounded-tl-sm border border-white/5 shadow-sm'
                }`}
              >
                {m.text}
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-surface rounded-2xl rounded-tl-sm px-5 py-3 border border-white/5 flex items-center gap-1.5 h-12">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area (pinned above keyboard) */}
      <div className="shrink-0 p-4 bg-background border-t border-white/5 pb-safe">
        <div className="flex items-end gap-2 bg-surface rounded-3xl p-1.5 pl-4 border border-white/10 focus-within:border-primary/50 transition-colors shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 bg-transparent text-body text-white placeholder:text-neutral-500 max-h-[120px] min-h-[44px] py-3 outline-none resize-none no-scrollbar"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 shrink-0 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-30 disabled:bg-surface active:scale-95 transition-all mb-0.5 mr-0.5"
          >
            <Send className="h-5 w-5 -ml-0.5" />
          </button>
        </div>
      </div>

    </main>
  );
}
