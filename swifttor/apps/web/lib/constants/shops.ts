export interface Shop {
  id: string;
  name: string;
  distanceMi: number;
  etaMins: number;
  rating: number;
  reviews: number;
  rate: number;        // completion rate 0-100
  jobs: number;        // total jobs completed
  driver: string;
  driverInitials: string;
  truck: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  image?: string;
}

export const SHOPS: Shop[] = [
  {
    id: 'shop_001',
    name: 'Highway Pro Services',
    distanceMi: 1.2,
    etaMins: 8,
    rating: 4.9,
    reviews: 512,
    rate: 98,
    jobs: 1247,
    driver: 'Mike Okonkwo',
    driverInitials: 'MO',
    truck: 'White Ford F-450 #ST-01',
    lat: 34.0522,
    lng: -118.2437,
    address: '1234 Wilshire Blvd, Los Angeles, CA 90017',
    phone: '+1 (213) 555-0100',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'shop_002',
    name: 'RoadMaster Station 7',
    distanceMi: 2.8,
    etaMins: 15,
    rating: 4.7,
    reviews: 298,
    rate: 96,
    jobs: 892,
    driver: 'Priya Nair',
    driverInitials: 'PN',
    truck: 'Yellow Tow Truck #ST-07',
    lat: 34.0595,
    lng: -118.2437,
    address: '5678 Spring St, Los Angeles, CA 90013',
    phone: '+1 (213) 555-0101',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'shop_003',
    name: 'QuickFix Automotive',
    distanceMi: 4.1,
    etaMins: 22,
    rating: 4.8,
    reviews: 741,
    rate: 99,
    jobs: 2103,
    driver: 'James Otieno',
    driverInitials: 'JO',
    truck: 'Red Van #ST-12',
    lat: 34.0728,
    lng: -118.2437,
    address: '9012 Olympic Blvd, Los Angeles, CA 90015',
    phone: '+1 (213) 555-0102',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'shop_004',
    name: 'SwiftStop Express',
    distanceMi: 6.2,
    etaMins: 35,
    rating: 4.5,
    reviews: 124,
    rate: 92,
    jobs: 445,
    driver: 'Sarah Mwangi',
    driverInitials: 'SM',
    truck: 'Blue Pickup #ST-19',
    lat: 34.0895,
    lng: -118.2437,
    address: '3456 Flower St, Los Angeles, CA 90017',
    phone: '+1 (213) 555-0103',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'shop_005',
    name: 'EliteRescue Towing',
    distanceMi: 3.5,
    etaMins: 18,
    rating: 4.6,
    reviews: 189,
    rate: 95,
    jobs: 678,
    driver: 'Carlos Rivera',
    driverInitials: 'CR',
    truck: 'Orange Heavy Duty #ST-22',
    lat: 34.0622,
    lng: -118.2650,
    address: '7890 Grand Ave, Los Angeles, CA 90015',
    phone: '+1 (213) 555-0104',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'shop_006',
    name: 'Diamond Service Hub',
    distanceMi: 5.3,
    etaMins: 28,
    rating: 4.8,
    reviews: 357,
    rate: 97,
    jobs: 1104,
    driver: 'Linda Wanjiku',
    driverInitials: 'LW',
    truck: 'Silver Flatbed #ST-05',
    lat: 34.0450,
    lng: -118.2500,
    address: '2468 Main St, Los Angeles, CA 90012',
    phone: '+1 (213) 555-0105',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=200',
  },
];
