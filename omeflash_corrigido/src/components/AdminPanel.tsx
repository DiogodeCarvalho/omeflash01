import React, { useState } from 'react';
import { LayoutDashboard, Film, Crown, LogOut, ArrowLeft, Users } from 'lucide-react';
import { AdminUser, Video, Plan, AdminStats, SubscriberUser } from '../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminVideoList } from './AdminVideoList';
import { AdminVideoForm } from './AdminVideoForm';
import { AdminPlanList } from './AdminPlanList';
import { AdminPlanForm } from './AdminPlanForm';
import { AdminSubscriberList } from './AdminSubscriberList';

interface AdminPanelProps {
  adminUser: AdminUser;
  stats: AdminStats;
  videos: Video[];
  plans: Plan[];
  subscribers: SubscriberUser[];
  onBackToSite: () => void;
  onLogout: () => void;
  onSaveVideo: (videoData: Omit<Video, 'id' | 'views'>, id?: string) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onSavePlan: (planData: Omit<Plan, 'id'>, id?: string) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
  onWatchVideo: (video: Video) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  stats,
  videos,
  plans,
  subscribers,
  onBackToSite,
  onLogout,
  onSaveVideo,
  onDeleteVideo,
  onSavePlan,
  onDeletePlan,
  onWatchVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'plans' | 'subscribers'>('dashboard');
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoFormOpen(true);
  };

  const handleOpenEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoFormOpen(true);
  };

  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPlanFormOpen(true);
  };

  const handleOpenEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex flex-col">
      {/* Top Compact Admin Bar - Clean White */}
      <div className="bg-white border-b border-[#E8E6E1] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F7F4] hover:bg-[#E8E6E1] text-xs font-semibold text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site</span>
          </button>
          <div className="h-4 w-[1px] bg-[#E8E6E1] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold font-['Plus_Jakarta_Sans']">
              Painel <span className="text-[#FF6A00]">Ome</span>Flash
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#646464] hidden sm:inline">
            Administrador: <strong className="text-[#171717]">{adminUser.email}</strong>
          </span>
          <button
            onClick={onLogout}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E6E1] pb-3 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'text-[#646464] hover:text-[#171717] hover:bg-[#E8E6E1] bg-white border border-[#E8E6E1]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'subscribers'
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'text-[#646464] hover:text-[#171717] hover:bg-[#E8E6E1] bg-white border border-[#E8E6E1]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Assinantes ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'text-[#646464] hover:text-[#171717] hover:bg-[#E8E6E1] bg-white border border-[#E8E6E1]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Vídeos ({videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'text-[#646464] hover:text-[#171717] hover:bg-[#E8E6E1] bg-white border border-[#E8E6E1]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Planos ({plans.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-7 shadow-2xs">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              stats={stats}
              recentVideos={videos}
              plans={plans}
              onNavigateTab={setActiveTab}
              onAddVideo={handleOpenAddVideo}
              onAddPlan={handleOpenAddPlan}
            />
          )}

          {activeTab === 'subscribers' && (
            <AdminSubscriberList subscribers={subscribers} />
          )}

          {activeTab === 'videos' && (
            <AdminVideoList
              videos={videos}
              onAddVideo={handleOpenAddVideo}
              onEditVideo={handleOpenEditVideo}
              onDeleteVideo={onDeleteVideo}
              onWatchVideo={onWatchVideo}
            />
          )}

          {activeTab === 'plans' && (
            <AdminPlanList
              plans={plans}
              onAddPlan={handleOpenAddPlan}
              onEditPlan={handleOpenEditPlan}
              onDeletePlan={onDeletePlan}
            />
          )}
        </div>
      </div>

      {/* Video Modal Form */}
      <AdminVideoForm
        isOpen={videoFormOpen}
        onClose={() => setVideoFormOpen(false)}
        onSave={onSaveVideo}
        editingVideo={editingVideo}
      />

      {/* Plan Modal Form */}
      <AdminPlanForm
        isOpen={planFormOpen}
        onClose={() => setPlanFormOpen(false)}
        onSave={onSavePlan}
        editingPlan={editingPlan}
      />
    </div>
  );
};
