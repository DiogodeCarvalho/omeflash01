import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  CreditCard, 
  Plus, 
  Trash2
} from 'lucide-react';
import { Plan, PlanFormData, BillingInterval, PlanStatus } from '../types.ts';
import { createAdminPlan, updateAdminPlan } from '../lib/api.ts';

interface AdminPlanFormProps {
  initialPlan?: Plan | null;
  onSuccess: (plan: Plan) => void;
  onCancel: () => void;
}

const BENEFIT_SUGGESTIONS = [
  'Acesso ilimitado a todo o catálogo',
  'Resolução 4K Ultra HD + HDR',
  'Qualidade Full HD (1080p)',
  'Experiência 100% sem anúncios',
  'Assista em até 4 telas simultâneas',
  'Downloads liberados para visualização offline',
  'Suporte prioritário 24/7',
  'Acesso antecipado a pré-estreias e bastidores',
  'Cancelamento facilitado a qualquer momento'
];

export const AdminPlanForm: React.FC<AdminPlanFormProps> = ({
  initialPlan,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!initialPlan;

  const [name, setName] = useState(initialPlan?.name || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [priceInput, setPriceInput] = useState(
    initialPlan ? (initialPlan.price_in_cents / 100).toFixed(2).replace('.', ',') : '29,90'
  );
  const [currency, setCurrency] = useState(initialPlan?.currency || 'BRL');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    initialPlan?.billing_interval || 'month'
  );
  const [intervalCount, setIntervalCount] = useState<number>(initialPlan?.interval_count || 1);
  const [benefits, setBenefits] = useState<string[]>(
    Array.isArray(initialPlan?.benefits) && initialPlan.benefits.length > 0
      ? initialPlan.benefits
      : ['Acesso ilimitado ao catálogo de vídeos', 'Qualidade Full HD (1080p)', 'Sem anúncios']
  );
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [status, setStatus] = useState<PlanStatus>(initialPlan?.status || 'active');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialPlan?.is_featured ?? false);
  const [autoRenewal, setAutoRenewal] = useState<boolean>(initialPlan?.auto_renewal ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initialPlan?.sort_order ?? 0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name);
      setDescription(initialPlan.description);
      setPriceInput((initialPlan.price_in_cents / 100).toFixed(2).replace('.', ','));
      setCurrency(initialPlan.currency);
      setBillingInterval(initialPlan.billing_interval);
      setIntervalCount(initialPlan.interval_count);
      setBenefits(Array.isArray(initialPlan.benefits) ? initialPlan.benefits : []);
      setStatus(initialPlan.status);
      setIsFeatured(initialPlan.is_featured);
      setAutoRenewal(initialPlan.auto_renewal);
      setSortOrder(initialPlan.sort_order);
    }
  }, [initialPlan]);

  const parsePriceToCents = (input: string): number => {
    const cleaned = input.replace(/\s+/g, '').replace('R$', '').replace('$', '').replace('€', '').trim();
    const normalized = cleaned.replace(',', '.');
    const floatVal = parseFloat(normalized);
    if (isNaN(floatVal) || floatVal < 0) return 0;
    return Math.round(floatVal * 100);
  };

  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBenefits([...benefits, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleAddSuggestion = (sug: string) => {
    if (!benefits.includes(sug)) {
      setBenefits([...benefits, sug]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('O nome do plano é obrigatório e deve ter no mínimo 2 caracteres.');
      return;
    }

    if (!description.trim()) {
      setError('A descrição do plano é obrigatória.');
      return;
    }

    const priceCents = parsePriceToCents(priceInput);
    if (priceCents <= 0) {
      setError('Informe um preço válido maior que zero.');
      return;
    }

    if (benefits.length === 0) {
      setError('Adicione pelo menos um benefício para o plano.');
      return;
    }

    const payload: PlanFormData = {
      name: name.trim(),
      description: description.trim(),
      price_in_cents: priceCents,
      currency: currency.trim().toUpperCase(),
      billing_interval: billingInterval,
      interval_count: Math.max(1, intervalCount),
      benefits,
      status,
      is_featured: isFeatured,
      auto_renewal: autoRenewal,
      sort_order: sortOrder,
    };

    try {
      setLoading(true);
      if (isEditing && initialPlan) {
        const res = await updateAdminPlan(initialPlan.id, payload);
        onSuccess(res.plan);
      } else {
        const res = await createAdminPlan(payload);
        onSuccess(res.plan);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar plano de assinatura.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const centsPreview = parsePriceToCents(priceInput);

  return (
    <div className="rounded-3xl border border-[#E8E5DD] bg-white p-5 sm:p-8 shadow-xs max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#FF6A00]" />
            {isEditing ? 'Editar Plano VIP' : 'Cadastrar Novo Plano VIP'}
          </h2>
          <p className="text-xs text-[#646464] mt-1">
            Configure valores, período de cobrança e benefícios do OmeFlash Pass.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#646464] hover:text-[#171717] hover:bg-[#F8F7F4] transition"
          aria-label="Cancelar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Plano */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
            Nome Comercial do Plano *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: OmeFlash Pass Trimestral ou Anual Sem Limites"
            className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-4 text-sm text-[#171717] placeholder-[#646464]/60 focus:border-[#FF6A00] focus:bg-white focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition-colors"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
            Descrição / Proposta de Valor *
          </label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva para quem o plano é indicado e a proposta principal..."
            className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] p-3.5 text-sm text-[#171717] placeholder-[#646464]/60 focus:border-[#FF6A00] focus:bg-white focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition-colors"
          />
        </div>

        {/* Preço e Periodicidade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Preço *
            </label>
            <input
              type="text"
              required
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="Ex: 29,90"
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-4 text-sm font-mono font-bold text-[#171717] placeholder-[#646464]/60 focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            />
            <span className="text-[11px] text-[#646464] mt-1 block font-mono">
              = {(centsPreview / 100).toFixed(2)} {currency} ({centsPreview} centavos)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Moeda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            >
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Período de Cobrança *
            </label>
            <select
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value as BillingInterval)}
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            >
              <option value="month">Mensal</option>
              <option value="quarter">Trimestral (3 meses)</option>
              <option value="semester">Semestral (6 meses)</option>
              <option value="year">Anual (12 meses)</option>
            </select>
          </div>
        </div>

        {/* Benefícios */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2">
            Vantagens e Benefícios Inclusos *
          </label>

          {/* Lista de Benefícios Adicionados */}
          <div className="space-y-2 mb-3">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-3.5 py-2 text-xs text-[#171717]"
              >
                <span>{b}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center text-[#646464] hover:text-rose-600 transition"
                  title="Remover benefício"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Input para Novo Benefício */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newBenefitInput}
              onChange={(e) => setNewBenefitInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBenefit();
                }
              }}
              placeholder="Digite um novo benefício e pressione Enter ou Adicionar"
              className="flex-1 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-4 text-xs text-[#171717] placeholder-[#646464]/60 focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              className="min-h-[44px] px-4 rounded-xl bg-[#171717] hover:bg-black text-xs font-semibold text-white transition shrink-0 active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Sugestões Rápidas */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BENEFIT_SUGGESTIONS.slice(0, 5).map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddSuggestion(sug)}
                className="text-[11px] text-[#646464] hover:text-[#171717] bg-[#F8F7F4] px-2.5 py-1 rounded-lg border border-[#E8E5DD] hover:border-[#FF6A00] transition"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Opções de Configuração Adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E8E5DD]">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Status do Plano
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlanStatus)}
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            >
              <option value="active">Ativo (Exibido publicamente)</option>
              <option value="inactive">Inativo (Oculto)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] px-4 text-xs font-mono text-[#171717] focus:border-[#FF6A00] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-[#171717] cursor-pointer min-h-[30px]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#E8E5DD] text-[#FF6A00] focus:ring-[#FF6A00]"
              />
              <span className="font-medium">Marcar como Recomendado</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#171717] cursor-pointer min-h-[30px]">
              <input
                type="checkbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="h-4 w-4 rounded border-[#E8E5DD] text-[#FF6A00] focus:ring-[#FF6A00]"
              />
              <span className="font-medium">Renovação Automática</span>
            </label>
          </div>
        </div>

        {/* Botões de Ação (44px min touch height) */}
        <div className="pt-4 border-t border-[#E8E5DD] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-[44px] px-6 rounded-xl border border-[#E8E5DD] bg-white hover:bg-[#F8F7F4] text-xs font-semibold text-[#646464] hover:text-[#171717] transition active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] px-7 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-xs font-semibold text-white shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : isEditing ? 'Atualizar Plano' : 'Criar Plano'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
