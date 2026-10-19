import React, { useState } from 'react';
import { Video, Shield, LogOut, LayoutDashboard, Menu, X, Crown, User, Sparkles } from 'lucide-react';
import { AdminUser, SubscriberUser } from '../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  adminUser: AdminUser | null;
  subscriberUser: SubscriberUser | null;
  onOpenAdminLogin: () => void;
  onOpenSubscriberAuth: () => void;
  onOpenSubscriberAccount: () => void;
  onAdminLogout: () => void;
  onSubscriberLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  adminUser,
  subscriberUser,
  onOpenAdminLogin,
  onOpenSubscriberAuth,
  onOpenSubscriberAccount,
  onAdminLogout,
  onSubscriberLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentPath === '/' || currentPath === '';
  const isPlans = currentPath === '/planos';
  const isAdmin = currentPath === '/admin';
  const isSubscribed = subscriberUser?.subscription?.status === 'active';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-[#E8E6E1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo with strict rule: "Ome" in orange #FF6A00, "Flash" in black #171717 */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Video className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-none">
              <span className="text-[#FF6A00]">Ome</span>
              <span className="text-[#171717]">Flash</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
            <button
              onClick={() => onNavigate('/')}
              className={`transition-colors cursor-pointer py-1 ${
                isHome
                  ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => {
                onNavigate('/');
                setTimeout(() => {
                  document.getElementById('experiencia-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-[#646464] hover:text-[#171717] transition-colors cursor-pointer py-1"
            >
              Como Funciona
            </button>
            <button
              onClick={() => {
                onNavigate('/');
                setTimeout(() => {
                  document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-[#646464] hover:text-[#171717] transition-colors cursor-pointer py-1"
            >
              Catálogo de Vídeos
            </button>
            <button
              onClick={() => onNavigate('/planos')}
              className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                isPlans
                  ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Planos VIP</span>
            </button>
          </nav>

          {/* Right Action: Subscriber & Admin Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Subscriber Status / Login Button */}
            {subscriberUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSubscriberAccount}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8F7F4] hover:bg-[#E8E6E1] text-[#171717] border border-[#E8E6E1] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-[11px] font-bold">
                    {subscriberUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight truncate max-w-[100px]">{subscriberUser.name}</span>
                    {isSubscribed ? (
                      <span className="text-[10px] text-[#FF6A00] font-extrabold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> VIP Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8E8E8E]">Minha Conta</span>
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSubscriberAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#171717] bg-[#F8F7F4] hover:bg-[#E8E6E1] border border-[#E8E6E1] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#646464]" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}

            {/* Admin Area */}
            {adminUser ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E8E6E1]">
                <button
                  onClick={() => onNavigate('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#171717]/5 hover:bg-[#171717]/10 text-[#171717]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Painel Admin
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sair do modo administrador"
                  className="p-2 text-[#646464] hover:text-[#171717] hover:bg-[#F8F7F4] rounded-lg transition-colors cursor-pointer"
                  aria-label="Sair do painel administrativo"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1 px-2.5 py-2 text-xs text-[#8E8E8E] hover:text-[#171717] transition-colors cursor-pointer"
                title="Acesso da equipe de administração"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px]">Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {subscriberUser && (
              <button
                onClick={onOpenSubscriberAccount}
                className="w-8 h-8 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-xs font-bold"
                aria-label="Minha conta"
              >
                {subscriberUser.name.slice(0, 1).toUpperCase()}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#171717] rounded-lg hover:bg-[#F8F7F4] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E8E6E1] px-4 py-3 space-y-1 shadow-md animate-fade-in">
          <button
            onClick={() => {
              onNavigate('/');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
              isHome ? 'bg-[#FFF2E8] text-[#FF6A00]' : 'text-[#171717] hover:bg-[#F8F7F4]'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('experiencia-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold text-[#171717] hover:bg-[#F8F7F4]"
          >
            Como Funciona
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold text-[#171717] hover:bg-[#F8F7F4]"
          >
            Catálogo de Vídeos
          </button>
          <button
            onClick={() => {
              onNavigate('/planos');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
              isPlans ? 'bg-[#FFF2E8] text-[#FF6A00]' : 'text-[#171717] hover:bg-[#F8F7F4]'
            }`}
          >
            <span>Planos VIP</span>
            <Crown className="w-4 h-4 text-[#FF6A00]" />
          </button>

          {/* Subscriber section in Mobile */}
          <div className="pt-2 border-t border-[#E8E6E1] mt-2 space-y-2">
            {subscriberUser ? (
              <div className="p-3 bg-[#F8F7F4] rounded-2xl border border-[#E8E6E1] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#171717]">{subscriberUser.name}</div>
                    <div className="text-[11px] text-[#646464]">{subscriberUser.email}</div>
                  </div>
                  {isSubscribed && (
                    <span className="text-[10px] font-extrabold bg-[#FFF2E8] text-[#FF6A00] px-2 py-0.5 rounded border border-[#FF6A00]/20">
                      VIP Ativo
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenSubscriberAccount();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-center text-xs font-bold bg-[#171717] text-white rounded-xl"
                  >
                    Minha Assinatura
                  </button>
                  <button
                    onClick={() => {
                      onSubscriberLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-center text-xs font-bold text-[#646464] hover:text-red-600 bg-white border border-[#E8E6E1] rounded-xl"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenSubscriberAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm transition-colors shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Entrar ou Cadastrar</span>
              </button>
            )}

            {/* Admin link in mobile */}
            {adminUser ? (
              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white font-bold text-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FF6A00]" />
                <span>Acessar Painel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[#8E8E8E] hover:text-[#171717]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Acesso Administrativo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
