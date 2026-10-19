import React, { useState, useEffect } from 'react';
import { Crown, Check, Zap, Sparkles, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Plan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StripeSimulatorModal } from './StripeSimulatorModal';

interface PlansSectionProps {
  onSuccessSubscription?: () => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onSuccessSubscription }) => {
  const { user, isVip, openAuthModal, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanForSim, setSelectedPlanForSim] = useState<{ plan: Plan; sessionId: string } | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<{ isConfigured: boolean; mode: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, configData] = await Promise.all([
        api.getPlans(),
        api.getStripeConfig().catch(() => ({ isConfigured: false, mode: 'sandbox_simulator', publishableKey: '' })),
      ]);
      setPlans(plansData);
      setStripeConfig(configData);
    } catch (e) {
      console.error('Erro ao carregar planos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      openAuthModal('register');
      return;
    }

    setSubscribingId(plan.id);

    try {
      const checkoutRes = await api.createCheckoutSession(plan.id);

      if (checkoutRes.mode === 'stripe' && checkoutRes.url) {
        // Redirect to real Stripe Hosted Checkout
        window.location.href = checkoutRes.url;
      } else {
        // Open local simulator modal
        setSelectedPlanForSim({ plan, sessionId: checkoutRes.sessionId });
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar assinatura.');
    } finally {
      setSubscribingId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Deseja realmente cancelar a sua assinatura VIP? Você perderá o acesso exclusivo às gravações do catálogo.')) {
      return;
    }

    setCanceling(true);
    try {
      await api.cancelSubscription();
      await refreshUser();
      alert('Assinatura cancelada com sucesso.');
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar assinatura.');
    } finally {
      setCanceling(false);
    }
  };

  const handleManagePortal = async () => {
    try {
      const { url } = await api.createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      alert('O Portal do Cliente Stripe requer que chaves de produção/teste estejam ativas no .env.');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF5500] text-xs font-bold uppercase tracking-wider mb-3">
          <Crown className="w-3.5 h-3.5" />
          Acesso VIP OmeFlash
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
          Escolha o plano ideal para você
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Tenha acesso irrestrito a todas as conversas gravadas, bastidores, episódios sem cortes e novos vídeos adicionados semanalmente.
        </p>

        {/* Current status alert */}
        {isVip && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-sm font-bold text-gray-900">Sua assinatura VIP está ATIVA</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Plano: <span className="font-semibold text-[#FF5500] uppercase">{user?.subscriptionPlan?.replace('_', ' ')}</span>
                {user?.subscriptionExpiresAt && ` • Válido até ${new Date(user.subscriptionExpiresAt).toLocaleDateString('pt-BR')}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManagePortal}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Gerenciar na Stripe
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                {canceling ? 'Cancelando...' : 'Cancelar Plano'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plans Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => {
            const isCurrent = isVip && user?.subscriptionPlan === plan.id;
            const isHighlight = plan.highlight;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  isHighlight
                    ? 'bg-gradient-to-b from-orange-50/80 via-white to-white border-2 border-[#FF5500] shadow-xl scale-[1.02] z-10'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5500] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {isHighlight && (
                      <span className="p-1.5 rounded-lg bg-orange-100 text-[#FF5500]">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-500">R$</span>
                    <span className="text-4xl font-black text-gray-950 tracking-tight">
                      {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">/{plan.periodLabel}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">O que está incluído:</p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-2xl text-center flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Plano Atualmente Ativo
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribingId === plan.id}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isHighlight
                          ? 'bg-[#FF5500] hover:bg-[#e44d00] text-white shadow-orange-500/25 hover:scale-[1.01]'
                          : 'bg-gray-900 hover:bg-black text-white'
                      }`}
                    >
                      {subscribingId === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Iniciando Checkout...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Assinar {plan.name}</span>
                        </>
                      )}
                    </button>
                  )}

                  <p className="text-[11px] text-gray-400 text-center mt-2.5">
                    Cobrança segura via Stripe • Cancele quando quiser
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Modal */}
      {selectedPlanForSim && (
        <StripeSimulatorModal
          plan={selectedPlanForSim.plan}
          sessionId={selectedPlanForSim.sessionId}
          onClose={() => setSelectedPlanForSim(null)}
          onSuccess={() => {
            setSelectedPlanForSim(null);
            onSuccessSubscription?.();
          }}
        />
      )}
    </section>
  );
};
