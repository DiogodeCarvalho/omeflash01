import React, { useState, useEffect } from 'react';
import { X, Crown, Plus, Trash2, Check } from 'lucide-react';
import { Plan } from '../types';

interface AdminPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Omit<Plan, 'id'>, id?: string) => Promise<void>;
  editingPlan: Plan | null;
}

export const AdminPlanForm: React.FC<AdminPlanFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPlan,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>(29.90);
  const [period, setPeriod] = useState('mês');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPopular, setIsPopular] = useState(false);
  const [badge, setBadge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name);
      setPrice(editingPlan.price);
      setPeriod(editingPlan.period);
      setDescription(editingPlan.description);
      setFeatures(editingPlan.features.length ? editingPlan.features : ['']);
      setIsPopular(Boolean(editingPlan.isPopular));
      setBadge(editingPlan.badge || '');
    } else {
      setName('');
      setPrice(29.90);
      setPeriod('mês');
      setDescription('');
      setFeatures(['Transmissões Full HD', 'Bate-papo sem anúncios', 'Acesso ilimitado']);
      setIsPopular(false);
      setBadge('');
    }
    setError(null);
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleUpdateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '') {
      setError('Nome e valor do plano são obrigatórios.');
      return;
    }

    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
    if (cleanFeatures.length === 0) {
      setError('Adicione pelo menos um benefício no plano.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(
        {
          name: name.trim(),
          price: Number(price) || 0,
          period: period.trim() || 'mês',
          description: description.trim(),
          features: cleanFeatures,
          isPopular,
          badge: badge.trim() || undefined,
        },
        editingPlan?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar plano.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-[#E8E6E1] rounded-3xl p-6 sm:p-8 shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#646464] hover:text-[#171717] rounded-xl hover:bg-[#F8F7F4] cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171717] font-['Plus_Jakarta_Sans']">
              {editingPlan ? 'Editar Plano VIP' : 'Criar Plano VIP'}
            </h3>
            <p className="text-xs text-[#646464]">Configure os valores e benefícios do plano</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Nome do Plano *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plano VIP Mensal"
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.90"
                className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Período de Cobrança</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              >
                <option value="mês">mês</option>
                <option value="ano">ano</option>
                <option value="semana">semana</option>
                <option value="único">único (vitalício)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Descrição Curta</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Acesso total às transmissões ao vivo em 4K."
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          {/* Features list */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#171717]">Benefícios Inclusos</label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-xs text-[#FF6A00] hover:text-[#E55F00] font-bold flex items-center gap-1 cursor-pointer py-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar benefício
              </button>
            </div>

            <div className="space-y-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                    placeholder={`Benefício ${idx + 1}`}
                    className="flex-1 px-3.5 py-2 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#8E8E8E] hover:text-red-600 rounded-xl hover:bg-[#F8F7F4] cursor-pointer"
                      aria-label="Remover benefício"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00] accent-[#FF6A00]"
              />
              <label htmlFor="isPopular" className="text-xs font-medium text-[#171717] cursor-pointer">
                Destacar como Recomendado
              </label>
            </div>

            <div>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Rótulo (ex: Mais Popular)"
                className="w-full px-3.5 py-2 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-[#646464] hover:text-[#171717] text-xs font-semibold hover:bg-[#F8F7F4] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar Plano</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
