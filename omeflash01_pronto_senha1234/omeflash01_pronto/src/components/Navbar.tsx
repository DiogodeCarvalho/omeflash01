import React from 'react';
import { Zap, Shield, LogOut, ArrowLeft, CreditCard } from 'lucide-react';
import { AdminUser } from '../types.ts';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  adminUser: AdminUser | null;
  onLogout: () => void;
  onStartChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  adminUser,
  onLogout,
  onStartChat,
}) => {
  const isAdminArea = currentPath.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E5DD] bg-[#F8F7F4]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Ome em laranja, Flash em preto) */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 text-left transition hover:opacity-90 active:scale-95 shrink-0"
          aria-label="Página Inicial OmeFlash"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A00] text-white shadow-sm shadow-[#FF6A00]/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight font-sans select-none">
              <span className="text-[#FF6A00]">Ome</span>
              <span className="text-[#171717]">Flash</span>
            </span>
            {isAdminArea && (
              <span className="inline-flex items-center rounded-md bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        {!isAdminArea ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#646464]">
            <button
              onClick={() => onNavigate('/')}
              className={`whitespace-nowrap transition-colors py-1 ${
                currentPath === '/' 
                  ? 'text-[#171717] font-semibold border-b-2 border-[#FF6A00]' 
                  : 'hover:text-[#171717]'
              }`}
            >
              Início
            </button>
            <a
              href="#conversas"
              onClick={(e) => {
                if (currentPath !== '/') {
                  e.preventDefault();
                  onNavigate('/');
                  setTimeout(() => {
                    document.getElementById('conversas')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="whitespace-nowrap transition-colors py-1 hover:text-[#171717]"
            >
              Conversas Gravadas
            </a>
            <button
              onClick={() => onNavigate('/planos')}
              className={`whitespace-nowrap transition-colors py-1 ${
                currentPath === '/planos' 
                  ? 'text-[#171717] font-semibold border-b-2 border-[#FF6A00]' 
                  : 'hover:text-[#171717]'
              }`}
            >
              Planos & VIP
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center text-xs text-[#646464] font-medium">
            Painel Administrativo da Plataforma
          </div>
        )}

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminArea ? (
            adminUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right pr-1">
                  <div className="text-xs font-semibold text-[#171717] truncate max-w-[140px]">{adminUser.name}</div>
                  <div className="text-[10px] text-[#646464] font-mono truncate max-w-[140px]">{adminUser.email}</div>
                </div>

                <button
                  onClick={() => onNavigate('/')}
                  className="flex items-center gap-1.5 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F2EFE9] transition active:scale-95 shadow-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#646464]" />
                  <span className="hidden sm:inline">Ver Site</span>
                  <span className="sm:hidden">Site</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3 py-2 text-xs font-medium text-[#646464] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition active:scale-95 shadow-xs"
                  title="Encerrar sessão"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/')}
                className="flex items-center gap-1.5 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F2EFE9] transition active:scale-95 shadow-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ao site</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onStartChat || (() => onNavigate('/'))}
                className="flex items-center gap-2 min-h-[44px] rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-white px-4 sm:px-5 py-2 text-xs font-bold tracking-wide shadow-sm shadow-[#FF6A00]/25 transition-all duration-200 active:scale-95"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Conversar</span>
              </button>

              <button
                onClick={() => onNavigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white hover:bg-[#F2EFE9] text-[#171717] px-3.5 py-2 text-xs font-medium transition active:scale-95 shadow-xs"
                title="Acesso administrativo"
              >
                <Shield className="h-3.5 w-3.5 text-[#646464]" />
                <span>Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
