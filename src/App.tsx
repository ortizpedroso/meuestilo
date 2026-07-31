import React, { useState, useEffect } from 'react';
import {
  getServices,
  saveServices,
  getProfessionals,
  saveProfessionals,
  getAppointments,
  saveAppointments,
  addAppointment,
  getReviews,
  addReview,
  getSalonSettings,
  saveSalonSettings,
  getCustomers,
  resetDataToDefaults
} from './services/storage';
import { Service, Professional, Appointment, Review, SalonSettings, Customer } from './types';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesList } from './components/ServicesList';
import { ProfessionalsList } from './components/ProfessionalsList';
import { BookingFlow } from './components/BookingFlow';
import { ReviewsSection } from './components/ReviewsSection';
import { ShareModal } from './components/ShareModal';
import { EmailModal } from './components/EmailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';

export default function App() {
  // Core state from persistent storage
  const [services, setServices] = useState<Service[]>(getServices());
  const [professionals, setProfessionals] = useState<Professional[]>(getProfessionals());
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [reviews, setReviews] = useState<Review[]>(getReviews());
  const [settings, setSettings] = useState<SalonSettings>(getSalonSettings());
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());

  // UI Modal States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialBookingService, setInitialBookingService] = useState<Service | null>(null);
  const [initialBookingProf, setInitialBookingProf] = useState<Professional | null>(null);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [isShareOpen, setIsShareOpen] = useState(false);

  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [appointmentForEmail, setAppointmentForEmail] = useState<Appointment | null>(null);

  // Sync state when storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setServices(getServices());
      setProfessionals(getProfessionals());
      setAppointments(getAppointments());
      setReviews(getReviews());
      setSettings(getSalonSettings());
      setCustomers(getCustomers());
    };

    window.addEventListener('meustilo_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('meustilo_storage_update', handleStorageUpdate);
  }, []);

  // Compute average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 4.9;

  // Booking handlers
  const handleOpenBooking = (service?: Service, prof?: Professional) => {
    setInitialBookingService(service || null);
    setInitialBookingProf(prof || null);
    setIsBookingOpen(true);
  };

  const handleCompleteBooking = (newApp: Omit<Appointment, 'id' | 'code' | 'createdAt'>): Appointment => {
    const created = addAppointment(newApp);
    setAppointments(getAppointments());
    setCustomers(getCustomers());
    return created;
  };

  // Review handler
  const handleAddReview = (newRev: Omit<Review, 'id' | 'date'>) => {
    addReview(newRev);
    setReviews(getReviews());
  };

  // Admin handlers
  const handleOpenAdminToggle = () => {
    if (isAdminLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleUpdateServices = (updated: Service[]) => {
    saveServices(updated);
    setServices(updated);
  };

  const handleUpdateProfessionals = (updated: Professional[]) => {
    saveProfessionals(updated);
    setProfessionals(updated);
  };

  const handleUpdateAppointments = (updated: Appointment[]) => {
    saveAppointments(updated);
    setAppointments(updated);
    setCustomers(getCustomers());
  };

  const handleUpdateSettings = (updated: SalonSettings) => {
    saveSalonSettings(updated);
    setSettings(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Restaurar os dados iniciais do Meu Stilo? Isso redefinirá serviços, profissionais e agendamentos de exemplo.')) {
      resetDataToDefaults();
    }
  };

  const handleViewEmail = (app: Appointment) => {
    setAppointmentForEmail(app);
    setIsEmailOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-slate-900 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-900">
      
      {/* Header */}
      <Header
        settings={settings}
        averageRating={averageRating}
        totalReviews={reviews.length}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdminToggle}
        onOpenShare={() => setIsShareOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Page Layout */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <Hero
          settings={settings}
          averageRating={averageRating}
          totalReviews={reviews.length}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Services List Section */}
        <ServicesList
          services={services}
          onSelectService={(srv) => handleOpenBooking(srv)}
        />

        {/* Professionals List Section */}
        <ProfessionalsList
          professionals={professionals}
          services={services}
          onSelectProfessional={(prof) => handleOpenBooking(undefined, prof)}
        />

        {/* Customer Reviews Section */}
        <ReviewsSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={reviews.length}
          onAddReview={handleAddReview}
        />

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdminToggle}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Modals & Wizards */}
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

      <ShareModal
        settings={settings}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <EmailModal
        appointment={appointmentForEmail}
        settings={settings}
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        services={services}
        professionals={professionals}
        appointments={appointments}
        customers={customers}
        settings={settings}
        onUpdateServices={handleUpdateServices}
        onUpdateProfessionals={handleUpdateProfessionals}
        onUpdateAppointments={handleUpdateAppointments}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetDefaults}
      />

    </div>
  );
}
