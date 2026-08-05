import { Appointment } from '../types';

function csvEscape(val: string | number): string {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Gera e baixa um CSV dos agendamentos (admin). */
export function downloadAppointmentsCsv(appointments: Appointment[], salonName: string): void {
  const headers = [
    'Código',
    'Cliente',
    'Telefone',
    'E-mail',
    'Serviço',
    'Profissional',
    'Data',
    'Hora',
    'Valor',
    'Status'
  ];
  const rows = appointments.map((a) => [
    a.code,
    a.clientName,
    a.clientPhone,
    a.clientEmail || '',
    a.serviceName,
    a.professionalName,
    a.date,
    a.time,
    a.servicePrice.toFixed(2),
    a.status
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = salonName.replace(/[^\w\-]+/g, '_').slice(0, 40);
  a.href = url;
  a.download = `agendamentos_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
