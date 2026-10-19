import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHome } from './components/PublicHome';
import { PublicPlans } from './components/PublicPlans';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SubscriberAuthModal } from './components/SubscriberAuthModal';
import { SubscriberAccountModal } from './components/SubscriberAccountModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { api } from './lib/api';
import { Video, Plan, AdminUser, AdminStats, SubscriberUser, Subscription } from './types';
import { Video as VideoIcon, Shield, Crown } from 'lucide-react';

export default function App() {
  // Sync view with browser path (/ , /planos , /admin)
  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/planos') return '/planos';
      if (path === '/admin') return '/admin';
      return '/';
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);

  // Subscriber state
  const [subscriberUser, setSubscriberUser] = useState<SubscriberUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriberAuthModalOpen, setSubscriberAuthModalOpen] = useState(false);
  const [subscriberAccountModalOpen, setSubscriberAccountModalOpen] = useState(false);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);

  // Video playback
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  // App data state
  const [videos, setVideos] = useState<Video[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberUser[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalVideos: 0,
    totalPlans: 0,
    totalViews: 0,
    premiumVideos: 0,
    totalSubscribers: 0,
    activeSubscriptions: 0,
    mrr: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Handle URL change
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setPlansError(null);

        // Fetch admin user
        const currentAdmin = api.getCurrentUser();
        if (currentAdmin) {
          setAdminUser(currentAdmin);
        }

        // Fetch subscriber user & subscription
        const currentSub = api.getCurrentSubscriber();
        if (currentSub) {
          setSubscriberUser(currentSub);
          setSubscription(currentSub.subscription || null);
        }

        // Fetch videos, plans, subscribers
        const [videosData, plansData, subscribersData] = await Promise.all([
          api.getVideos(),
          api.getPlans().catch((err) => {
            console.error('Erro ao carregar planos:', err);
            setPlansError('Não foi possível carregar os planos da API.');
            return [];
          }),
          api.getSubscribersForAdmin().catch(() => []),
        ]);

        setVideos(videosData);
        setPlans(plansData);
        setSubscribers(subscribersData);

        const statsData = await api.getStats();
        setStats(statsData);
      } catch (err) {
        console.error('Erro ao inicializar dados:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // If user navigates directly to /admin but is not authenticated, prompt login
  useEffect(() => {
    if (currentPath === '/admin' && !adminUser && !isLoading) {
      setAdminLoginModalOpen(true);
    }
  }, [currentPath, adminUser, isLoading]);

  // Update stats helper
  const refreshStats = async () => {
    try {
      const updated = await api.getStats();
      setStats(updated);
      const subs = await api.getSubscribersForAdmin();
      setSubscribers(subs);
    } catch (e) {
      console.error(e);
    }
  };

  // Video Handlers
  const handleSaveVideo = async (videoData: Omit<Video, 'id' | 'views'>, id?: string) => {
    if (id) {
      const updated = await api.updateVideo(id, videoData);
      setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } else {
      const created = await api.createVideo(videoData);
      setVideos((prev) => [created, ...prev]);
    }
    await refreshStats();
  };

  const handleDeleteVideo = async (id: string) => {
    await api.deleteVideo(id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
    await refreshStats();
  };

  // Plan Handlers
  const handleSavePlan = async (planData: Omit<Plan, 'id'>, id?: string) => {
    if (id) {
      const updated = await api.updatePlan(id, planData);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } else {
      const created = await api.createPlan(planData);
      setPlans((prev) => [...prev, created]);
    }
    await refreshStats();
  };

  const handleDeletePlan = async (id: string) => {
    await api.deletePlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    await refreshStats();
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setAdminLoginModalOpen(false);
    navigateTo('/admin');
  };

  const handleAdminLogout = () => {
    api.logout();
    setAdminUser(null);
    navigateTo('/');
  };

  // Subscriber Handlers
  const handleSubscriberAuthSuccess = (user: SubscriberUser, sub?: Subscription | null) => {
    setSubscriberUser(user);
    setSubscription(sub || user.subscription || null);
    setSubscriberAuthModalOpen(false);
  };

  const handleSubscriberLogout = () => {
    api.subscriberLogout();
    setSubscriberUser(null);
    setSubscription(null);
    setSubscriberAccountModalOpen(false);
  };

  const handleCheckoutSuccess = (user: SubscriberUser, sub: Subscription) => {
    setSubscriberUser(user);
    setSubscription(sub);
    setCheckoutModalOpen(false);
    refreshStats();
  };

  const handleOpenCheckoutForPlan = (plan: Plan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutModalOpen(true);
  };

  const handleSubscriptionUpdated = (updatedSub: Subscription) => {
    setSubscription(updatedSub);
    if (subscriberUser) {
      setSubscriberUser({
        ...subscriberUser,
        subscription: updatedSub,
      });
    }
    refreshStats();
  };

  const isSubscribed = !!subscription && subscription.status === 'active';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#171717] font-sans selection:bg-[#FF6A00] selection:text-white">
        {/* Render Admin Panel when authenticated and at /admin */}
        {currentPath === '/admin' && adminUser ? (
          <AdminPanel
            adminUser={adminUser}
            stats={stats}
            videos={videos}
            plans={plans}
            subscribers={subscribers}
            onBackToSite={() => navigateTo('/')}
            onLogout={handleAdminLogout}
            onSaveVideo={handleSaveVideo}
            onDeleteVideo={handleDeleteVideo}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
            onWatchVideo={(video) => setPlayingVideo(video)}
          />
        ) : (
          <>
            {/* OmeFlash Navbar */}
            <Navbar
              currentPath={currentPath}
              onNavigate={(path) => {
                if (path === '/admin' && !adminUser) {
                  setAdminLoginModalOpen(true);
                } else {
                  navigateTo(path);
                }
              }}
              adminUser={adminUser}
              subscriberUser={subscriberUser}
              onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
              onOpenSubscriberAuth={() => setSubscriberAuthModalOpen(true)}
              onOpenSubscriberAccount={() => setSubscriberAccountModalOpen(true)}
              onAdminLogout={handleAdminLogout}
              onSubscriberLogout={handleSubscriberLogout}
            />

            {/* Main Content Area */}
            <main className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                  <div className="w-8 h-8 border-3 border-[#FF6A00]/20 border-t-[#FF6A00] rounded-full animate-spin" />
                  <p className="text-xs text-[#646464] font-medium">Carregando OmeFlash...</p>
                </div>
              ) : currentPath === '/planos' ? (
                <PublicPlans
                  plans={plans}
                  error={plansError}
                  activeSubscription={subscription}
                  onSelectPlan={handleOpenCheckoutForPlan}
                  onManageSubscription={() => setSubscriberAccountModalOpen(true)}
                  onRetry={async () => {
                    const data = await api.getPlans();
                    setPlans(data);
                    setPlansError(null);
                  }}
                />
              ) : (
                <PublicHome
                  videos={videos}
                  isSubscribed={isSubscribed}
                  subscriberName={subscriberUser?.name}
                  onSelectVideo={(video) => setPlayingVideo(video)}
                  onNavigateToPlans={() => navigateTo('/planos')}
                />
              )}
            </main>

            {/* Clean Warm Footer */}
            <footer className="border-t border-[#E8E6E1] bg-white py-10 px-4 sm:px-6 mt-auto">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('/')}>
                  <div className="w-7 h-7 rounded-lg bg-[#FF6A00] flex items-center justify-center text-white">
                    <VideoIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                    <span className="text-[#FF6A00]">Ome</span>
                    <span className="text-[#171717]">Flash</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#646464] font-semibold">
                  <button
                    onClick={() => navigateTo('/')}
                    className="hover:text-[#171717] transition-colors cursor-pointer"
                  >
                    Início
                  </button>
                  <button
                    onClick={() => navigateTo('/planos')}
                    className="hover:text-[#171717] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#FF6A00]" />
                    Planos VIP
                  </button>
                  {subscriberUser ? (
                    <button
                      onClick={() => setSubscriberAccountModalOpen(true)}
                      className="hover:text-[#FF6A00] transition-colors cursor-pointer font-bold"
                    >
                      Minha Assinatura
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubscriberAuthModalOpen(true)}
                      className="hover:text-[#171717] transition-colors cursor-pointer"
                    >
                      Área do Assinante
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (adminUser) navigateTo('/admin');
                      else setAdminLoginModalOpen(true);
                    }}
                    className="hover:text-[#FF6A00] flex items-center gap-1 transition-colors cursor-pointer text-[#8E8E8E]"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Área Admin
                  </button>
                </div>

                <div className="text-xs text-[#8E8E8E]">
                  <span>© {new Date().getFullYear()} OmeFlash. Todos os direitos reservados.</span>
                </div>
              </div>
            </footer>
          </>
        )}

        {/* Clean Admin Login Modal */}
        <AdminLogin
          isOpen={adminLoginModalOpen}
          onClose={() => setAdminLoginModalOpen(false)}
          onSuccess={handleAdminLoginSuccess}
        />

        {/* Subscriber Authentication Modal */}
        <SubscriberAuthModal
          isOpen={subscriberAuthModalOpen}
          onClose={() => setSubscriberAuthModalOpen(false)}
          onSuccess={handleSubscriberAuthSuccess}
        />

        {/* Subscriber Account & Subscription Management Modal */}
        <SubscriberAccountModal
          isOpen={subscriberAccountModalOpen}
          onClose={() => setSubscriberAccountModalOpen(false)}
          subscriber={subscriberUser}
          onSubscriptionUpdated={handleSubscriptionUpdated}
          onLogout={handleSubscriberLogout}
          onNavigateToPlans={() => navigateTo('/planos')}
        />

        {/* Checkout & Recurring Subscription Modal */}
        <CheckoutModal
          isOpen={checkoutModalOpen}
          plan={selectedPlanForCheckout}
          currentSubscriber={subscriberUser}
          onClose={() => setCheckoutModalOpen(false)}
          onSuccess={handleCheckoutSuccess}
          onOpenSubscriberLogin={() => {
            setCheckoutModalOpen(false);
            setSubscriberAuthModalOpen(true);
          }}
        />

        {/* Video Player Modal with Subscription Barrier and Unlock */}
        <VideoPlayerModal
          video={playingVideo}
          isSubscribed={isSubscribed}
          onClose={() => setPlayingVideo(null)}
          onSubscribeClick={() => {
            if (plans.length > 0) {
              handleOpenCheckoutForPlan(plans[1] || plans[0]);
            } else {
              navigateTo('/planos');
            }
          }}
          onLoginClick={() => setSubscriberAuthModalOpen(true)}
        />
      </div>
    </ErrorBoundary>
  );
}
