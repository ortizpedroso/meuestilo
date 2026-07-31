import React from 'react';
import { Professional, Service } from '../types';
import { Star, Calendar, UserCheck, Award } from 'lucide-react';

interface ProfessionalsListProps {
  professionals: Professional[];
  services: Service[];
  onSelectProfessional: (prof: Professional) => void;
}

export const ProfessionalsList: React.FC<ProfessionalsListProps> = ({
  professionals,
  services,
  onSelectProfessional
}) => {
  return (
    <section className="py-16 bg-[#F9F7F5] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Equipe de Especialistas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            Conheça Nossos Profissionais
          </h2>
          <p className="text-slate-600 text-base">
            Equipe qualificada com anos de experiência no mercado de beleza e estética.
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {professionals.map((prof) => {
            const profServices = services.filter(s => prof.specialties.includes(s.id));

            return (
              <div
                key={prof.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md group"
              >
                <div>
                  {/* Avatar & Rating */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/60 shrink-0 shadow-xs">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-amber-700 transition-colors">
                        {prof.name}
                      </h3>
                      <p className="text-xs text-amber-700 font-bold">{prof.role}</p>
                      <div className="flex items-center space-x-1 mt-1 text-xs text-slate-700 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-amber-700">{prof.rating.toFixed(1)}</span>
                        <span className="text-slate-400">(Excelente)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    {prof.bio}
                  </p>

                  {/* Specialties Pills */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Especialidades Principais:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profServices.map(s => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedule Button */}
                <button
                  onClick={() => onSelectProfessional(prof)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar com {prof.name.split(' ')[0]}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
