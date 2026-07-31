import React, { useState, useMemo } from 'react';
import { Service, Professional, Appointment, WorkingHoursConfig, SalonSettings } from '../types';
import {
  getAvailableTimeSlots,
  formatCurrency,
  formatDateLongBR,
  generateWhatsAppBookingMessage,
  generateGoogleCalendarUrl,
  formatDateBR
} from '../utils/formatters';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  MessageCircle,
  Mail,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  professionals: Professional[];
  workingHours: WorkingHoursConfig;
  allAppointments: Appointment[];
  settings: SalonSettings;
  initialService?: Service | null;
  initialProfessional?: Professional | null;
  onCompleteBooking: (app: Omit<Appointment, 'id' | 'code' | 'createdAt'>) => Promise<Appointment>;
  onViewEmail: (app: Appointment) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  isOpen,
  onClose,
  services,
  professionals,
  workingHours,
  allAppointments,
  settings,
  initialService,
  initialProfessional,
  onCompleteBooking,
  onViewEmail
}) => {
  // Wizard steps: 1 = Service, 2 = Professional, 3 = Date & Time, 4 = Client Form, 5 = Confirmation
  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || services[0] || null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | 'any'>(
    initialProfessional || 'any'
  );

  // Default date to today or tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Confirmed appointment object
  const [confirmedApp, setConfirmedApp] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Update initial selections if passed
  React.useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
    if (initialProfessional) {
      setSelectedProfessional(initialProfessional);
    }
  }, [initialService, initialProfessional]);

  // Available Time slots calculation
  const timeSlots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    const profId = typeof selectedProfessional === 'string' ? selectedProfessional : selectedProfessional.id;

    return getAvailableTimeSlots({
      date: selectedDate,
      professionalId: profId,
      serviceDurationMinutes: selectedService.durationMinutes,
      workingHours,
      allAppointments,
      professionals
    });
  }, [selectedService, selectedDate, selectedProfessional, workingHours, allAppointments, professionals]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && selectedProfessional) setStep(3);
    else if (step === 3 && selectedTime) setStep(4);
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 5) setStep(step - 1);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName.trim() || !clientPhone.trim()) {
      return;
    }

    const profName = typeof selectedProfessional === 'string'
      ? 'Qualquer Profissional Disponível'
      : selectedProfessional.name;

    const profId = typeof selectedProfessional === 'string'
      ? 'prof-1' // Assign to first by default if any
      : selectedProfessional.id;

    setSubmitting(true);
    setSubmitError('');
    try {
      const created = await onCompleteBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.durationMinutes,
        professionalId: profId,
        professionalName: profName,
        date: selectedDate,
        time: selectedTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        notes: notes.trim(),
        status: 'confirmed'
      });

      setConfirmedApp(created);
      setStep(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível concluir o agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = confirmedApp
    ? generateWhatsAppBookingMessage({
        salonName: settings.name,
        salonPhone: settings.phone,
        clientName: confirmedApp.clientName,
        serviceName: confirmedApp.serviceName,
        servicePrice: confirmedApp.servicePrice,
        date: confirmedApp.date,
        time: confirmedApp.time,
        professionalName: confirmedApp.professionalName,
        code: confirmedApp.code,
        address: settings.address
      })
    : '';

  const calendarUrl = confirmedApp
    ? generateGoogleCalendarUrl({
        serviceName: confirmedApp.serviceName,
        salonName: settings.name,
        date: confirmedApp.date,
        time: confirmedApp.time,
        duration: confirmedApp.serviceDuration,
        address: settings.address,
        code: confirmedApp.code
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full my-auto overflow-hidden relative shadow-2xl text-slate-900">
        
        {/* Header Bar */}
        <div className="bg-[#1A1A1A] px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">
              {step === 5 ? 'Agendamento Confirmado!' : `Agendar no ${settings.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Step 1 to 4) */}
        {step < 5 && (
          <div className="px-6 py-3 bg-[#F9F7F5] border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-amber-800">
              <span>Passo {step} de 4:</span>
              <span className="text-slate-700 font-bold">
                {step === 1 && 'Escolha o Serviço'}
                {step === 2 && 'Escolha o Profissional'}
                {step === 3 && 'Escolha Data & Horário'}
                {step === 4 && 'Seus Dados'}
              </span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s <= step ? 'w-6 bg-amber-600' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Selecione um Serviço:
              </h4>
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedService?.id === srv.id
                        ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {srv.imageUrl && (
                        <img src={srv.imageUrl} alt={srv.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      )}
                      <div>
                        <h5 className="font-bold text-sm text-[#1A1A1A]">{srv.name}</h5>
                        <p className="text-xs text-slate-500 line-clamp-1">{srv.description}</p>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-amber-600" />{srv.durationMinutes} min</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">{srv.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-serif font-bold text-amber-700">{formatCurrency(srv.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Professional */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Escolha com quem quer ser atendido(a):
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {/* Any Professional Option */}
                <div
                  onClick={() => setSelectedProfessional('any')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedProfessional === 'any'
                      ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
                      ✨
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#1A1A1A]">Qualquer Profissional Disponível</h5>
                      <p className="text-xs text-slate-500">Encontrar o primeiro horário livre na agenda</p>
                    </div>
                  </div>
                </div>

                {/* Specific Professionals */}
                {professionals.map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfessional(prof)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      typeof selectedProfessional !== 'string' && selectedProfessional.id === prof.id
                        ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <img src={prof.avatar} alt={prof.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200" />
                      <div>
                        <h5 className="font-bold text-sm text-[#1A1A1A]">{prof.name}</h5>
                        <p className="text-xs text-amber-700 font-bold">{prof.role}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{prof.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Select Date & Time Slot */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* Date Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  1. Escolha a Data
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-amber-700 font-bold mt-1">
                  {formatDateLongBR(selectedDate)}
                </p>
              </div>

              {/* Slots Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  2. Escolha um Horário Disponível
                </label>

                {timeSlots.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-xs text-slate-800 font-bold">Salão Fechado ou Sem Horários na Data Escolhida</p>
                    <p className="text-[11px] text-slate-500">Por favor, escolha outro dia acima para verificar horários.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedTime === slot.time
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                            : slot.available
                            ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        }`}
                        title={slot.reason}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Summary snippet */}
              <div className="p-3 bg-[#F9F7F5] rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Serviço: <strong className="text-slate-900">{selectedService?.name}</strong></span>
                <span className="text-amber-700 font-serif font-bold text-sm">{formatCurrency(selectedService?.price || 0)}</span>
              </div>

            </div>
          )}

          {/* STEP 4: Client Details Form */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Informe seus Dados para Finalizar:
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Maria Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp / Telefone com DDD *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 98888-7777"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail para Confirmação</label>
                <input
                  type="email"
                  placeholder="Ex: ana.maria@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Observações (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Preferência por corte baixo nas laterais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-[#F9F7F5] rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Serviço:</span>
                  <span className="font-bold text-slate-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Profissional:</span>
                  <span className="font-bold text-slate-900">
                    {typeof selectedProfessional === 'string' ? 'Qualquer Disponível' : selectedProfessional.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data & Horário:</span>
                  <span className="font-bold text-amber-700">{formatDateBR(selectedDate)} às {selectedTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-800 font-bold">Total a Pagar no Salão:</span>
                  <span className="font-serif font-extrabold text-base text-amber-700">{formatCurrency(selectedService?.price || 0)}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-xs text-rose-600 text-center font-semibold">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-base shadow-lg transition-colors"
              >
                {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          )}

          {/* STEP 5: Final Confirmation Screen */}
          {step === 5 && confirmedApp && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-serif font-bold text-[#1A1A1A]">Agendamento Realizado!</h4>
                <p className="text-xs text-slate-500">
                  Seu código de confirmação é <strong className="text-amber-700 font-mono text-sm">{confirmedApp.code}</strong>
                </p>
              </div>

              <div className="bg-[#F9F7F5] p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold text-slate-900">{confirmedApp.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serviço:</span>
                  <span className="font-bold text-slate-900">{confirmedApp.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Profissional:</span>
                  <span className="font-bold text-slate-900">{confirmedApp.professionalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data & Horário:</span>
                  <span className="font-bold text-amber-700">{formatDateLongBR(confirmedApp.date)} às {confirmedApp.time}</span>
                </div>
              </div>

              {/* Integration Buttons */}
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar & Enviar Resumo no WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-200"
                  >
                    <CalendarIcon className="w-4 h-4 text-amber-600" />
                    <span>Adicionar ao Calendar</span>
                  </a>

                  <button
                    onClick={() => onViewEmail(confirmedApp)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-200"
                  >
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>Ver E-mail de Confirmação</span>
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
                Concluir
              </button>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="bg-[#F9F7F5] px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : <div />}

            {step < 4 && (
              <button
                type="button"
                disabled={(step === 1 && !selectedService) || (step === 3 && !selectedTime)}
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1 shadow-md transition-colors"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
