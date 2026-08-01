import React, { useState } from 'react';
import {
  Service,
  Professional,
  Appointment,
  Customer,
  SalonSettings,
  ServiceCategory,
  Subscription
} from '../types';
import {
  formatCurrency,
  formatDateBR,
  generateWhatsAppReminderMessage,
  formatPhone
} from '../utils/formatters';
import {
  Calendar,
  Users,
  Scissors,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  XCircle,
  MessageCircle,
  RefreshCw,
  CreditCard,
  Building,
  Settings,
  CalendarCheck,
  LogOut,
  Sparkles,
  ShieldCheck,
  Palette,
  Save
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  customers: Customer[];
  settings: SalonSettings;
  subscriptions: Subscription[];
  onUpdateServices: (services: Service[]) => void;
  onUpdateProfessionals: (professionals: Professional[]) => void;
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onUpdateSettings: (settings: SalonSettings) => void;
  onReloadData: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  services,
  professionals,
  appointments,
  customers,
  settings,
  subscriptions,
  onUpdateServices,
  onUpdateProfessionals,
  onUpdateAppointments,
  onUpdateSettings,
  onReloadData,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'appointments' | 'services' | 'professionals' | 'customers' | 'hours' | 'branding' | 'monetization'
  >('dashboard');

  // Rascunho de edição da marca (white-label)
  const [brandDraft, setBrandDraft] = useState<SalonSettings>(settings);
  React.useEffect(() => {
    setBrandDraft(settings);
  }, [settings]);
  const handleSaveBrand = () => {
    onUpdateSettings(brandDraft);
  };

  // Search & Filter states
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');

  // Reschedule Modal State
  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Service Edit / Create Modal State
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Professional Edit / Create Modal State
  const [editingProf, setEditingProf] = useState<Partial<Professional> | null>(null);

  if (!isOpen) return null;

  // Stats calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'completed');
  const totalRevenueToday = confirmedToday.reduce((acc, curr) => acc + curr.servicePrice, 0);

  const totalMonthlyRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.servicePrice, 0);

  // Appointments filter logic
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.clientName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      app.code.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      app.clientPhone.includes(appointmentSearch);

    const matchesStatus =
      appointmentStatusFilter === 'all'
        ? true
        : appointmentStatusFilter === 'today'
        ? app.date === todayStr
        : app.status === appointmentStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action Handlers
  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      const updated = appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a));
      onUpdateAppointments(updated);
    }
  };

  const handleCompleteAppointment = (id: string) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: 'completed' as const } : a));
    onUpdateAppointments(updated);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApp || !newDate || !newTime) return;

    const updated = appointments.map((a) =>
      a.id === rescheduleApp.id ? { ...a, date: newDate, time: newTime } : a
    );
    onUpdateAppointments(updated);
    setRescheduleApp(null);
  };

  // Service CRUD
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name || !editingService.price) return;

    if (editingService.id) {
      // Edit
      const updated = services.map((s) => (s.id === editingService.id ? ({ ...s, ...editingService } as Service) : s));
      onUpdateServices(updated);
    } else {
      // Create
      const newSrv: Service = {
        id: `srv-${Date.now()}`,
        name: editingService.name,
        description: editingService.description || '',
        durationMinutes: editingService.durationMinutes || 30,
        price: Number(editingService.price),
        category: (editingService.category as ServiceCategory) || 'Cabelo',
        popular: !!editingService.popular,
        imageUrl: editingService.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400'
      };
      onUpdateServices([newSrv, ...services]);
    }
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Excluir este serviço?')) {
      onUpdateServices(services.filter((s) => s.id !== id));
    }
  };

  // Professional CRUD
  const handleSaveProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProf || !editingProf.name) return;

    if (editingProf.id) {
      const updated = professionals.map((p) =>
        p.id === editingProf.id ? ({ ...p, ...editingProf } as Professional) : p
      );
      onUpdateProfessionals(updated);
    } else {
      const newProf: Professional = {
        id: `prof-${Date.now()}`,
        name: editingProf.name,
        role: editingProf.role || 'Profissional',
        avatar: editingProf.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        bio: editingProf.bio || '',
        rating: 5.0,
        specialties: editingProf.specialties || services.map((s) => s.id),
        workingDays: [1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '19:00'
      };
      onUpdateProfessionals([...professionals, newProf]);
    }
    setEditingProf(null);
  };

  const handleDeleteProfessional = (id: string) => {
    if (window.confirm('Excluir este profissional?')) {
      onUpdateProfessionals(professionals.filter((p) => p.id !== id));
    }
  };

  // Working Hours Update
  const handleUpdateWorkingDay = (dayIndex: number, isOpen: boolean, openTime: string, closeTime: string) => {
    const updatedDays = settings.workingHours.workDays.map((d) =>
      d.dayOfWeek === dayIndex ? { ...d, isOpen, openTime, closeTime } : d
    );
    onUpdateSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        workDays: updatedDays
      }
    });
  };

  // Intervalo entre horários (slot) - global
  const handleUpdateInterval = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        slotIntervalMinutes: minutes
      }
    });
  };

  // Horário de almoço por dia
  const handleUpdateLunch = (dayIndex: number, lunchStart: string, lunchEnd: string) => {
    const updatedDays = settings.workingHours.workDays.map((d) =>
      d.dayOfWeek === dayIndex ? { ...d, lunchStart, lunchEnd } : d
    );
    onUpdateSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        workDays: updatedDays
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden relative shadow-2xl">
        
        {/* Top Header */}
        <div className="bg-[#1A1A1A] px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Painel Gestão Meu Stilo</h2>
              <p className="text-xs text-slate-400">Administração de Agenda, Serviços e Faturamento</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onReloadData}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
              title="Recarregar dados do servidor"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Recarregar</span>
            </button>

            <button
              onClick={onLogout}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
              title="Sair do painel"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Sair</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar painel"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-60 bg-[#F9F7F5] border-b md:border-b-0 md:border-r border-slate-200 p-3 flex md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto shrink-0">
            {[
              { id: 'dashboard', label: 'Visão Geral', icon: CalendarCheck },
              { id: 'appointments', label: 'Agendamentos', icon: Calendar },
              { id: 'services', label: 'Serviços', icon: Scissors },
              { id: 'professionals', label: 'Profissionais', icon: Users },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'hours', label: 'Horários', icon: Clock },
              { id: 'branding', label: 'Marca (White-label)', icon: Palette },
              { id: 'monetization', label: 'Plano SaaS Pro', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#1A1A1A] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
            
            {/* TAB 1: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 block">Agendamentos Hoje</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{todayAppointments.length}</span>
                    <span className="text-[11px] text-amber-400 mt-1 block">{confirmedToday.length} confirmados</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 block">Receita Prevista Hoje</span>
                    <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{formatCurrency(totalRevenueToday)}</span>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Faturamento em tempo real</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 block">Base de Clientes</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{customers.length}</span>
                    <span className="text-[11px] text-zinc-500 mt-1 block">Cadastrados no sistema</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 block">Receita Total Acumulada</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{formatCurrency(totalMonthlyRevenue)}</span>
                    <span className="text-[11px] text-zinc-500 mt-1 block">Agendamentos concluídos</span>
                  </div>
                </div>

                {/* Agenda de Hoje Timeline */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Agenda de Hoje ({formatDateBR(todayStr)})</span>
                    </h3>
                    <span className="text-xs text-zinc-400">{todayAppointments.length} atendimentos</span>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">Nenhum agendamento para hoje ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs border border-amber-500/20">
                              {app.time}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white">{app.clientName}</p>
                              <p className="text-xs text-zinc-400">{app.serviceName} • {app.professionalName}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                              app.status === 'confirmed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {app.status === 'confirmed' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            </span>

                            <a
                              href={generateWhatsAppReminderMessage({
                                clientPhone: app.clientPhone,
                                clientName: app.clientName,
                                salonName: settings.name,
                                serviceName: app.serviceName,
                                date: app.date,
                                time: app.time,
                                address: settings.address
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Lembrar Cliente no WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: Appointments Management */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, código ou telefone..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={appointmentStatusFilter}
                    onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos os Agendamentos</option>
                    <option value="today">Apenas Hoje</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="completed">Concluídos</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>

                {/* Appointments List */}
                <div className="space-y-3">
                  {filteredAppointments.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-10">Nenhum agendamento encontrado.</p>
                  ) : (
                    filteredAppointments.map((app) => (
                      <div
                        key={app.id}
                        className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-amber-400 font-bold">#{app.code}</span>
                            <span className="text-sm font-bold text-white">{app.clientName}</span>
                            <span className="text-xs text-zinc-500">({formatPhone(app.clientPhone)})</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              app.status === 'confirmed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {app.status === 'confirmed' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-400">
                          <div>
                            <span className="block text-[10px] text-zinc-500">Serviço</span>
                            <span className="font-semibold text-zinc-200">{app.serviceName}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">Profissional</span>
                            <span className="font-semibold text-zinc-200">{app.professionalName}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">Data e Hora</span>
                            <span className="font-semibold text-amber-400">{formatDateBR(app.date)} às {app.time}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">Valor</span>
                            <span className="font-extrabold text-white">{formatCurrency(app.servicePrice)}</span>
                          </div>
                        </div>

                        {/* Actions bar */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800/50">
                          <a
                            href={generateWhatsAppReminderMessage({
                              clientPhone: app.clientPhone,
                              clientName: app.clientName,
                              salonName: settings.name,
                              serviceName: app.serviceName,
                              date: app.date,
                              time: app.time,
                              address: settings.address
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {app.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => {
                                  setRescheduleApp(app);
                                  setNewDate(app.date);
                                  setNewTime(app.time);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                              >
                                Reagendar
                              </button>

                              <button
                                onClick={() => handleCompleteAppointment(app.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 text-xs font-semibold transition-colors"
                              >
                                Concluir
                              </button>

                              <button
                                onClick={() => handleCancelAppointment(app.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: Services CRUD */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Cadastro de Serviços</h3>
                    <p className="text-xs text-zinc-400">Adicione, edite ou altere preços e durações dos serviços oferecidos</p>
                  </div>
                  <button
                    onClick={() => setEditingService({ category: 'Cabelo', durationMinutes: 30, price: 50 })}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Serviço</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between space-x-4"
                    >
                      <div className="flex items-start space-x-3">
                        {srv.imageUrl && (
                          <img src={srv.imageUrl} alt={srv.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">{srv.description}</p>
                          <div className="flex items-center space-x-2 mt-1 text-[11px] text-zinc-400">
                            <span>{srv.durationMinutes} min</span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">{formatCurrency(srv.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => setEditingService(srv)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Professionals CRUD */}
            {activeTab === 'professionals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Equipe de Profissionais</h3>
                    <p className="text-xs text-zinc-400">Gerencie barbeiros, cabeleireiros e especialistas do salão</p>
                  </div>
                  <button
                    onClick={() => setEditingProf({ role: 'Especialista', rating: 5.0 })}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Profissional</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={prof.avatar} alt={prof.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-500/30" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{prof.name}</h4>
                          <p className="text-xs text-amber-400 font-medium">{prof.role}</p>
                          <p className="text-[11px] text-zinc-500">{prof.bio}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => setEditingProf(prof)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfessional(prof.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Customers Database */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Cadastro e Histórico de Clientes</h3>
                
                <div className="space-y-3">
                  {customers.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{cust.name}</h4>
                        <p className="text-xs text-zinc-400">{formatPhone(cust.phone)} • {cust.email}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <span className="text-zinc-500 block">Atendimentos</span>
                          <span className="font-bold text-white">{cust.totalAppointments} visitas</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 block">Total Gasto</span>
                          <span className="font-extrabold text-amber-400">{formatCurrency(cust.totalSpent)}</span>
                        </div>
                        <a
                          href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: Working Hours */}
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Configurar Horários de Funcionamento</h3>
                  <p className="text-xs text-zinc-400">Defina os dias de abertura, o intervalo entre horários e o almoço</p>
                </div>

                {/* Intervalo entre horários (global) */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Intervalo entre horários</h4>
                    <p className="text-xs text-zinc-400">De quanto em quanto tempo os horários são oferecidos ao cliente.</p>
                  </div>
                  <select
                    value={settings.workingHours.slotIntervalMinutes || 30}
                    onChange={(e) => handleUpdateInterval(Number(e.target.value))}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs"
                  >
                    {[10, 15, 20, 30, 40, 45, 60].map((m) => (
                      <option key={m} value={m}>{m} minutos</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {settings.workingHours.workDays.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={day.isOpen}
                            onChange={(e) =>
                              handleUpdateWorkingDay(day.dayOfWeek, e.target.checked, day.openTime, day.closeTime)
                            }
                            className="w-4 h-4 rounded accent-amber-500"
                          />
                          <span className="font-bold text-sm text-white w-28">{day.dayName}</span>
                        </div>

                        {day.isOpen ? (
                          <div className="flex items-center space-x-2">
                            <span>Abre:</span>
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) =>
                                handleUpdateWorkingDay(day.dayOfWeek, true, e.target.value, day.closeTime)
                              }
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white"
                            />
                            <span>Fecha:</span>
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) =>
                                handleUpdateWorkingDay(day.dayOfWeek, true, day.openTime, e.target.value)
                              }
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white"
                            />
                          </div>
                        ) : (
                          <span className="text-rose-400 font-semibold">Fechado</span>
                        )}
                      </div>

                      {day.isOpen && (
                        <div className="flex items-center space-x-2 sm:pl-7 text-zinc-400">
                          <span>Almoço:</span>
                          <input
                            type="time"
                            value={day.lunchStart || ''}
                            onChange={(e) => handleUpdateLunch(day.dayOfWeek, e.target.value, day.lunchEnd || '')}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white"
                          />
                          <span>às</span>
                          <input
                            type="time"
                            value={day.lunchEnd || ''}
                            onChange={(e) => handleUpdateLunch(day.dayOfWeek, day.lunchStart || '', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white"
                          />
                          <span className="text-zinc-600">(opcional)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: Branding / White-label */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Identidade da Marca (White-label)</h3>
                    <p className="text-xs text-zinc-400">Personalize nome, logo, cores e contatos. O site inteiro se adapta à sua marca.</p>
                  </div>
                  <button
                    onClick={handleSaveBrand}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Marca</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-300 mb-1">Nome do Salão</label>
                    <input type="text" value={brandDraft.name}
                      onChange={(e) => setBrandDraft({ ...brandDraft, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Slogan / Tagline</label>
                    <input type="text" value={brandDraft.tagline}
                      onChange={(e) => setBrandDraft({ ...brandDraft, tagline: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">URL do Logo</label>
                    <input type="text" value={brandDraft.logoUrl}
                      onChange={(e) => setBrandDraft({ ...brandDraft, logoUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">URL do Banner (foto de destaque)</label>
                    <input type="text" value={brandDraft.bannerUrl}
                      onChange={(e) => setBrandDraft({ ...brandDraft, bannerUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">WhatsApp (só números)</label>
                    <input type="text" value={brandDraft.phone}
                      onChange={(e) => setBrandDraft({ ...brandDraft, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Instagram</label>
                    <input type="text" value={brandDraft.instagram}
                      onChange={(e) => setBrandDraft({ ...brandDraft, instagram: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Endereço</label>
                    <input type="text" value={brandDraft.address}
                      onChange={(e) => setBrandDraft({ ...brandDraft, address: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Cidade / UF</label>
                    <input type="text" value={brandDraft.city}
                      onChange={(e) => setBrandDraft({ ...brandDraft, city: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Chave PIX</label>
                    <input type="text" value={brandDraft.pixKey}
                      onChange={(e) => setBrandDraft({ ...brandDraft, pixKey: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Cor de Destaque</label>
                    <div className="flex items-center space-x-3">
                      <input type="color" value={brandDraft.themeColor || '#d97706'}
                        onChange={(e) => setBrandDraft({ ...brandDraft, themeColor: e.target.value })}
                        className="w-12 h-10 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer" />
                      <input type="text" value={brandDraft.themeColor || '#d97706'}
                        onChange={(e) => setBrandDraft({ ...brandDraft, themeColor: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Dica: a cor de destaque é aplicada nos botões, ícones e destaques do site em tempo real após salvar.
                </p>
              </div>
            )}

            {/* TAB 8: Monetization / SaaS Subscription */}
            {activeTab === 'monetization' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 text-white space-y-4">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Plano Comercialmente Ativo</span>
                  </div>
                  <h3 className="text-2xl font-extrabold">Meu Stilo SaaS Pro - Assinatura Mensal</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                    Este sistema está pronto para ser comercializado como um software por assinatura para salões, barbearias e centros de estética. Inclui white-label, hospedagem inclusa e suporte a múltiplos profissionais.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                      <span className="text-xs text-zinc-400 block">Plano Atual</span>
                      <span className="text-lg font-bold text-white block mt-1">{settings.subscriptionPlan.name}</span>
                      <span className="text-xs text-emerald-400 font-semibold mt-1 block">Status: Ativo</span>
                    </div>

                    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                      <span className="text-xs text-zinc-400 block">Valor Mensal</span>
                      <span className="text-lg font-bold text-amber-400 block mt-1">R$ 89,90 / mês</span>
                      <span className="text-xs text-zinc-500 mt-1 block">Renovação: {settings.subscriptionPlan.nextBillingDate}</span>
                    </div>

                    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                      <span className="text-xs text-zinc-400 block">Recursos Liberados</span>
                      <span className="text-lg font-bold text-white block mt-1">Ilimitados</span>
                      <span className="text-xs text-zinc-400 mt-1 block">Agendamentos & WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Solicitações de assinatura recebidas */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Contratações Recebidas ({subscriptions.length})</span>
                  </h3>
                  {subscriptions.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 text-center bg-zinc-900 rounded-2xl border border-zinc-800">
                      Nenhuma contratação registrada ainda.
                    </p>
                  ) : (
                    subscriptions.map((sub) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-white">{sub.holderName} {sub.salonName && <span className="text-zinc-400 font-normal">• {sub.salonName}</span>}</p>
                          <p className="text-xs text-zinc-400">{sub.email} {sub.phone && `• ${sub.phone}`}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-amber-400 font-bold">{formatCurrency(sub.price)}/mês</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            sub.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {sub.status === 'active' ? 'Ativa' : sub.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Reschedule Modal */}
      {rescheduleApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setRescheduleApp(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-base font-bold text-white mb-4">Reagendar Atendimento</h4>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nova Data</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Novo Horário</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                Salvar Novo Horário
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Service Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-base font-bold text-white">
              {editingService.id ? 'Editar Serviço' : 'Novo Serviço'}
            </h4>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Descrição</label>
                <textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    required
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    required
                    value={editingService.durationMinutes || 30}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs mt-2"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professional Edit Modal */}
      {editingProf && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button
              onClick={() => setEditingProf(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-base font-bold text-white">
              {editingProf.id ? 'Editar Profissional' : 'Novo Profissional'}
            </h4>
            <form onSubmit={handleSaveProfessional} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingProf.name || ''}
                  onChange={(e) => setEditingProf({ ...editingProf, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Cargo / Especialidade</label>
                <input
                  type="text"
                  required
                  value={editingProf.role || ''}
                  onChange={(e) => setEditingProf({ ...editingProf, role: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Biografia Curta</label>
                <textarea
                  value={editingProf.bio || ''}
                  onChange={(e) => setEditingProf({ ...editingProf, bio: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs mt-2"
              >
                Salvar Profissional
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
