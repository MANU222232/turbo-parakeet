import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'product';
  quantity: number;
  duration?: string; // used for services
}

interface CartState {
  shopId: string | null;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  
  // Actions
  setShopId: (id: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

const TAX_RATE = 0.085; // 8.5%

export const useCartStore = create<CartState>((set) => ({
  shopId: null,
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,

  setShopId: (id) => set({ shopId: id }),

  addItem: (item) => set((state) => {
    // If shop changes, clear cart? Let's just allow for now.
    const existingIndex = state.items.findIndex(i => i.id === item.id);
    let newItems = [...state.items];
    
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += 1;
    } else {
      newItems.push({ ...item, quantity: 1 });
    }

    return calculateTotals(newItems);
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    return calculateTotals(newItems);
  }),

  updateQuantity: (id, delta) => set((state) => {
    let newItems = [...state.items];
    const index = newItems.findIndex(i => i.id === id);
    if (index >= 0) {
      newItems[index].quantity += delta;
      if (newItems[index].quantity <= 0) {
        newItems.splice(index, 1);
      }
    }
    return calculateTotals(newItems);
  }),

  clearCart: () => set({ shopId: null, items: [], subtotal: 0, tax: 0, total: 0 })
}));

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Check for bundles: e.g. "Towing" + "Tire Change"
  const hasTowing = items.some(i => i.name.toLowerCase().includes('towing'));
  const hasTire = items.some(i => i.name.toLowerCase().includes('tire change'));
  
  let discount = 0;
  if (hasTowing && hasTire) {
    discount = 20; // $20 bundle discount
  }
  
  const finalSubtotal = Math.max(0, subtotal - discount);
  const tax = finalSubtotal * TAX_RATE;
  return { items, subtotal: finalSubtotal, tax, total: finalSubtotal + tax };
}
