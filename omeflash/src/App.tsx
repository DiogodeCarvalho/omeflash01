import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoCatalog } from './components/VideoCatalog';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PlansSection } from './components/PlansSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { StripeGuideModal } from './components/StripeGuideModal';
import { Video } from './types';
import { api } from './services/api';
import { Crown, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { user, isVip, openAuthModal, openPlansModal, openStripeGuide, refreshUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'plans' | 'admin'>('home');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();

    // Check if returning from a real Stripe checkout session via query params
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      refreshUser().then(() => {
        setSuccessBanner('Parabéns! Sua assinatura VIP foi ativada com sucesso. Aproveite todo o catálogo!');
        setTimeout(() => setSuccessBanner(null), 8000);
      });
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await api.getVideos();
      setVideos(res.videos);
    } catch (e) {
      console.error('Erro ao carregar catálogo:', e);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleOpenVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const handlePlansClick = () => {
    setCurrentTab('plans');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCatalogClick = () => {
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col font-sans selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      {/* Top Notification Banner if Stripe checkout completed */}
      {successBanner && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            {/* Visual hero matching the user's uploaded image */}
            <Hero
              onExploreCatalog={handleCatalogClick}
              onOpenPlans={handlePlansClick}
            />

            {/* Video Catalog preview section */}
            <VideoCatalog
              videos={videos}
              isLoading={loadingVideos}
              onSelectVideo={handleOpenVideo}
              onOpenPlans={handlePlansClick}
            />

            {/* Plans Showcase on Home */}
            <div className="bg-white border-t border-gray-100 mt-12">
              <PlansSection onSuccessSubscription={loadVideos} />
            </div>
          </>
        )}

        {currentTab === 'catalog' && (
          <VideoCatalog
            videos={videos}
            isLoading={loadingVideos}
            onSelectVideo={handleOpenVideo}
            onOpenPlans={handlePlansClick}
          />
        )}

        {currentTab === 'plans' && (
          <PlansSection onSuccessSubscription={loadVideos} />
        )}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onOpenPlans={() => {
            setSelectedVideo(null);
            handlePlansClick();
          }}
          onOpenAuth={() => {
            setSelectedVideo(null);
            openAuthModal('login');
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal onSuccess={loadVideos} />

      {/* Stripe Guide Modal */}
      <StripeGuideModal />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-bold">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <span className="font-black text-lg">
              <span className="text-[#FF5500]">Ome</span>Flash
            </span>
            <span className="text-xs text-gray-400 ml-2">
              © {new Date().getFullYear()} OmeFlash • Todos os direitos reservados
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button onClick={openStripeGuide} className="hover:text-gray-900 font-medium">
              Integração Stripe
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('plans')} className="hover:text-gray-900 font-medium">
              Planos VIP
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Pagamentos 100% Seguros via Stripe
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
