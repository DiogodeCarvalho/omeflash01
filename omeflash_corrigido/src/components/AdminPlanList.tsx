import React, { useState } from 'react';
import { Crown, Edit3, Trash2, Plus, Check } from 'lucide-react';
import { Plan } from '../types';

interface AdminPlanListProps {
  plans: Plan[];
  onAddPlan: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => Promise<void>;
}

export const AdminPlanList: React.FC<AdminPlanListProps> = ({
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este plano?')) {
      try {
        setDeletingId(id);
        await onDeletePlan(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#171717]">Planos de Assinatura VIP</h3>
          <p className="text-xs text-[#646464]">Valores e benefícios exibidos publicamente na página /planos</p>
        </div>

        <button
          onClick={onAddPlan}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Plano</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between transition-all shadow-2xs ${
              plan.isPopular
                ? 'border-2 border-[#FF6A00] shadow-sm relative'
                : 'border border-[#E8E6E1]'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/20 text-[10px] font-bold uppercase tracking-wider">
                {plan.badge || 'Popular'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-[#FF6A00]" />
                <h4 className="text-base font-bold text-[#171717]">{plan.name}</h4>
              </div>

              <p className="text-xs text-[#646464] mb-3 min-h-[30px] leading-relaxed">
                {plan.description}
              </p>

              <div className="mb-4 pb-3 border-b border-[#F0EEE9] flex items-baseline gap-1">
                <span className="text-xs font-semibold text-[#646464]">R$</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
                  {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-[#646464]">/{plan.period}</span>
              </div>

              <div className="space-y-1.5 mb-5">
                <div className="text-[11px] font-bold text-[#8E8E8E] uppercase tracking-wider mb-1">
                  Benefícios ({plan.features.length})
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#171717]">
                    <Check className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-end gap-2">
              <button
                onClick={() => onEditPlan(plan)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#F8F7F4] hover:bg-[#E8E6E1] text-[#171717] border border-[#E8E6E1] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                disabled={deletingId === plan.id}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-[#E8E6E1] text-[#646464] text-sm">
          Nenhum plano de assinatura cadastrado.
        </div>
      )}
    </div>
  );
};
