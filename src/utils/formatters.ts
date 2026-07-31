import { Appointment, Professional, WorkingHoursConfig } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateLongBR(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Convert "08:30" to minutes from midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Convert minutes from midnight to "08:30"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Generate time slots based on working hours, service duration, and existing bookings
export function getAvailableTimeSlots(params: {
  date: string; // YYYY-MM-DD
  professionalId: string; // 'any' or prof-1
  serviceDurationMinutes: number;
  workingHours: WorkingHoursConfig;
  allAppointments: Appointment[];
  professionals: Professional[];
}): { time: string; available: boolean; reason?: string }[] {
  const { date, professionalId, serviceDurationMinutes, workingHours, allAppointments, professionals } = params;

  if (!date) return [];

  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday

  // Check if salon is open on this day
  const dayConfig = workingHours.workDays.find(d => d.dayOfWeek === dayOfWeek);
  if (!dayConfig || !dayConfig.isOpen) {
    return [];
  }

  const startMin = timeToMinutes(dayConfig.openTime);
  const endMin = timeToMinutes(dayConfig.closeTime);
  const lunchStart = dayConfig.lunchStart ? timeToMinutes(dayConfig.lunchStart) : null;
  const lunchEnd = dayConfig.lunchEnd ? timeToMinutes(dayConfig.lunchEnd) : null;

  const interval = workingHours.slotIntervalMinutes || 30;
  const slots: { time: string; available: boolean; reason?: string }[] = [];

  // Filter existing active appointments on this date
  const dayAppointments = allAppointments.filter(app => app.date === date && app.status !== 'cancelled');

  for (let current = startMin; current + serviceDurationMinutes <= endMin; current += interval) {
    const slotTime = minutesToTime(current);
    const slotEndMin = current + serviceDurationMinutes;

    // Check lunch break
    let isLunch = false;
    if (lunchStart !== null && lunchEnd !== null) {
      if (current < lunchEnd && slotEndMin > lunchStart) {
        isLunch = true;
      }
    }

    if (isLunch) {
      slots.push({ time: slotTime, available: false, reason: 'Horário de almoço' });
      continue;
    }

    // Check professional availability
    let isOccupied = false;

    if (professionalId !== 'any') {
      const prof = professionals.find(p => p.id === professionalId);
      if (prof && (!prof.workingDays.includes(dayOfWeek))) {
        slots.push({ time: slotTime, available: false, reason: 'Profissional de folga' });
        continue;
      }

      // Check collision with this professional's appointments
      const profApps = dayAppointments.filter(app => app.professionalId === professionalId);
      isOccupied = profApps.some(app => {
        const appStart = timeToMinutes(app.time);
        const appEnd = appStart + app.serviceDuration;
        return (current < appEnd && slotEndMin > appStart);
      });
    } else {
      // "Qualquer profissional" - available if AT LEAST ONE competent professional is free at this slot
      const capableProfs = professionals.filter(p => p.workingDays.includes(dayOfWeek));
      const freeProfs = capableProfs.filter(p => {
        const profApps = dayAppointments.filter(app => app.professionalId === p.id);
        const hasCollision = profApps.some(app => {
          const appStart = timeToMinutes(app.time);
          const appEnd = appStart + app.serviceDuration;
          return (current < appEnd && slotEndMin > appStart);
        });
        return !hasCollision;
      });

      if (freeProfs.length === 0) {
        isOccupied = true;
      }
    }

    // Check past time if date is today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (date === todayStr) {
      const currentMinNow = now.getHours() * 60 + now.getMinutes();
      if (current <= currentMinNow) {
        slots.push({ time: slotTime, available: false, reason: 'Horário passado' });
        continue;
      }
    }

    slots.push({
      time: slotTime,
      available: !isOccupied,
      reason: isOccupied ? 'Horário ocupado' : undefined
    });
  }

  return slots;
}

// WhatsApp Link Generator
export function generateWhatsAppBookingMessage(params: {
  salonName: string;
  salonPhone: string;
  clientName: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  professionalName: string;
  code: string;
  address: string;
}): string {
  const cleanPhone = params.salonPhone.replace(/\D/g, '');
  const text = `*NOVO AGENDAMENTO - ${params.salonName.toUpperCase()}* 💈✨

Olá! Gostaria de confirmar meu agendamento:

📋 *Código:* \`${params.code}\`
👤 *Cliente:* ${params.clientName}
✂️ *Serviço:* ${params.serviceName}
💰 *Valor:* ${formatCurrency(params.servicePrice)}
📅 *Data:* ${formatDateBR(params.date)}
⏰ *Horário:* ${params.time}
💈 *Profissional:* ${params.professionalName}
📍 *Local:* ${params.address}

Aguardando confirmação! Obrigado(a).`;

  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// WhatsApp Admin Reminder Link Generator
export function generateWhatsAppReminderMessage(params: {
  clientPhone: string;
  clientName: string;
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
}): string {
  const cleanPhone = params.clientPhone.replace(/\D/g, '');
  const text = `Olá *${params.clientName}*! 👋 

Passando para lembrar do seu agendamento no *${params.salonName}*:

✂️ *Serviço:* ${params.serviceName}
📅 *Data:* ${formatDateBR(params.date)}
⏰ *Horário:* ${params.time}
📍 *Endereço:* ${params.address}

Caso precise reagendar ou tenha alguma dúvida, responda a esta mensagem. Te esperamos! ✨`;

  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Google Calendar URL generator
export function generateGoogleCalendarUrl(app: {
  serviceName: string;
  salonName: string;
  date: string;
  time: string;
  duration: number;
  address: string;
  code: string;
}): string {
  const startMin = timeToMinutes(app.time);
  const endMin = startMin + app.duration;
  
  const startIso = app.date.replace(/-/g, '') + 'T' + app.time.replace(':', '') + '00';
  const endIso = app.date.replace(/-/g, '') + 'T' + minutesToTime(endMin).replace(':', '') + '00';

  const title = encodeURIComponent(`${app.serviceName} - ${app.salonName}`);
  const details = encodeURIComponent(`Agendamento #${app.code} no ${app.salonName}.\nServiço: ${app.serviceName}`);
  const location = encodeURIComponent(app.address);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}
