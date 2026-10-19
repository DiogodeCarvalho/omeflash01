import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Loader2, ArrowRight, Shield, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { authModalOpen, authModalTab, closeAuthModal, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync tab with context if opened
  React.useEffect(() => {
    setActiveTab(authModalTab);
    setError(null);
  }, [authModalTab, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      closeAuthModal();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setActiveTab('login');
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="p-6 pt-8 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/20">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-6 h-6"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            <span className="text-[#FF5500]">Ome</span>Flash
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {activeTab === 'login'
              ? 'Entre com sua conta para acessar o catálogo'
              : 'Cadastre-se para começar a assistir'}
          </p>

          {/* Quick Test Demo Accounts Toolbar */}
          <div className="mt-4 p-2.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl text-left">
            <p className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <span>⚡ Contas de Teste Pré-Configuradas:</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin@omeflash.com', 'admin123')}
                className="px-2 py-1 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-[10px] font-bold text-purple-700 flex items-center justify-center gap-1 transition-all"
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('vip@omeflash.com', 'vip123')}
                className="px-2 py-1 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-700 flex items-center justify-center gap-1 transition-all"
              >
                <Crown className="w-3 h-3" />
                VIP Ativo
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('user@omeflash.com', 'user123')}
                className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 flex items-center justify-center gap-1 transition-all"
              >
                <UserIcon className="w-3 h-3" />
                Comum
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/30 focus:border-[#FF5500]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/30 focus:border-[#FF5500]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/30 focus:border-[#FF5500]"
              />
            </div>
            {activeTab === 'register' && (
              <p className="text-[11px] text-gray-400 mt-1">Mínimo de 6 caracteres</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF5500] hover:bg-[#e44d00] active:scale-[0.98] disabled:opacity-70 text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Entrar' : 'Cadastrar e Continuar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
