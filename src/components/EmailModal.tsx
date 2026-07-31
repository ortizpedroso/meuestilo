import React from 'react';
import { X, Mail, CheckCircle2, Calendar, MapPin, Scissors, UserCheck, ShieldCheck } from 'lucide-react';
import { Appointment, SalonSettings } from '../types';
import { formatDateLongBR, formatCurrency } from '../utils/formatters';

interface EmailModalProps {
  appointment: Appointment | null;
  settings: SalonSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  appointment,
  settings,
  isOpen,
  onClose
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden relative shadow-2xl text-slate-900">
        
        {/* Header bar */}
        <div className="bg-[#1A1A1A] px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-slate-200">Simulação de E-mail de Confirmação</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Body Card */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="bg-[#F9F7F5] p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p><strong className="text-slate-900">De:</strong> atendimento@{settings.name.toLowerCase().replace(/\s+/g, '')}.com.br</p>
            <p><strong className="text-slate-900">Para:</strong> {appointment.clientEmail}</p>
            <p><strong className="text-slate-900">Assunto:</strong> Confirmação de Agendamento #{appointment.code} - {settings.name}</p>
          </div>

          {/* Email HTML Template Design */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 space-y-5 shadow-xs">
            
            <div className="text-center space-y-2 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center mx-auto font-serif italic text-2xl shadow-xs">
                {settings.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">{settings.name}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Agendamento Confirmado
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Olá <strong className="text-amber-800">{appointment.clientName}</strong>, seu agendamento foi registrado com sucesso! Seguem os detalhes da sua reserva:
            </p>

            <div className="bg-[#F9F7F5] rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Código de Reserva</span>
                <span className="font-mono font-bold text-amber-800">{appointment.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Serviço:</span>
                <span className="font-bold text-slate-900">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Profissional:</span>
                <span className="font-bold text-slate-900">{appointment.professionalName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Data & Horário:</span>
                <span className="font-bold text-amber-800">{formatDateLongBR(appointment.date)} às {appointment.time}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Valor Total:</span>
                <span className="font-serif font-extrabold text-base text-slate-900">{formatCurrency(appointment.servicePrice)}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <p className="font-semibold text-slate-800 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-amber-600 mr-1" /> Endereço do Salão:
              </p>
              <p>{settings.address} - {settings.city}</p>
            </div>

            <p className="text-xs text-slate-500 text-center pt-2">
              Você receberá um lembrete no WhatsApp antes do horário marcado. Até breve!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
          >
            Fechar Visualização de E-mail
          </button>
        </div>

      </div>
    </div>
  );
};
