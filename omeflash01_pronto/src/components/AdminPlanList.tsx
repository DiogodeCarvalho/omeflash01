import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  X,
  Check
} from 'lucide-react';
import { Plan, PlanStatus, BillingInterval } from '../types.ts';
import { getAdminPlans, updateAdminPlanStatus, deleteAdminPlan } from '../lib/api.ts';

interface AdminPlanListProps {
  onAddNew: () => void;
  onEditPlan: (plan: Plan) => void;
}

export const AdminPlanList: React.FC<AdminPlanListProps> = ({ onAddNew, onEditPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modais
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [planToView, setPlanToView] = useState<Plan | null>(null);

  // Feedback de Sucesso
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminPlans({
        search,
        status: statusFilter,
      });
      setPlans(Array.isArray(res?.plans) ? res.plans : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao listar planos de assinatura.';
      setError(msg);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlans();
  };

  const handleToggleStatus = async (plan: Plan) => {
    const newStatus: PlanStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await updateAdminPlanStatus(plan.id, newStatus);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: newStatus } : p))
      );
      setFeedback(`Status de "${plan.name}" alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao alterar status do plano.';
      setError(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      setDeleting(true);
      await deleteAdminPlan(planToDelete.id);
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      setFeedback(`Plano "${planToDelete.name}" excluído com sucesso do banco de dados.`);
      setPlanToDelete(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir plano.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    const val = cents / 100;
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    if (currency === 'EUR') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    }
    return `${currency} ${val.toFixed(2)}`;
  };

  const getIntervalLabel = (interval: BillingInterval, count: number = 1) => {
    switch (interval) {
      case 'month':
        return count === 1 ? 'Mensal' : `${count} Meses`;
      case 'quarter':
        return 'Trimestral';
      case 'semester':
        return 'Semestral';
      case 'year':
        return 'Anual';
      default:
        return interval;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171717] flex items-center gap-2">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF6A00]" />
            Planos de Assinatura & VIP
          </h1>
          <p className="text-xs sm:text-sm text-[#646464] mt-0.5">
            Configure periodicidade, valores e benefícios exibidos publicamente na plataforma OmeFlash.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] px-5 text-xs font-bold text-white shadow-sm shadow-[#FF6A00]/20 transition active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Plano</span>
        </button>
      </div>

      {/* Alertas de Feedback / Erro */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros e Pesquisa */}
      <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Busca por Nome */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E8E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar planos por nome..."
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white pl-10 pr-3 text-xs text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:outline-none"
            />
          </form>

          {/* Segmented Control de Status */}
          <div className="flex items-center p-1 rounded-xl bg-[#F2EFE9] border border-[#E8E5DD] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[36px] px-3.5 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'all'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`min-h-[36px] px-3.5 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Ativos (Públicos)
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`min-h-[36px] px-3.5 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'inactive'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Inativos
            </button>
          </div>

          <button
            onClick={fetchPlans}
            title="Recarregar lista"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition shrink-0 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* LISTAGEM: MOBILE-FIRST CARDS (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center text-[#646464]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-2" />
            <p className="text-xs">Carregando planos do banco...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-8 text-center text-[#646464]">
            <CreditCard className="mx-auto h-8 w-8 text-[#8E8E8E] mb-2" />
            <p className="font-bold text-[#171717] text-sm">Nenhum plano encontrado</p>
            <p className="text-xs text-[#646464] mt-1">Cadastre um novo plano para iniciar a oferta comercial.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-4 space-y-3 transition ${
                plan.is_featured
                  ? 'bg-white border-2 border-[#FF6A00] shadow-md shadow-[#FF6A00]/10'
                  : 'bg-white border-[#E8E5DD] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#171717] truncate">
                      {plan.name}
                    </h3>
                    {plan.is_featured && (
                      <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider bg-[#FFF2E8] px-2 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#646464] line-clamp-2 mt-0.5">
                    {plan.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-[#171717] font-mono tabular-nums">
                    {formatPrice(plan.price_in_cents, plan.currency)}
                  </div>
                  <div className="text-[10px] text-[#646464]">
                    {getIntervalLabel(plan.billing_interval, plan.interval_count)}
                  </div>
                </div>
              </div>

              {/* Benefícios resumidos */}
              <div className="text-[11px] text-[#646464] flex items-center gap-2">
                <span>{plan.benefits.length} benefício(s) incluso(s)</span>
                <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                <span>Ordem: {plan.sort_order}</span>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(plan)}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                    plan.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-[#646464] border border-[#E8E5DD]'
                  }`}
                  title="Clique para alternar o status"
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span>{plan.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPlanToView(plan)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] active:scale-95"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditPlan(plan)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] active:scale-95"
                    title="Editar plano"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95"
                    title="Excluir plano"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LISTAGEM: DESKTOP TABLE (hidden md:block) */}
      <div className="hidden md:block rounded-2xl border border-white/[0.08] bg-zinc-900/60 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-zinc-950/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Plano</th>
              <th className="py-3.5 px-4">Preço</th>
              <th className="py-3.5 px-4">Periodicidade</th>
              <th className="py-3.5 px-4">Benefícios</th>
              <th className="py-3.5 px-4">Ordem</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mb-2" />
                  <p>Carregando planos de assinatura do banco...</p>
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  <CreditCard className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                  <p className="font-semibold text-zinc-300">Nenhum plano cadastrado</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Cadastre o primeiro plano de assinatura através do botão acima.
                  </p>
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-zinc-800/40 transition group">
                  {/* Nome + Descrição + Destaque */}
                  <td className="py-3.5 px-4 min-w-[220px]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-rose-400 transition">
                          {plan.name}
                        </span>
                        {plan.is_featured && (
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {plan.description}
                      </p>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        ID: {plan.id.substring(0, 8)}...
                      </span>
                    </div>
                  </td>

                  {/* Preço */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums font-bold text-sm text-white">
                    {formatPrice(plan.price_in_cents, plan.currency)}
                  </td>

                  {/* Periodicidade */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300">
                    {getIntervalLabel(plan.billing_interval, plan.interval_count)}
                    {plan.auto_renewal ? ' (Recorrente)' : ' (Avulso)'}
                  </td>

                  {/* Benefícios */}
                  <td className="py-3.5 px-4 text-zinc-400">
                    <span className="text-xs text-zinc-300">{plan.benefits.length} item(ns)</span>
                  </td>

                  {/* Ordem */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-mono">
                    #{plan.sort_order}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(plan)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        plan.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title="Clique para alternar o status"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{plan.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </button>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPlanToView(plan)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditPlan(plan)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        title="Editar plano"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPlanToDelete(plan)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Excluir plano"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Plano */}
      {planToView && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPlanToView(null)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/[0.1] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">Detalhes do Plano de Assinatura</h3>
              <button
                onClick={() => setPlanToView(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white -mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Nome do Plano</span>
                <p className="font-bold text-white text-base">{planToView.name}</p>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">Descrição</span>
                <p className="text-zinc-300 leading-relaxed bg-zinc-950/70 p-3 rounded-xl border border-white/[0.06]">
                  {planToView.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Preço</span>
                  <p className="text-white font-mono font-bold text-sm">
                    {formatPrice(planToView.price_in_cents, planToView.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Periodicidade</span>
                  <p className="text-white">
                    {getIntervalLabel(planToView.billing_interval, planToView.interval_count)}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Status</span>
                  <p className={planToView.status === 'active' ? 'text-emerald-400 font-semibold' : 'text-zinc-400 font-semibold'}>
                    {planToView.status === 'active' ? 'Ativo (Público)' : 'Inativo (Oculto)'}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Renovação Automática</span>
                  <p className="text-white">{planToView.auto_renewal ? 'Sim (Recorrente)' : 'Não (Avulso)'}</p>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block mb-1">Benefícios Cadastrados</span>
                <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-xl border border-white/[0.06]">
                  {planToView.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-300">
                      <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">UUID do Plano</span>
                <p className="font-mono text-[11px] text-zinc-400 break-all select-all">{planToView.id}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setPlanToView(null);
                  onEditPlan(planToView);
                }}
                className="min-h-[44px] px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
              >
                Editar
              </button>
              <button
                onClick={() => setPlanToView(null)}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {planToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !deleting && setPlanToDelete(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-rose-500/30 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Plano</h3>
                <p className="text-xs text-zinc-400">Esta ação é irreversível no banco de dados.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Você tem certeza de que deseja remover o plano <strong className="text-white">"{planToDelete.name}"</strong> permanentemente?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setPlanToDelete(null)}
                disabled={deleting}
                className="min-h-[44px] px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2"
              >
                {deleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{deleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
