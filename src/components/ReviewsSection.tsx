import React, { useState } from 'react';
import { Review } from '../types';
import { formatDateBR } from '../utils/formatters';
import { Star, MessageSquarePlus, CheckCircle2, ThumbsUp, X } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void> | void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  averageRating,
  totalReviews,
  onAddReview
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [serviceName, setServiceName] = useState('Corte / Barba');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) return;

    try {
      await onAddReview({
        clientName: clientName.trim(),
        rating,
        comment: comment.trim(),
        serviceName,
        verifiedBooking: true
      });
    } catch (err) {
      alert('Não foi possível enviar a avaliação: ' + (err instanceof Error ? err.message : 'erro'));
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setClientName('');
      setComment('');
      setRating(5);
    }, 1500);
  };

  return (
    <section className="py-16 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Depoimentos & Avaliações</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Transparência e excelência comprovadas por quem frequenta o Meu Stilo.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex items-center space-x-6 bg-[#F9F7F5] p-4 rounded-2xl border border-slate-200 shrink-0 shadow-xs">
            <div className="text-center border-r border-slate-200 pr-6">
              <span className="text-4xl font-serif font-extrabold text-amber-700 block">{averageRating.toFixed(1)}</span>
              <div className="flex items-center text-amber-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">{totalReviews} opiniões</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Avaliar Atendimento</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors shadow-xs"
            >
              <div className="space-y-2">
                {/* Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{formatDateBR(rev.date)}</span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Service */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-900">{rev.clientName}</span>
                    {rev.verifiedBooking && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Cliente Verificado" />
                    )}
                  </div>
                  {rev.serviceName && (
                    <span className="text-[10px] text-slate-500 font-medium block">{rev.serviceName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 relative shadow-2xl text-slate-900">
            
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900">Avaliação Enviada!</h3>
                <p className="text-xs text-slate-500">Muito obrigado pelo seu feedback. Ele ajuda o Meu Stilo a evoluir!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-[#1A1A1A]">Deixar uma Avaliação</h3>
                  <p className="text-xs text-slate-500">Como foi sua experiência no Meu Stilo?</p>
                </div>

                {/* Star Selector */}
                <div className="flex justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Inputs */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Ana Clara"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Serviço Realizado</label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="Corte Masculino">Corte Masculino</option>
                    <option value="Corte Feminino">Corte Feminino</option>
                    <option value="Escova Modeladora">Escova Modeladora</option>
                    <option value="Progressiva Orgânica">Progressiva Orgânica</option>
                    <option value="Barba com Toalha Quente">Barba com Toalha Quente</option>
                    <option value="Manicure Completa">Manicure Completa</option>
                    <option value="Pedicure Completa">Pedicure Completa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seu Comentário</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte o que achou do atendimento, pontualidade e ambiente..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Publicar Avaliação
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
