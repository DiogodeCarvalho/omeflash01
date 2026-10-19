import React, { useState } from 'react';
import { Video, Menu, X, Crown, User as UserIcon, Shield, Sparkles, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'home' | 'catalog' | 'plans' | 'admin';
  setCurrentTab: (tab: 'home' | 'catalog' | 'plans' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isVip, logout, openAuthModal, openPlansModal, openStripeGuide } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (tab: 'home' | 'catalog' | 'plans' | 'admin') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo matching the user's reference image */}
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF5500] flex items-center justify-center text-white shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
              {/* Camera icon with smooth rounded geometry matching reference */}
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <div className="text-2xl font-black tracking-tight leading-none">
              <span className="text-[#FF5500]">Ome</span>
              <span className="text-gray-900">Flash</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNav('home')}
              className={`text-sm font-semibold transition-colors ${
                currentTab === 'home' ? 'text-[#FF5500]' : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNav('catalog')}
              className={`text-sm font-semibold transition-colors ${
                currentTab === 'catalog' ? 'text-[#FF5500]' : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Catálogo de Vídeos
            </button>
            <button
              onClick={() => handleNav('plans')}
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'plans' ? 'text-[#FF5500]' : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              <Crown className="w-4 h-4 text-[#FF5500]" />
              Planos VIP
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`text-sm font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors ${
                  currentTab === 'admin' ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Painel Admin
              </button>
            )}
            <button
              onClick={openStripeGuide}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors"
            >
              Configurar Stripe
            </button>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isVip && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span>ASSINANTE VIP</span>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-gray-300 transition-all text-sm font-medium text-gray-800"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5500] font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${isVip ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-600">
                          {isVip ? 'Assinatura VIP Ativa' : 'Sem assinatura ativa'}
                        </span>
                      </div>
                    </div>

                    {!isVip && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openPlansModal();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#FF5500] font-semibold hover:bg-orange-50 flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        Assinar VIP Agora
                      </button>
                    )}

                    {isVip && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNav('plans');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        Gerenciar Assinatura
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNav('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Painel de Controle
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-950 px-3 py-2"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="text-sm font-semibold text-white bg-[#FF5500] hover:bg-[#e04b00] px-4 py-2 rounded-full shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02]"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button matching image */}
          <div className="flex md:hidden items-center gap-2">
            {isVip && (
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 hover:text-black rounded-lg focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          {user && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isVip ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>
                  {isVip ? '⭐ VIP Ativo' : 'Plano Grátis'}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-semibold p-2"
              >
                Sair
              </button>
            </div>
          )}

          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold ${
              currentTab === 'home' ? 'bg-orange-50 text-[#FF5500]' : 'text-gray-800'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => handleNav('catalog')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold ${
              currentTab === 'catalog' ? 'bg-orange-50 text-[#FF5500]' : 'text-gray-800'
            }`}
          >
            Catálogo de Vídeos
          </button>
          <button
            onClick={() => handleNav('plans')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold flex items-center justify-between ${
              currentTab === 'plans' ? 'bg-orange-50 text-[#FF5500]' : 'text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FF5500]" />
              Planos de Assinatura
            </span>
            <span className="text-xs bg-[#FF5500] text-white px-2 py-0.5 rounded-full font-bold">
              VIP
            </span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-purple-700 bg-purple-50 flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Painel Administrativo
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openStripeGuide();
            }}
            className="w-full text-left py-2 px-3 text-sm text-gray-500 font-medium"
          >
            Guia de Integração Stripe
          </button>

          <div className="pt-2 border-t border-gray-100">
            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 border border-gray-300 rounded-xl text-center text-sm font-bold text-gray-800"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full py-2.5 bg-[#FF5500] text-white rounded-xl text-center text-sm font-bold"
                >
                  Criar Conta
                </button>
              </div>
            ) : !isVip ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openPlansModal();
                }}
                className="w-full py-3 bg-[#FF5500] text-white rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Crown className="w-4 h-4" />
                Assinar Plano VIP
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
