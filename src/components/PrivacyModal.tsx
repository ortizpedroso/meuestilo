import React from 'react';
import { X, Shield } from 'lucide-react';
import { SalonSettings } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SalonSettings;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100"
          aria-label="Fechar política de privacidade"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-600" aria-hidden />
          <h2 id="privacy-title" className="text-lg font-bold text-slate-900">
            Política de Privacidade
          </h2>
        </div>

        <div className="prose prose-sm text-slate-600 space-y-3 text-sm leading-relaxed">
          <p>
            <strong>{settings.name}</strong> utiliza esta plataforma de agendamento para facilitar a
            marcação de horários. Ao agendar, você informa dados como nome, telefone e, opcionalmente,
            e-mail.
          </p>
          <p>
            <strong>Finalidade:</strong> os dados são usados exclusivamente para gestão de agendamentos,
            confirmações, lembretes e atendimento ao cliente.
          </p>
          <p>
            <strong>Armazenamento:</strong> as informações ficam em banco de dados seguro (MySQL) no
            servidor do salão. Não vendemos nem compartilhamos seus dados com terceiros para marketing.
          </p>
          <p>
            <strong>Seus direitos (LGPD):</strong> você pode solicitar acesso, correção ou exclusão dos
            seus dados entrando em contato pelo WhatsApp ou e-mail informados no site.
          </p>
          <p>
            <strong>Cookies:</strong> utilizamos apenas armazenamento local essencial (ex.: sessão do
            administrador e preferência de consentimento). Não usamos cookies de rastreamento publicitário.
          </p>
          <p className="text-xs text-slate-400 pt-2">
            Última atualização: agosto de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

const CONSENT_KEY = 'ag_salao_privacy_consent';

export function hasPrivacyConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1';
  } catch {
    return true;
  }
}

export function setPrivacyConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, '1');
  } catch {
    /* ignore */
  }
}

interface PrivacyBannerProps {
  onOpenPrivacy: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onOpenPrivacy }) => {
  const [visible, setVisible] = React.useState(() => !hasPrivacyConsent());

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de privacidade"
      className="fixed bottom-0 inset-x-0 z-[90] bg-slate-900 text-white px-4 py-3 shadow-lg border-t border-slate-700"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-slate-300 text-center sm:text-left">
          Usamos seus dados apenas para agendamentos e atendimento.{' '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="underline text-amber-400 hover:text-amber-300 font-semibold"
          >
            Política de Privacidade
          </button>
        </p>
        <button
          type="button"
          onClick={() => {
            setPrivacyConsent();
            setVisible(false);
          }}
          className="shrink-0 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};
