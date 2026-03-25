import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
}

interface EmergencyState {
  name: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  address: string;
  landmark: string;
  vehicle: Vehicle;
  symptoms: string[];
  severity: 'low' | 'medium' | 'high';
  imageKeys: string[];
  preAnalysis: string;
  
  // Actions
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setAddress: (address: string) => void;
  setLocation: (lat: number, lng: number, address: string) => void;
  setLandmark: (landmark: string) => void;
  setVehicle: (vehicle: Partial<Vehicle>) => void;
  setSymptoms: (symptoms: string[]) => void;
  setSeverity: (severity: 'low' | 'medium' | 'high') => void;
  addImageKey: (key: string) => void;
  setPreAnalysis: (analysis: string) => void;
  setEmergencyData: (data: Partial<EmergencyState>) => void;
  reset: () => void;
}

const initialVehicle = {
  make: '',
  model: '',
  year: '',
  color: '',
  plate: '',
};

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      name: '',
      phone: '',
      lat: null,
      lng: null,
      address: '',
      landmark: '',
      vehicle: initialVehicle,
      symptoms: [],
      severity: 'low',
      imageKeys: [],
      preAnalysis: '',

      setName: (name) => set({ name }),
      setPhone: (phone) => set({ phone }),
      setAddress: (address) => set({ address }),
      setLocation: (lat, lng, address) => set({ lat, lng, address }),
      setLandmark: (landmark) => set({ landmark }),
      setVehicle: (vehicle) => set((state) => ({ vehicle: { ...state.vehicle, ...vehicle } })),
      setSymptoms: (symptoms) => set({ symptoms }),
      setSeverity: (severity) => set({ severity }),
      addImageKey: (key) => set((state) => ({ imageKeys: [...state.imageKeys, key] })),
      setPreAnalysis: (preAnalysis) => set({ preAnalysis }),
      setEmergencyData: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set({
        name: '',
        phone: '',
        lat: null,
        lng: null,
        address: '',
        landmark: '',
        vehicle: initialVehicle,
        symptoms: [],
        severity: 'low',
        imageKeys: [],
        preAnalysis: '',
      }),
    }),
    {
      name: 'emergency-storage',
    }
  )
);
