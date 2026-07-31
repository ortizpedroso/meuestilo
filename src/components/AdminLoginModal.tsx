import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456' || password === 'admin' || password.length > 0) {
      onLoginSuccess();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta. Tente 123456 ou clique no botão de acesso rápido.');
    }
  };

  const handleDemoAccess = () => {
    onLoginSuccess();
    setPassword('');
    setError('');
  };

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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Painel do Proprietário</h3>
          <p className="text-xs text-slate-500">
            Acesso restrito para gestão de serviços, agenda, profissionais e receita.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Senha de Acesso Admin</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Sua senha ou PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1A1A1A] hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center space-y-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Modo de Demonstração Comercial
          </span>
          <button
            onClick={handleDemoAccess}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Entrar Direto com Acesso Rápido</span>
          </button>
        </div>

      </div>
    </div>
  );
};
