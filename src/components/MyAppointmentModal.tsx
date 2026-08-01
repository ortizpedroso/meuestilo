import React, { useState } from 'react';
import { X, Search, CalendarCheck, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { Appointment } from '../types';
import { api } from '../services/api';
import { formatDateLongBR, formatCurrency } from '../utils/formatters';

interface MyAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyAppointmentModal: React.FC<MyAppointmentModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setCode('');
    setPhone('');
    setAppointment(null);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) {
      setError('Informe o código e o telefone.');
      return;
    }
    setLoading(true);
    setError('');
    setAppointment(null);
    try {
      const found = await api.lookupAppointment(code.trim(), phone.trim());
      setAppointment(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agendamento não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
    setCancelling(true);
    setError('');
    try {
      const updated = await api.cancelAppointment(code.trim(), phone.trim());
      setAppointment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cancelar.');
    } finally {
      setCancelling(false);
    }
  };

  const statusLabel = (s: string) =>
    s === 'confirmed' ? 'Confirmado' : s === 'completed' ? 'Concluído' : s === 'cancelled' ? 'Cancelado' : 'Pendente';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 relative shadow-2xl text-slate-900 my-auto">
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Meu Agendamento</h3>
          <p className="text-xs text-slate-500">
            Consulte ou cancele usando o código (STILO-xxxx) e o telefone informado na reserva.
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Código do Agendamento</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: STILO-1234"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Telefone (WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (11) 98888-7777"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600"
            />
          </div>
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Buscando...' : 'Consultar'}</span>
          </button>
        </form>

        {appointment && (
          <div className="mt-5 bg-[#F9F7F5] rounded-2xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-mono font-bold text-amber-700">{appointment.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                  appointment.status === 'confirmed'
                    ? 'bg-amber-100 text-amber-800'
                    : appointment.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : appointment.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {statusLabel(appointment.status)}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-slate-500">Cliente</span><span className="font-bold">{appointment.clientName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Serviço</span><span className="font-bold">{appointment.serviceName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Profissional</span><span className="font-bold">{appointment.professionalName}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-1" />Data & Hora</span>
              <span className="font-bold text-amber-700">{formatDateLongBR(appointment.date)} às {appointment.time}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-500">Valor</span><span className="font-serif font-extrabold">{formatCurrency(appointment.servicePrice)}</span></div>

            {appointment.status === 'cancelled' ? (
              <div className="flex items-center justify-center space-x-1.5 pt-2 text-rose-600 font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Agendamento cancelado</span>
              </div>
            ) : appointment.status === 'confirmed' ? (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{cancelling ? 'Cancelando...' : 'Cancelar Agendamento'}</span>
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-1.5 pt-2 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Atendimento concluído</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
