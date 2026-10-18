import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { loginApi, setAuthToken } from '../lib/api.ts';
import { AdminUser } from '../types.ts';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(email.trim(), password);
      setAuthToken(res.token, rememberMe);
      onLoginSuccess(res.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação do administrador.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@vortexstream.com');
    setPassword('admin123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6A00] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#646464] hover:text-[#171717] mb-6 transition active:scale-95 min-h-[40px] px-3.5 rounded-xl border border-[#E8E5DD] bg-white shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF6A00]" />
          <span>Voltar ao site público</span>
        </button>

        <div className="text-center space-y-2">
          {/* Logo OmeFlash */}
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/25">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight select-none">
              <span className="text-[#FF6A00]">Ome</span>
              <span className="text-[#171717]">Flash</span>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#171717]">
            Acesso Administrativo
          </h2>
          <p className="text-xs sm:text-sm text-[#646464]">
            Entre com suas credenciais seguras para gerenciar o acervo e planos.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-[#E8E5DD] bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed whitespace-pre-line">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-[#8E8E8E]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vortexstream.com"
                  className="block w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white pl-10 pr-3 text-sm text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-[#8E8E8E]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white pl-10 pr-11 text-sm text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8E8E8E] hover:text-[#171717] transition"
                  aria-label="Alternar exibição de senha"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#646464]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E8E5DD] text-[#FF6A00] focus:ring-[#FF6A00] focus:ring-offset-0"
                />
                <span>Lembrar neste navegador</span>
              </label>
              <span className="text-[#8E8E8E] text-[11px]">Área restrita</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-2xl bg-[#FF6A00] hover:bg-[#E65F00] text-xs font-bold text-white shadow-md shadow-[#FF6A00]/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="h-4 w-4" />
              <span>{loading ? 'Validando acesso...' : 'Acessar Painel'}</span>
            </button>
          </form>

          {/* Helper rápido de credenciais padrão */}
          <div className="mt-6 pt-5 border-t border-[#E8E5DD]">
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full min-h-[40px] flex items-center justify-center gap-1.5 rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] text-xs font-semibold text-[#646464] hover:text-[#171717] hover:bg-[#EFECE5] transition active:scale-95 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FF6A00]" />
              <span>Preencher credenciais de administrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
