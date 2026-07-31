import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode, ExternalLink, MessageCircle } from 'lucide-react';
import { SalonSettings } from '../types';

interface ShareModalProps {
  settings: SalonSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ settings, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin + window.location.pathname;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Agende seu horário online no ${settings.name}! Clique no link para escolher o serviço e horário: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 relative shadow-2xl text-slate-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Compartilhar Salão</h3>
          <p className="text-xs text-slate-500">
            Divulgue seu link de agendamento em redes sociais ou imprima o QR Code para seu balcão.
          </p>
        </div>

        {/* QR Code Visual Mock */}
        <div className="bg-[#F9F7F5] border border-slate-200 p-6 rounded-2xl text-center mb-6 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 mb-3">
            {/* SVG QR Code Pattern */}
            <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white" />
              <path d="M10 10H40V40H10V10ZM20 20V30H30V20H20Z" fill="black" />
              <path d="M60 10H90V40H60V10ZM70 20V30H80V20H70Z" fill="black" />
              <path d="M10 60H40V90H10V60ZM20 70V80H30V70H20Z" fill="black" />
              <rect x="45" y="45" width="10" height="10" fill="black" />
              <rect x="60" y="60" width="15" height="15" fill="black" />
              <rect x="80" y="75" width="10" height="15" fill="black" />
              <rect x="50" y="20" width="5" height="20" fill="black" />
              <rect x="20" y="50" width="20" height="5" fill="black" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">QR Code oficial para balcão de atendimento</p>
        </div>

        {/* Direct Link Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">Link Direto de Agendamento</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1 shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Social buttons */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
