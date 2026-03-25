export interface Location {
  lat: number;
  lng: number;
}

export interface TowRequest {
  id: string;
  serviceType: string;
  vehicleInfo: string;
  location: Location;
  status: 'pending' | 'en_route' | 'arrived';
  progress: number;
}

export const SERVICES = [
  { id: 'towing', name: 'Emergency Towing', icon: 'Truck', description: '24/7 flatbed and wheel-lift towing for all vehicle types.' },
  { id: 'lockout', name: 'Lockout Service', icon: 'Key', description: 'Professional entry into your vehicle without damage.' },
  { id: 'battery', name: 'Battery Jumpstart', icon: 'Zap', description: 'Quick jumpstarts or on-site battery replacement.' },
  { id: 'fuel', name: 'Fuel Delivery', icon: 'Fuel', description: 'Emergency gas or diesel delivery to get you to the next station.' },
];
