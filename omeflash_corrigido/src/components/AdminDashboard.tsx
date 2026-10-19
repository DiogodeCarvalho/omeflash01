import React from 'react';
import { Film, Crown, Eye, Zap, Plus, ArrowRight, Users, DollarSign } from 'lucide-react';
import { AdminStats, Video, Plan } from '../types';

interface AdminDashboardProps {
  stats: AdminStats;
  recentVideos: Video[];
  plans: Plan[];
  onNavigateTab: (tab: 'videos' | 'plans' | 'subscribers') => void;
  onAddVideo: () => void;
  onAddPlan: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  recentVideos,
  plans,
  onNavigateTab,
  onAddVideo,
  onAddPlan,
}) => {
  return (
    <div className="space-y-8 bg-white">
      {/* Top Banner - Clean, simple, with orange accents */}
      <div className="rounded-2xl p-6 sm:p-7 bg-[#F8F7F4] border border-[#E8E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight font-['Plus_Jakarta_Sans']">
            Painel Geral do <span className="text-[#FF6A00]">Ome</span>Flash
          </h2>
          <p className="text-xs sm:text-sm text-[#646464] mt-1">
            Controle de assinaturas recorrentes, catálogo de vídeos e métricas de receita.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddVideo}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Vídeo</span>
          </button>
          <button
            onClick={onAddPlan}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#F0EEE9] text-[#171717] text-xs font-bold border border-[#E8E6E1] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Enhanced with Subscriptions & MRR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          onClick={() => onNavigateTab('subscribers')}
          className="p-5 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs hover:border-[#FF6A00] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Recorrentes
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
            {stats.activeSubscriptions || 1}
          </div>
          <div className="text-xs text-[#646464] font-medium mt-0.5">Assinaturas Ativas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/20">
              MRR Est.
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
            R$ {(stats.mrr || 29.9).toFixed(2).replace('.', ',')}
          </div>
          <div className="text-xs text-[#646464] font-medium mt-0.5">Receita Mensal Recorrente</div>
        </div>

        <div
          onClick={() => onNavigateTab('videos')}
          className="p-5 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs hover:border-[#FF6A00] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F8F7F4] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
              <Film className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F7F4] text-[#646464] border border-[#E8E6E1]">
              100% Liberado
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
            {stats.totalVideos}
          </div>
          <div className="text-xs text-[#646464] font-medium mt-0.5">Vídeos no Catálogo</div>
        </div>

        <div
          onClick={() => onNavigateTab('plans')}
          className="p-5 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs hover:border-[#FF6A00] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F8F7F4] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
              <Zap className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F7F4] text-[#646464] border border-[#E8E6E1]">
              Ativos
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
            {stats.totalPlans}
          </div>
          <div className="text-xs text-[#646464] font-medium mt-0.5">Planos Cadastrados</div>
        </div>
      </div>

      {/* Quick Previews: 1 col on mobile, 2 on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E6E1] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#171717] text-sm flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF6A00]" />
                Vídeos Recentes
              </h3>
              <button
                onClick={() => onNavigateTab('videos')}
                className="text-xs text-[#FF6A00] hover:text-[#E55F00] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentVideos.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#F0EEE9] transition-colors border border-[#E8E6E1]/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-7 rounded bg-black shrink-0 overflow-hidden">
                      <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs text-[#171717] truncate">{v.title}</div>
                      <div className="text-[11px] text-[#646464]">{v.category} · {v.duration}</div>
                    </div>
                  </div>
                  {v.isPremium && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2E8] text-[#FF6A00] shrink-0 ml-2 border border-[#FF6A00]/20">
                      VIP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Plans */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E6E1] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#171717] text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#FF6A00]" />
                Planos Configurados
              </h3>
              <button
                onClick={() => onNavigateTab('plans')}
                className="text-xs text-[#FF6A00] hover:text-[#E55F00] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Gerenciar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E6E1]/50"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#171717]">{p.name}</div>
                    <div className="text-[11px] text-[#646464]">{p.features.length} benefícios</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-[#171717] font-['Plus_Jakarta_Sans']">
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-[#8E8E8E]">/{p.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
