import React from 'react';
import { Scissors, MapPin, Phone, Clock, Instagram, Shield, Sparkles } from 'lucide-react';
import { SalonSettings } from '../types';

interface FooterProps {
  settings: SalonSettings;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenShare: () => void;
  onOpenMyAppointment: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBooking,
  onOpenAdmin,
  onOpenShare,
  onOpenMyAppointment
}) => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-white font-serif italic text-xl shadow-xs">
                <span>S</span>
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">{settings.name}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {settings.tagline}. Agendamentos simples e rápidos de qualquer lugar.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Acesso Rápido</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={onOpenBooking} className="hover:text-amber-700 transition-colors">
                  Agendar Horário Online
                </button>
              </li>
              <li>
                <button onClick={onOpenMyAppointment} className="hover:text-amber-700 transition-colors">
                  Consultar / Cancelar Agendamento
                </button>
              </li>
              <li>
                <button onClick={onOpenShare} className="hover:text-amber-700 transition-colors">
                  Compartilhar Link do Salão
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-amber-700 transition-colors flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  <span>Área Administrativa</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Atendimento</h4>
            <div className="space-y-2 text-xs font-medium">
              <p className="flex items-center"><MapPin className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" /> {settings.address}</p>
              <p className="flex items-center"><Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" /> Seg a Sáb: 08h às 20h</p>
              <p className="flex items-center"><Phone className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" /> WhatsApp Direto</p>
            </div>
          </div>

          {/* Commercial SaaS Badge */}
          <div className="p-4 rounded-2xl bg-[#F9F7F5] border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Plataforma Meu Stilo PRO</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Software de agendamento profissional pronto para otimizar a rotina do seu salão de beleza.
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-emerald-600 font-bold">Sistema Online</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
