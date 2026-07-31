import { Appointment, Customer } from '../types';

/**
 * Deriva a lista de clientes a partir dos agendamentos (agrupando por telefone).
 * Função pura — não escreve em lugar nenhum (evita o loop que existia no storage).
 */
export function deriveCustomers(appointments: Appointment[]): Customer[] {
  const map = new Map<string, Customer>();

  appointments.forEach((app) => {
    const key = app.clientPhone.trim() || app.clientEmail.trim() || app.clientName.trim();
    if (!key) return;

    const existing =
      map.get(key) || {
        id: `cust-${key.replace(/\D/g, '') || Math.random().toString(36).slice(2, 10)}`,
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

    map.set(key, existing);
  });

  return Array.from(map.values());
}
