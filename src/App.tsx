import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { deriveCustomers } from './utils/customers';
import { applyBrandTheme } from './utils/theme';
import { INITIAL_SALON_SETTINGS } from './data/initialData';
import {
  Service,
  Professional,
  Appointment,
  Review,
  SalonSettings,
  Subscription
} from './types';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesList } from './components/ServicesList';
import { ProfessionalsList } from './components/ProfessionalsList';
import { BookingFlow } from './components/BookingFlow';
import { ReviewsSection } from './components/ReviewsSection';
import { PlansSection } from './components/PlansSection';
import { ShareModal } from './components/ShareModal';
import { EmailModal } from './components/EmailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { MyAppointmentModal } from './components/MyAppointmentModal';
import { Footer } from './components/Footer';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Dados vindos da API
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SalonSettings>(INITIAL_SALON_SETTINGS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [mpPublicKey, setMpPublicKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Clientes são derivados dos agendamentos (sem persistência própria)
  const customers = useMemo(() => deriveCustomers(appointments), [appointments]);

  // UI Modal States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialBookingService, setInitialBookingService] = useState<Service | null>(null);
  const [initialBookingProf, setInitialBookingProf] = useState<Professional | null>(null);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => api ? false : false);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMyApptOpen, setIsMyApptOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [appointmentForEmail, setAppointmentForEmail] = useState<Appointment | null>(null);

  // Carrega dados iniciais da API
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.bootstrap();
      setServices(data.services || []);
      setProfessionals(data.professionals || []);
      setAppointments(data.appointments || []);
      setReviews(data.reviews || []);
      if (data.settings && data.settings.name) {
        setSettings(data.settings);
      }
      setMpPublicKey(data.mpPublicKey || '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Falha ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplica o tema (white-label) sempre que a cor mudar
  useEffect(() => {
    applyBrandTheme(settings.themeColor);
  }, [settings.themeColor]);

  // Carrega assinaturas quando o admin loga
  useEffect(() => {
    if (isAdminLoggedIn) {
      api.getSubscriptions().then(setSubscriptions).catch(() => setSubscriptions([]));
    }
  }, [isAdminLoggedIn]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 4.9;

  // Booking handlers
  const handleOpenBooking = (service?: Service, prof?: Professional) => {
    setInitialBookingService(service || null);
    setInitialBookingProf(prof || null);
    setIsBookingOpen(true);
  };

  const handleCompleteBooking = async (
    newApp: Omit<Appointment, 'id' | 'code' | 'createdAt'>
  ): Promise<Appointment> => {
    const created = await api.createAppointment(newApp);
    setAppointments((prev) => [created, ...prev]);
    return created;
  };

  const handleAddReview = async (newRev: Omit<Review, 'id' | 'date'>) => {
    const created = await api.createReview(newRev);
    setReviews((prev) => [created, ...prev]);
  };

  // Admin handlers
  const handleOpenAdminToggle = () => {
    if (isAdminLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginAttempt = async (password: string): Promise<boolean> => {
    const ok = await api.login(password);
    if (ok) {
      setIsAdminLoggedIn(true);
      setIsAdminLoginOpen(false);
      setIsAdminOpen(true);
    }
    return ok;
  };

  const handleLogout = () => {
    api.logout();
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
  };

  const persist = async (fn: () => Promise<unknown>, rollback: () => void) => {
    try {
      await fn();
    } catch (err) {
      alert('Não foi possível salvar: ' + (err instanceof Error ? err.message : 'erro'));
      rollback();
    }
  };

  const handleUpdateServices = (updated: Service[]) => {
    const prev = services;
    setServices(updated);
    persist(() => api.saveServices(updated), () => setServices(prev));
  };

  const handleUpdateProfessionals = (updated: Professional[]) => {
    const prev = professionals;
    setProfessionals(updated);
    persist(() => api.saveProfessionals(updated), () => setProfessionals(prev));
  };

  const handleUpdateAppointments = (updated: Appointment[]) => {
    const prev = appointments;
    setAppointments(updated);
    persist(() => api.saveAppointments(updated), () => setAppointments(prev));
  };

  const handleUpdateSettings = (updated: SalonSettings) => {
    const prev = settings;
    setSettings(updated);
    persist(() => api.saveSettings(updated), () => setSettings(prev));
  };

  const handleReloadData = () => {
    if (window.confirm('Recarregar os dados do servidor?')) {
      loadData();
    }
  };

  const handleViewEmail = (app: Appointment) => {
    setAppointmentForEmail(app);
    setIsEmailOpen(true);
  };

  const handleSubscribed = (sub: Subscription) => {
    setSubscriptions((prev) => [sub, ...prev]);
  };

  const handleRefundSubscription = async (id: string) => {
    if (!window.confirm('Reembolsar o pagamento e cancelar esta assinatura?')) return;
    try {
      const res = await api.refundSubscription(id);
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? res.subscription : s)));
    } catch (err) {
      alert('Falha ao reembolsar: ' + (err instanceof Error ? err.message : 'erro'));
    }
  };

  // ----- Estados de carregamento / erro -----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F5] flex flex-col items-center justify-center text-slate-600 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        <p className="text-sm font-semibold">Carregando o sistema...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F9F7F5] flex flex-col items-center justify-center text-slate-700 space-y-4 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-600" />
        <h1 className="text-xl font-bold text-slate-900">Não foi possível conectar ao servidor</h1>
        <p className="text-sm max-w-md text-slate-500">{loadError}</p>
        <p className="text-xs max-w-md text-slate-400">
          Verifique se a API (pasta <code>/api</code>) e o banco de dados estão configurados
          corretamente (arquivo <code>config.php</code>).
        </p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-sm transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-slate-900 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-900">
      <Header
        settings={settings}
        averageRating={averageRating}
        totalReviews={reviews.length}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdminToggle}
        onOpenShare={() => setIsShareOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <main className="flex-1">
        <Hero
          settings={settings}
          averageRating={averageRating}
          totalReviews={reviews.length}
          onOpenBooking={() => handleOpenBooking()}
        />

        <ServicesList services={services} onSelectService={(srv) => handleOpenBooking(srv)} />

        <ProfessionalsList
          professionals={professionals}
          services={services}
          onSelectProfessional={(prof) => handleOpenBooking(undefined, prof)}
        />

        <ReviewsSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={reviews.length}
          onAddReview={handleAddReview}
        />

        <PlansSection settings={settings} mpPublicKey={mpPublicKey} onSubscribed={handleSubscribed} />
      </main>

      <Footer
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdminToggle}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenMyAppointment={() => setIsMyApptOpen(true)}
      />

      <BookingFlow
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        professionals={professionals}
        workingHours={settings.workingHours}
        allAppointments={appointments}
        settings={settings}
        initialService={initialBookingService}
        initialProfessional={initialBookingProf}
        onCompleteBooking={handleCompleteBooking}
        onViewEmail={handleViewEmail}
      />

      <ShareModal settings={settings} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      <MyAppointmentModal isOpen={isMyApptOpen} onClose={() => setIsMyApptOpen(false)} />

      <EmailModal
        appointment={appointmentForEmail}
        settings={settings}
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSubmitPassword={handleLoginAttempt}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        services={services}
        professionals={professionals}
        appointments={appointments}
        customers={customers}
        settings={settings}
        subscriptions={subscriptions}
        onRefundSubscription={handleRefundSubscription}
        onUpdateServices={handleUpdateServices}
        onUpdateProfessionals={handleUpdateProfessionals}
        onUpdateAppointments={handleUpdateAppointments}
        onUpdateSettings={handleUpdateSettings}
        onReloadData={handleReloadData}
        onLogout={handleLogout}
      />
    </div>
  );
}
