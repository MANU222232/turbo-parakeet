export type UserRole = "customer" | "driver" | "shop_owner";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}

export type OrderStatus = "pending" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  driverId?: string;
  status: OrderStatus;
  locationLat: number;
  locationLng: number;
  locationAddress: string;
  issueDescription: string;
  images: string[];
  quoteAmount: number;
  finalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  etaInitial: string;
  etaCurrent: string;
  arrivedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;
  isVerified: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description: string;
  basePrice: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
}
