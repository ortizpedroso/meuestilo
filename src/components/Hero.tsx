import React from 'react';
import { Calendar, MapPin, Clock, Phone, Star, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { SalonSettings } from '../types';

interface HeroProps {
  settings: SalonSettings;
  averageRating: number;
  totalReviews: number;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  averageRating,
  totalReviews,
  onOpenBooking
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F9F7F5] text-slate-900 pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Info Side */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Agendamento Online 24h • Confirmação Imediata</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1A1A1A] leading-[1.15]">
              Seu Estilo Em <span className="font-serif italic font-normal text-amber-700 underline decoration-amber-300 decoration-wavy decoration-2">Boas Mãos</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {settings.tagline}. Agende seu horário sem filas, escolha seu profissional favorito e receba confirmação direto no WhatsApp.
            </p>

            {/* Info Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs sm:text-sm shadow-xs">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{settings.address}</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs sm:text-sm shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Seg a Sáb 08h-20h</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs sm:text-sm shadow-xs">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>WhatsApp Direto</span>
              </div>
            </div>

            {/* CTA Buttons & Guarantees */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-base shadow-lg transition-colors group"
              >
                <Calendar className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform" />
                <span>Agendar Horário Agora</span>
              </button>

              <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                  <span>Sem cadastro demorado</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1" />
                  <span>Garantia de Horário</span>
                </div>
              </div>
            </div>

            {/* Ratings Proof */}
            <div className="pt-2 flex items-center justify-center lg:justify-start space-x-4">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Cliente" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Cliente" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Cliente" />
              </div>
              <div className="text-sm">
                <div className="flex items-center text-amber-600 font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                  <span className="ml-2 text-slate-900 font-extrabold">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-slate-500 text-xs">Mais de {totalReviews * 20}+ clientes satisfeitos</p>
              </div>
            </div>

          </div>

          {/* Visual Showcase Side */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-xl">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <img
                  src={settings.bannerUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'}
                  alt={settings.name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Onde Estamos</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{settings.address}</p>
                    <p className="text-[11px] text-slate-500">{settings.city}</p>
                  </div>
                  <button
                    onClick={onOpenBooking}
                    className="px-3.5 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
