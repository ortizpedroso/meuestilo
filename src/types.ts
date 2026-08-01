export type ServiceCategory = 'Cabelo' | 'Barba' | 'Estética & Unhas' | 'Tratamentos';

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory;
  imageUrl?: string;
  popular?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  rating: number;
  specialties: string[]; // Service IDs or category names
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: string; // "08:00"
  endTime: string; // "19:00"
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  code: string; // Unique short reference code like "MST-8492"
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clientName: string;
  clientPhone: string; // WhatsApp
  clientEmail: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisit?: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  serviceName?: string;
  professionalName?: string;
  verifiedBooking?: boolean;
}

export interface WorkingHoursConfig {
  slotIntervalMinutes: number; // e.g., 30
  workDays: {
    dayOfWeek: number; // 0-6
    dayName: string; // "Segunda", "Terça", etc.
    isOpen: boolean;
    openTime: string; // "08:00"
    closeTime: string; // "19:00"
    lunchStart?: string; // "12:00"
    lunchEnd?: string; // "13:00"
  }[];
}

export interface SalonSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  phone: string; // WhatsApp
  address: string;
  city: string;
  instagram: string;
  pixKey: string;
  themeColor?: string; // cor de destaque (white-label), ex: "#d97706"
  workingHours: WorkingHoursConfig;
  subscriptionPlan: {
    name: string;
    status: 'active' | 'pending' | 'expired';
    priceMonthly: number;
    nextBillingDate: string;
  };
}

export interface Subscription {
  id: string;
  plan: string;
  holderName: string;
  email: string;
  phone: string;
  salonName: string;
  price: number;
  status: 'pending' | 'active' | 'cancelled';
  provider?: string;
  mpOrderId?: string;
  createdAt: string;
}
