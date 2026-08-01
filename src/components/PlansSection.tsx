import React, { useState, useRef, useEffect } from 'react';
import { SalonSettings, Subscription } from '../types';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  CheckCircle2,
  X,
  CalendarClock,
  LayoutDashboard,
  Users,
  MessageCircle,
  Star,
  Palette,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react';

interface PlansSectionProps {
  settings: SalonSettings;
  mpPublicKey?: string;
  onSubscribed: (sub: Subscription) => void;
}

const FEATURES = [
  { icon: CalendarClock, title: 'Agendamento Online 24h', desc: 'Clientes marcam sozinhos, sem filas nem telefone.' },
  { icon: LayoutDashboard, title: 'Painel de Gestão Completo', desc: 'Agenda, serviços, profissionais e faturamento em um só lugar.' },
  { icon: Users, title: 'Base de Clientes', desc: 'Histórico de visitas e total gasto por cliente automaticamente.' },
  { icon: MessageCircle, title: 'Lembretes no WhatsApp', desc: 'Confirmações e lembretes com um clique para reduzir faltas.' },
  { icon: Star, title: 'Avaliações Verificadas', desc: 'Colete depoimentos e exiba sua reputação no site.' },
  { icon: Palette, title: 'Marca Personalizada (White-label)', desc: 'Seu nome, logo, cores e identidade — o sistema é a sua cara.' },
  { icon: BarChart3, title: 'Relatórios de Faturamento', desc: 'Acompanhe receita do dia e acumulada em tempo real.' },
  { icon: ShieldCheck, title: 'Área Administrativa Protegida', desc: 'Acesso restrito ao proprietário por senha.' }
];

let mpSdkPromise: Promise<void> | null = null;
function loadMpSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve();
  if (mpSdkPromise) return mpSdkPromise;
  mpSdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://sdk.mercadopago.com/js/v2';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar o SDK do Mercado Pago.'));
    document.head.appendChild(s);
  });
  return mpSdkPromise;
}

type Step = 'form' | 'card' | 'done';

