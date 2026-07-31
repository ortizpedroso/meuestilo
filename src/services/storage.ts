import { Service, Professional, Appointment, Review, SalonSettings, Customer } from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PROFESSIONALS,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_SALON_SETTINGS
} from '../data/initialData';

const KEYS = {
  SERVICES: 'meustilo_services_v1',
  PROFESSIONALS: 'meustilo_professionals_v1',
  APPOINTMENTS: 'meustilo_appointments_v1',
  REVIEWS: 'meustilo_reviews_v1',
  SETTINGS: 'meustilo_settings_v1',
  CUSTOMERS: 'meustilo_customers_v1'
};

// Safe getter with fallback
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('meustilo_storage_update'));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Services CRUD
export function getServices(): Service[] {
  return getItem<Service[]>(KEYS.SERVICES, INITIAL_SERVICES);
}

export function saveServices(services: Service[]): void {
  setItem(KEYS.SERVICES, services);
}

// Professionals CRUD
export function getProfessionals(): Professional[] {
  return getItem<Professional[]>(KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
}

export function saveProfessionals(professionals: Professional[]): void {
  setItem(KEYS.PROFESSIONALS, professionals);
}

// Appointments CRUD
export function getAppointments(): Appointment[] {
  return getItem<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
}

export function saveAppointments(appointments: Appointment[]): void {
  setItem(KEYS.APPOINTMENTS, appointments);
  // Auto sync customers
  syncCustomersFromAppointments(appointments);
}

export function addAppointment(newApp: Omit<Appointment, 'id' | 'code' | 'createdAt'>): Appointment {
  const appointments = getAppointments();
  const randomCode = `STILO-${Math.floor(1000 + Math.random() * 9000)}`;
  const created: Appointment = {
    ...newApp,
    id: `app-${Date.now()}`,
    code: randomCode,
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...appointments];
  saveAppointments(updated);
  return created;
}

export function updateAppointmentStatus(id: string, status: Appointment['status']): void {
  const appointments = getAppointments();
  const updated = appointments.map(app => app.id === id ? { ...app, status } : app);
  saveAppointments(updated);
}

export function rescheduleAppointment(id: string, newDate: string, newTime: string): void {
  const appointments = getAppointments();
  const updated = appointments.map(app => app.id === id ? { ...app, date: newDate, time: newTime } : app);
  saveAppointments(updated);
}

// Reviews CRUD
export function getReviews(): Review[] {
  return getItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function addReview(review: Omit<Review, 'id' | 'date'>): Review {
  const reviews = getReviews();
  const created: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [created, ...reviews];
  setItem(KEYS.REVIEWS, updated);
  return created;
}

// Settings
export function getSalonSettings(): SalonSettings {
  return getItem<SalonSettings>(KEYS.SETTINGS, INITIAL_SALON_SETTINGS);
}

export function saveSalonSettings(settings: SalonSettings): void {
  setItem(KEYS.SETTINGS, settings);
}

// Customers derived
export function getCustomers(): Customer[] {
  const apps = getAppointments();
  return syncCustomersFromAppointments(apps);
}

function syncCustomersFromAppointments(appointments: Appointment[]): Customer[] {
  const customerMap = new Map<string, Customer>();

  appointments.forEach(app => {
    const key = app.clientPhone.trim() || app.clientEmail.trim() || app.clientName.trim();
    if (!key) return;

    const existing = customerMap.get(key) || {
      id: `cust-${key.replace(/\D/g, '') || Math.random()}`,
      name: app.clientName,
      phone: app.clientPhone,
      email: app.clientEmail,
      totalAppointments: 0,
      totalSpent: 0,
      lastVisit: app.date
    };

    existing.totalAppointments += 1;
    if (app.status !== 'cancelled') {
      existing.totalSpent += app.servicePrice;
    }
    if (!existing.lastVisit || app.date > existing.lastVisit) {
      existing.lastVisit = app.date;
    }

    customerMap.set(key, existing);
  });

  const list = Array.from(customerMap.values());
  setItem(KEYS.CUSTOMERS, list);
  return list;
}

// Reset data helper
export function resetDataToDefaults(): void {
  localStorage.removeItem(KEYS.SERVICES);
  localStorage.removeItem(KEYS.PROFESSIONALS);
  localStorage.removeItem(KEYS.APPOINTMENTS);
  localStorage.removeItem(KEYS.REVIEWS);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.CUSTOMERS);
  window.dispatchEvent(new Event('meustilo_storage_update'));
}
