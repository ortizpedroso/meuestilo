import {
  Service,
  Professional,
  Appointment,
  Review,
  SalonSettings,
  Customer,
  Subscription
} from '../types';

/**
 * Base da API.
 * - Produção (Hostinger): o app fica em /ag_salao/ e a API em /ag_salao/api,
 *   então usamos import.meta.env.BASE_URL + 'api'.
 * - Dev/local: defina VITE_API_BASE (ex: http://localhost:8080/ag_salao/api).
 */
const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  `${import.meta.env.BASE_URL}api`.replace(/\/\/+api$/, '/api');

const TOKEN_KEY = 'ag_salao_admin_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Erro ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export interface BootstrapData {
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  reviews: Review[];
  settings: SalonSettings;
}

export const api = {
  bootstrap: () => request<BootstrapData>('bootstrap'),

  login: async (password: string): Promise<boolean> => {
    try {
      const { token } = await request<{ token: string }>('login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      setToken(token);
      return true;
    } catch {
      return false;
    }
  },
  logout: () => setToken(null),

  saveServices: (items: Service[]) =>
    request<Service[]>('services', { method: 'PUT', body: JSON.stringify(items) }),

  saveProfessionals: (items: Professional[]) =>
    request<Professional[]>('professionals', { method: 'PUT', body: JSON.stringify(items) }),

  createAppointment: (app: Omit<Appointment, 'id' | 'code' | 'createdAt'>) =>
    request<Appointment>('appointments', { method: 'POST', body: JSON.stringify(app) }),

  // IMP-03: autoatendimento do cliente (consultar/cancelar por código + telefone)
  lookupAppointment: (code: string, phone: string) =>
    request<Appointment>(
      `appointments/lookup?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`
    ),
  cancelAppointment: (code: string, phone: string) =>
    request<Appointment>('appointments/cancel', {
      method: 'POST',
      body: JSON.stringify({ code, phone })
    }),

  saveAppointments: (items: Appointment[]) =>
    request<Appointment[]>('appointments', { method: 'PUT', body: JSON.stringify(items) }),

  createReview: (review: Omit<Review, 'id' | 'date'>) =>
    request<Review>('reviews', { method: 'POST', body: JSON.stringify(review) }),

  saveSettings: (settings: SalonSettings) =>
    request<SalonSettings>('settings', { method: 'PUT', body: JSON.stringify(settings) }),

  getCustomers: () => request<Customer[]>('customers'),

  getSubscriptions: () => request<Subscription[]>('subscriptions'),

  createSubscription: (payload: {
    plan: string;
    holderName: string;
    email: string;
    phone?: string;
    salonName?: string;
    price?: number;
  }) =>
    request<{ subscription: Subscription; checkoutUrl: string | null }>('subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
