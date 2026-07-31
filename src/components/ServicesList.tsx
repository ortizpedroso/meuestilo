import React, { useState } from 'react';
import { Service, ServiceCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Clock, Calendar, Sparkles, Scissors, HeartHandshake, ShieldCheck } from 'lucide-react';

interface ServicesListProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({ services, onSelectService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories: string[] = ['Todos', 'Cabelo', 'Barba', 'Estética & Unhas', 'Tratamentos'];

  const filteredServices = selectedCategory === 'Todos'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <section className="py-16 bg-white text-slate-900 relative border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5 text-amber-600" />
            <span>Nossos Serviços & Menu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            Escolha o Atendimento Ideal Para Você
          </h2>
          <p className="text-slate-600 text-base">
            Profissionais altamente capacitados, produtos de alta qualidade e ambiente climatizado com total conforto.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Scissors className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 fill-white" />
                    <span>Mais Pedido</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 border border-slate-200 shadow-xs">
                  {service.category}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-amber-700 transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Duration & Price */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>⏱ {service.durationMinutes} min</span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-serif font-bold text-amber-700">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectService(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Este Serviço</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
