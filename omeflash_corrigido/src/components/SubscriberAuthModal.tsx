import React, { useState } from 'react';
import { X, User, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { SubscriberUser, Subscription } from '../types';
import { api } from '../lib/api';

interface SubscriberAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: SubscriberUser, subscription?: Subscription | null) => void;
  initialMode?: 'login' | 'register';
}

export const SubscriberAuthModal: React.FC<SubscriberAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.subscriberLogin(email, password);
        onSuccess(res.user, res.subscription);
      } else {
        const res = await api.subscriberRegister(name, email, password);
        onSuccess(res.user, res.subscription);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('cliente@omeflash.com');
    setPassword('senha123');
    setMode('login');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-[#8E8E8E] hover:text-[#171717] hover:bg-[#F8F7F4] transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-none mb-1.5">
            <span className="text-[#FF6A00]">Ome</span>
            <span className="text-[#171717]">Flash</span>
          </div>
          <h2 className="text-lg font-bold text-[#171717]">
            {mode === 'login' ? 'Acessar Conta de Assinante' : 'Criar Nova Conta'}
          </h2>
          <p className="text-xs text-[#646464] mt-0.5">
            {mode === 'login'
              ? 'Entre com suas credenciais para gerenciar sua assinatura e acessar todos os vídeos.'
              : 'Cadastre-se para aproveitar o catálogo VIP e transmissões sem restrições.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#646464] hover:text-[#171717]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#646464] hover:text-[#171717]'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Seu Nome</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Diogo Silva"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs sm:text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
                />
                <User className="w-4 h-4 text-[#8E8E8E] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs sm:text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              />
              <Mail className="w-4 h-4 text-[#8E8E8E] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs sm:text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              />
              <Lock className="w-4 h-4 text-[#8E8E8E] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[46px] py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#E55F00] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar na Conta' : 'Concluir Cadastro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill for easy testing */}
        <div className="mt-5 pt-4 border-t border-[#F0EEE9] text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF2E8] hover:bg-[#FFE6D5] text-[#FF6A00] text-[11px] font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preencher conta de teste (cliente@omeflash.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
