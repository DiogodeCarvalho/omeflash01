import { useState, useEffect } from 'react';
import { Film, CreditCard, Shield } from 'lucide-react';
import { AdminUser } from './types.ts';
import { getMeApi, logoutApi, getAuthToken } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { PublicHome } from './components/PublicHome.tsx';
import { PublicPlans } from './components/PublicPlans.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Sincroniza navegação com a barra de endereços do navegador (History API)
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Verifica token salvo no backend ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setAdminUser(null);
        setAuthChecking(false);
        return;
      }

      try {
        const res = await getMeApi();
        setAdminUser(res?.user || null);
      } catch (err) {
        console.warn('Sessão administrativa expirada ou inválida:', err);
        setAdminUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error('Erro ao efetuar logout:', e);
    } finally {
      setAdminUser(null);
      navigate('/');
    }
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex flex-col font-sans selection:bg-[#FF6A00] selection:text-white">
      {/* Barra de Navegação Superior OmeFlash */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        adminUser={adminUser}
        onLogout={handleLogout}
        onStartChat={() => {
          if (currentPath !== '/') {
            navigate('/');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Conteúdo baseado na rota */}
      <div className="flex-1 flex flex-col">
        {isAdminRoute ? (
          authChecking ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-4" />
              <p className="text-xs text-[#646464] font-medium">Verificando credenciais administrativas...</p>
            </div>
          ) : adminUser ? (
            <AdminPanel
              adminUser={adminUser}
              onNavigateHome={() => navigate('/')}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={(user) => {
                setAdminUser(user);
                navigate('/admin');
              }}
              onNavigateHome={() => navigate('/')}
            />
          )
        ) : currentPath === '/planos' ? (
          <PublicPlans
            onNavigateHome={() => navigate('/')}
            onNavigateToAdmin={() => navigate('/admin')}
          />
        ) : (
          <PublicHome
            onNavigateToAdmin={() => navigate('/admin')}
            onNavigateToPlans={() => navigate('/planos')}
          />
        )}
      </div>

      {/* Mobile Bottom Tab Bar OmeFlash (Ergonomia mobile touch) */}
      {!isAdminRoute && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-[#F8F7F4]/95 backdrop-blur-md border-t border-[#E8E5DD] grid grid-cols-3 items-center h-16 px-4 pb-safe shadow-xs">
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentPath === '/' ? 'text-[#FF6A00] font-bold' : 'text-[#646464] hover:text-[#171717]'
            }`}
          >
            <Film className="h-5 w-5" />
            <span className="text-[10px] tracking-tight mt-1">Conversas</span>
          </button>

          <button
            onClick={() => navigate('/planos')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentPath === '/planos' ? 'text-[#FF6A00] font-bold' : 'text-[#646464] hover:text-[#171717]'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] tracking-tight mt-1">Passe VIP</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentPath === '/admin' ? 'text-[#FF6A00] font-bold' : 'text-[#646464] hover:text-[#171717]'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span className="text-[10px] tracking-tight mt-1">Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}
