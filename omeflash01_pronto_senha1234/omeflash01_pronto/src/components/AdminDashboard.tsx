import React, { useState, useEffect } from 'react';
import { 
  Film, 
  CheckCircle, 
  Clock, 
  Plus, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  Eye,
  CreditCard
} from 'lucide-react';
import { AdminStats } from '../types.ts';
import { getAdminStats } from '../lib/api.ts';

interface AdminDashboardProps {
  onNavigateTab: (tab: 'videos' | 'create' | 'plans') => void;
  onViewVideo: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onViewVideo }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminStats();
      setStats(res?.stats || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar métricas do dashboard.';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner de Boas-Vindas */}
      <div className="rounded-3xl border border-[#E8E5DD] bg-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
            <span>Painel Administrativo</span>
            <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
            <span>Visão Geral</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight [text-wrap:balance]">
            Gestão de Conteúdo e Assinaturas
          </h1>
          <p className="text-xs sm:text-sm text-[#646464] max-w-2xl leading-relaxed">
            Acompanhe indicadores do acervo e da oferta comercial do OmeFlash com dados persistidos no banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigateTab('create')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] px-5 text-xs font-bold text-white shadow-sm shadow-[#FF6A00]/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Vídeo</span>
          </button>
          <button
            onClick={fetchStats}
            title="Atualizar dados"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition active:scale-95 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Grid de Cards de Métricas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#646464]">
            Indicadores de Conteúdo
          </span>
          <button
            onClick={() => onNavigateTab('videos')}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#E65F00] flex items-center gap-1 transition"
          >
            Gerenciar Vídeos
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Vídeos */}
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block truncate">Total de Vídeos</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#171717] font-mono tabular-nums">
              {loading ? '...' : stats?.total ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">cadastrados no banco</span>
          </div>

          {/* Publicados */}
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block truncate">Vídeos Publicados</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {loading ? '...' : stats?.published ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">no catálogo público</span>
          </div>

          {/* Rascunhos */}
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block truncate">Rascunhos</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
              {loading ? '...' : stats?.drafts ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">não visíveis</span>
          </div>

          {/* Categorias */}
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block truncate">Categorias</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#171717] font-mono tabular-nums">
              {loading ? '...' : stats?.categoriesCount ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">gêneros ativos</span>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Planos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#646464]">
            Planos de Assinatura & VIP
          </span>
          <button
            onClick={() => onNavigateTab('plans')}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#E65F00] flex items-center gap-1 transition"
          >
            Gerenciar Planos
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block">Total de Planos</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#171717] font-mono tabular-nums">
              {loading ? '...' : stats?.totalPlans ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">configurados no sistema</span>
          </div>

          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block">Planos Ativos</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {loading ? '...' : stats?.activePlans ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">visíveis em /planos</span>
          </div>

          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 sm:p-5 shadow-2xs">
            <span className="text-xs text-[#646464] block">Planos Inativos</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#646464] font-mono tabular-nums">
              {loading ? '...' : stats?.inactivePlans ?? 0}
            </div>
            <span className="text-[11px] text-[#8E8E8E] mt-1 block">ocultos ao público</span>
          </div>
        </div>
      </div>

      {/* Grid: Atividades Recentes + Status da Infraestrutura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes (2 colunas) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E8E5DD] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
            <h2 className="text-sm font-bold text-[#171717]">
              Últimos Vídeos Cadastrados
            </h2>
            <button
              onClick={() => onNavigateTab('videos')}
              className="text-xs font-bold text-[#FF6A00] hover:text-[#E65F00]"
            >
              Ver todos
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#646464]">Carregando registros...</div>
          ) : !stats?.recentVideos || stats.recentVideos.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#646464]">
              Nenhum vídeo cadastrado até o momento.
            </div>
          ) : (
            <div className="divide-y divide-[#EFECE5]">
              {stats.recentVideos.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#171717] truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#646464]">
                      <span className="text-[#FF6A00] font-medium">{item.category}</span>
                      <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                      <span className="font-mono">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        item.status === 'published'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>

                    <button
                      onClick={() => onViewVideo(item.id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#646464] hover:bg-[#F2EFE9] hover:text-[#171717] transition"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações da Infraestrutura */}
        <div className="rounded-2xl border border-[#E8E5DD] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#171717] border-b border-[#E8E5DD] pb-3">
            Infraestrutura & Segurança
          </h2>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] p-3.5 space-y-1">
              <div className="flex items-center justify-between font-semibold text-[#171717]">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-[#FF6A00]" />
                  Banco de Dados
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">CONECTADO</span>
              </div>
              <p className="text-[11px] text-[#646464] leading-relaxed">
                SQLite com chave estrangeira e persistência em disco.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] p-3.5 space-y-1">
              <div className="flex items-center justify-between font-semibold text-[#171717]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#FF6A00]" />
                  Autenticação
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">SEGURO</span>
              </div>
              <p className="text-[11px] text-[#646464] leading-relaxed">
                Hash scrypt com salt aleatório e sessões no servidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
