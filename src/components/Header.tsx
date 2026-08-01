import React from 'react';
import { Calendar, Shield, Share2, Star, Sparkles, Scissors } from 'lucide-react';
import { SalonSettings } from '../types';

interface HeaderProps {
  settings: SalonSettings;
  averageRating: number;
  totalReviews: number;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenShare: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  averageRating,
  totalReviews,
  onOpenBooking,
  onOpenAdmin,
  onOpenShare,
  isAdminLoggedIn
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Salon Info */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-white font-serif italic text-xl shadow-sm overflow-hidden group shrink-0">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span>S</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg sm:text-xl tracking-tight text-[#1A1A1A]">{settings.name}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200">
                  PRO
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className="flex items-center text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{totalReviews} avaliações</span>
              </div>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Share Button */}
            <button
              onClick={onOpenShare}
              aria-label="Compartilhar link do salão"
              className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/80 text-xs sm:text-sm font-semibold"
              title="Compartilhar Link do Salão"
            >
              <Share2 className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {/* Admin Toggle */}
            <button
              onClick={onOpenAdmin}
              aria-label="Abrir painel administrativo"
              className={`inline-flex items-center justify-center px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                isAdminLoggedIn
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 mr-1.5 text-amber-600" />
              <span className="hidden md:inline">{isAdminLoggedIn ? 'Painel Admin (Ativo)' : 'Admin Portal'}</span>
              <span className="md:hidden">Admin</span>
            </button>

            {/* Agendar CTA */}
            <button
              onClick={onOpenBooking}
              aria-label="Agendar horário"
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Agendar Horário</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