export const PlansSection: React.FC<PlansSectionProps> = ({ settings, mpPublicKey, onSubscribed }) => {
  const plan = settings.subscriptionPlan;
  const price = plan?.priceMonthly || 89.9;
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [holderName, setHolderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salonName, setSalonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // guarda os dados de contato para o callback do brick (closure sempre atual)
  const contactRef = useRef({ holderName: '', email: '', phone: '', salonName: '' });
  const brickRef = useRef<{ unmount: () => void } | null>(null);

  const resetAndClose = () => {
    if (brickRef.current) { try { brickRef.current.unmount(); } catch { /* ignore */ } brickRef.current = null; }
    setIsOpen(false);
    setStep('form');
    setHolderName(''); setEmail(''); setPhone(''); setSalonName('');
    setError(''); setSuccessMsg(''); setLoading(false);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim() || !email.trim()) {
      setError('Informe seu nome e e-mail.');
      return;
    }
    setError('');
    contactRef.current = { holderName: holderName.trim(), email: email.trim(), phone: phone.trim(), salonName: salonName.trim() };

    if (!mpPublicKey) {
      // Fallback: sem MP configurado, apenas registra a assinatura (pending)
      setLoading(true);
      try {
        const res = await api.createSubscription({
          plan: plan?.name || 'Pro', holderName: holderName.trim(), email: email.trim(),
          phone: phone.trim(), salonName: salonName.trim(), price
        });
        onSubscribed(res.subscription);
        if (res.checkoutUrl) { window.location.href = res.checkoutUrl; return; }
        setSuccessMsg('Recebemos sua solicitação. Em breve entraremos em contato para concluir o pagamento.');
        setStep('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível registrar a assinatura.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep('card');
  };

  // Monta o Brick de cartão quando entra no passo de pagamento
  useEffect(() => {
    if (step !== 'card' || !mpPublicKey) return;
    let cancelled = false;
    setError('');
    loadMpSdk()
      .then(async () => {
        if (cancelled) return;
        const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
        const bricks = mp.bricks();
        brickRef.current = await bricks.create('cardPayment', 'ag-card-brick', {
          initialization: { amount: price, payer: { email: contactRef.current.email } },
          customization: { paymentMethods: { maxInstallments: 1 } },
          callbacks: {
            onReady: () => {},
            onError: (err: unknown) => {
              setError('Erro no formulário de pagamento. Verifique os dados do cartão.');
              // eslint-disable-next-line no-console
              console.error(err);
            },
            onSubmit: (formData: any) => {
              setLoading(true);
              setError('');
              const c = contactRef.current;
              return api
                .createOrder({
                  token: formData.token,
                  paymentMethodId: formData.payment_method_id,
                  paymentType: 'credit_card',
                  installments: formData.installments || 1,
                  price,
                  plan: plan?.name || 'Pro',
                  holderName: c.holderName,
                  firstName: c.holderName.split(' ')[0] || c.holderName,
                  lastName: c.holderName.split(' ').slice(1).join(' ') || '.',
                  docType: formData.payer?.identification?.type || 'CPF',
                  docNumber: formData.payer?.identification?.number || '',
                  payerEmail: formData.payer?.email || c.email,
                  phone: c.phone,
                  salonName: c.salonName
                })
                .then((res) => {
                  setLoading(false);
                  if (res.approved) {
                    onSubscribed(res.subscription);
                    setSuccessMsg('Pagamento aprovado! Sua assinatura está ativa.');
                    setStep('done');
                  } else {
                    setError(res.error || 'Pagamento não aprovado. Tente outro cartão.');
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  setError(err instanceof Error ? err.message : 'Falha ao processar o pagamento.');
                });
            }
          }
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar o pagamento.'));

    return () => {
      cancelled = true;
      if (brickRef.current) { try { brickRef.current.unmount(); } catch { /* ignore */ } brickRef.current = null; }
    };
  }, [step, mpPublicKey, price, plan, onSubscribed]);

  return (
    <section id="planos" className="py-16 bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma SaaS para Salões & Barbearias</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tenha um sistema de agendamento completo
          </h2>
          <p className="text-sm text-zinc-400">
            Tudo que o seu salão precisa para agendar, gerenciar e crescer — com a sua marca.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{f.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 space-y-5">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{plan?.name || 'Plano Pro'}</span>
              <div className="mt-2 flex items-end space-x-1">
                <span className="text-4xl font-extrabold text-white">{formatCurrency(price)}</span>
                <span className="text-sm text-zinc-400 mb-1">/mês</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Sem fidelidade. Cancele quando quiser.</p>
            </div>

            <ul className="space-y-2">
              {['Agendamentos ilimitados', 'Profissionais ilimitados', 'White-label (sua marca)', 'Integração WhatsApp', 'Suporte incluso'].map((item) => (
                <li key={item} className="flex items-center space-x-2 text-sm text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setIsOpen(true)}
              className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Contratar Assinatura</span>
            </button>
            <p className="text-[11px] text-center text-zinc-500 flex items-center justify-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Pagamento seguro via Mercado Pago</span>
            </p>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 relative shadow-2xl my-auto">
            <button onClick={resetAndClose} aria-label="Fechar" className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100">
              <X className="w-5 h-5" />
            </button>

            {step === 'done' ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900">Tudo certo!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">{successMsg}</p>
                <button onClick={resetAndClose} className="mt-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs transition-colors">
                  Concluir
                </button>
              </div>
            ) : step === 'card' ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-[#1A1A1A]">Pagamento — {plan?.name || 'Plano Pro'}</h3>
                  <p className="text-xs text-slate-500">{formatCurrency(price)}/mês · pagamento no site</p>
                </div>
                <div id="ag-card-brick" />
                {loading && (
                  <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" /> <span>Processando pagamento...</span>
                  </div>
                )}
                {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
                <button onClick={() => setStep('form')} className="w-full py-2 text-xs text-slate-500 hover:text-slate-800">Voltar</button>
              </div>
            ) : (
              <form onSubmit={handleContinue} className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-[#1A1A1A]">Contratar {plan?.name || 'Plano Pro'}</h3>
                  <p className="text-xs text-slate-500">{formatCurrency(price)}/mês — preencha para continuar.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seu Nome *</label>
                  <input type="text" required value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nome do Salão</label>
                  <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp / Telefone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-600" />
                </div>

                {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors">
                  {loading ? 'Enviando...' : mpPublicKey ? 'Continuar para pagamento' : 'Confirmar Contratação'}
                </button>
                <p className="text-[11px] text-center text-slate-400">Sem fidelidade. Cancele quando quiser.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
