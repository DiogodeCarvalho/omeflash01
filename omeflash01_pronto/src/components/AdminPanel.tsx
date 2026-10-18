import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Film, 
  PlusCircle, 
  CreditCard,
  Plus
} from 'lucide-react';
import { AdminUser, Video, Plan } from '../types.ts';
import { AdminDashboard } from './AdminDashboard.tsx';
import { AdminVideoList } from './AdminVideoList.tsx';
import { AdminVideoForm } from './AdminVideoForm.tsx';
import { AdminPlanList } from './AdminPlanList.tsx';
import { AdminPlanForm } from './AdminPlanForm.tsx';

interface AdminPanelProps {
  adminUser: AdminUser;
  onNavigateHome: () => void;
}

type AdminTab = 'dashboard' | 'videos' | 'create_video' | 'edit_video' | 'plans' | 'create_plan' | 'edit_plan';

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminUser, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Vídeos
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setActiveTab('edit_video');
  };

  const handleVideoFormSuccess = (_savedVideo: Video) => {
    setEditingVideo(null);
    setActiveTab('videos');
  };

  const handleCancelVideoForm = () => {
    setEditingVideo(null);
    setActiveTab('videos');
  };

  // Planos
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setActiveTab('edit_plan');
  };

  const handlePlanFormSuccess = (_savedPlan: Plan) => {
    setEditingPlan(null);
    setActiveTab('plans');
  };

  const handleCancelPlanForm = () => {
    setEditingPlan(null);
    setActiveTab('plans');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex flex-col pb-24 sm:pb-12 selection:bg-[#FF6A00] selection:text-white">
      {/* Subnav com Abas do Painel no Desktop / Tablet */}
      <div className="border-b border-[#E8E5DD] bg-white/95 sticky top-14 sm:top-16 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-3">
            {/* Desktop Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditingPlan(null);
                  setActiveTab('dashboard');
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 min-h-[40px] text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditingPlan(null);
                  setActiveTab('videos');
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 min-h-[40px] text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                  activeTab === 'videos' || activeTab === 'create_video' || activeTab === 'edit_video'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9]'
                }`}
              >
                <Film className="h-4 w-4" />
                <span>Vídeos</span>
              </button>

              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditingPlan(null);
                  setActiveTab('plans');
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 min-h-[40px] text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                  activeTab === 'plans' || activeTab === 'create_plan' || activeTab === 'edit_plan'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9]'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Planos</span>
              </button>
            </div>

            {/* Ações Rápidas de Criação (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditingPlan(null);
                  setActiveTab('create_video');
                }}
                className="flex items-center gap-1.5 rounded-xl px-3.5 min-h-[38px] text-xs font-semibold text-[#171717] hover:bg-[#F2EFE9] transition border border-[#E8E5DD] bg-white shadow-2xs"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#FF6A00]" />
                <span>Novo Vídeo</span>
              </button>

              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditingPlan(null);
                  setActiveTab('create_plan');
                }}
                className="flex items-center gap-1.5 rounded-xl px-3.5 min-h-[38px] text-xs font-semibold text-[#171717] hover:bg-[#F2EFE9] transition border border-[#E8E5DD] bg-white shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5 text-[#646464]" />
                <span>Novo Plano</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal da Aba */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => {
              setEditingVideo(null);
              setEditingPlan(null);
              if (tab === 'videos') setActiveTab('videos');
              if (tab === 'create') setActiveTab('create_video');
              if (tab === 'plans') setActiveTab('plans');
            }}
            onViewVideo={(_id) => {
              setActiveTab('videos');
            }}
          />
        )}

        {activeTab === 'videos' && (
          <AdminVideoList
            onAddNew={() => {
              setEditingVideo(null);
              setActiveTab('create_video');
            }}
            onEditVideo={handleEditVideo}
          />
        )}

        {(activeTab === 'create_video' || activeTab === 'edit_video') && (
          <AdminVideoForm
            initialVideo={editingVideo}
            onSuccess={handleVideoFormSuccess}
            onCancel={handleCancelVideoForm}
          />
        )}

        {activeTab === 'plans' && (
          <AdminPlanList
            onAddNew={() => {
              setEditingPlan(null);
              setActiveTab('create_plan');
            }}
            onEditPlan={handleEditPlan}
          />
        )}

        {(activeTab === 'create_plan' || activeTab === 'edit_plan') && (
          <AdminPlanForm
            initialPlan={editingPlan}
            onSuccess={handlePlanFormSuccess}
            onCancel={handleCancelPlanForm}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR ADMIN */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E5DD] grid grid-cols-4 items-center h-16 px-2 pb-safe shadow-xs">
        <button
          onClick={() => {
            setEditingVideo(null);
            setEditingPlan(null);
            setActiveTab('dashboard');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
            activeTab === 'dashboard' ? 'text-[#FF6A00] font-bold' : 'text-[#646464] hover:text-[#171717]'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1">Geral</span>
        </button>

        <button
          onClick={() => {
            setEditingVideo(null);
            setEditingPlan(null);
            setActiveTab('videos');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
            activeTab === 'videos' || activeTab === 'create_video' || activeTab === 'edit_video'
              ? 'text-[#FF6A00] font-bold'
              : 'text-[#646464] hover:text-[#171717]'
          }`}
        >
          <Film className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1">Vídeos</span>
        </button>

        <button
          onClick={() => {
            setEditingVideo(null);
            setEditingPlan(null);
            setActiveTab('plans');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
            activeTab === 'plans' || activeTab === 'create_plan' || activeTab === 'edit_plan'
              ? 'text-[#FF6A00] font-bold'
              : 'text-[#646464] hover:text-[#171717]'
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1">Planos</span>
        </button>

        <button
          onClick={() => {
            setEditingVideo(null);
            setEditingPlan(null);
            setActiveTab('create_video');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
            activeTab === 'create_video' ? 'text-[#FF6A00] font-bold' : 'text-[#646464] hover:text-[#171717]'
          }`}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-1">Novo</span>
        </button>
      </div>
    </div>
  );
};
