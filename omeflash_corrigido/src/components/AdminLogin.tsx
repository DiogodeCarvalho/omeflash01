import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Safeguard: Read both state and FormData to ensure autofill is captured
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const rawEmail = (formData.get('email') as string) || email;
    const rawPassword = (formData.get('password') as string) || password;

    const trimmedEmail = (rawEmail || '').trim();
    const trimmedPassword = (rawPassword || '').trim();

    // Required fields validation
    if (!trimmedEmail || !trimmedPassword) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await api.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      setSuccessMessage('Acesso autorizado! Redirecionando...');
      setTimeout(() => {
        onSuccess(result.user);
        onClose();
      }, 350);
    } catch (err: any) {
      console.error('Falha no login:', err);
      const msg = err?.message || 'Erro ao realizar login. Verifique suas credenciais.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@omeflash.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white border border-[#E8E6E1] rounded-3xl p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#646464] hover:text-[#171717] hover:bg-[#F8F7F4] transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with OmeFlash Brand Identity */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight font-['Plus_Jakarta_Sans']">
            Acesso <span className="text-[#FF6A00]">Ome</span>Flash
          </h2>
          <p className="text-[#646464] text-xs sm:text-sm mt-1">
            Entre com as credenciais administrativas da plataforma.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#171717] mb-1">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E8E]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="admin@omeflash.com"
                required
                className="w-full pl-10 pr-3.5 py-3 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] placeholder-[#8E8E8E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#171717] mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E8E]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-3 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] placeholder-[#8E8E8E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E8E8E] hover:text-[#171717] cursor-pointer min-h-[44px] min-w-[40px] justify-center"
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Test Fill */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-[#FF6A00] hover:text-[#E55F00] font-bold cursor-pointer py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Preencher dados de teste
            </button>
            <span className="text-[11px] text-[#8E8E8E] font-mono">admin123</span>
          </div>

          {/* Submit Button (Orange #FF6A00) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#E55F00] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#F0EEE9] text-center text-[#8E8E8E] text-xs">
          Acesso exclusivo para administradores
        </div>
      </div>
    </div>
  );
};
