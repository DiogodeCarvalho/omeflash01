import React from 'react';
import { Check, Crown, Shield, Zap, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { Plan, Subscription } from '../types';

interface PublicPlansProps {
  plans: Plan[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectPlan: (plan: Plan) => void;
  activeSubscription?: Subscription | null;
  onManageSubscription?: () => void;
}

export const PublicPlans: React.FC<PublicPlansProps> = ({
  plans,
  isLoading = false,
  error = null,
  onRetry,
  onSelectPlan,
  activeSubscription,
  onManageSubscription,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 bg-[#F8F7F4] text-[#171717]">
      {/* Header - Short, clear, clean */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acesso Ilimitado a 100% dos Vídeos</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171717] tracking-tight font-['Plus_Jakarta_Sans']">
          Planos de Acesso Recorrente
        </h1>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Todos os planos oferecem <strong>acesso integral a 100% do catálogo</strong>. Escolha a frequência de cobrança que melhor combina com você e cancele facilmente a qualquer momento.
        </p>
      </div>

      {/* Active Subscription banner if user already has one */}
      {activeSubscription && activeSubscription.status === 'active' && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Você já possui o <span className="underline">{activeSubscription.planName}</span> ativo!
              </div>
              <div className="text-[11px] text-emerald-700">
                Próxima renovação: {activeSubscription.nextBillingDate} · 100% liberado
              </div>
            </div>
          </div>
          {onManageSubscription && (
            <button
              onClick={onManageSubscription}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
            >
              Gerenciar Assinatura
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#FF6A00]/20 border-t-[#FF6A00] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#646464]">Carregando planos disponíveis...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="max-w-md mx-auto p-5 rounded-2xl border border-red-200 bg-white text-center space-y-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[#F8F7F4] border border-[#E8E6E1] text-[#171717] text-xs font-semibold rounded-lg hover:bg-[#E8E6E1]"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && plans.length === 0 && (
        <div className="text-center py-16 bg-white border border-[#E8E6E1] rounded-2xl p-8 max-w-md mx-auto shadow-2xs">
          <Crown className="w-10 h-10 text-[#8E8E8E] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#171717]">Nenhum plano cadastrado no momento</h3>
          <p className="text-xs text-[#646464] mt-1">
            Novos planos de acesso serão disponibilizados em breve pelos administradores.
          </p>
        </div>
      )}

      {/* Plans List: 1 column on mobile, 3 columns on tablet/desktop */}
      {!isLoading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;
            const isCurrentPlan = activeSubscription?.planId === plan.id && activeSubscription.status === 'active';

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-white ${
                  isCurrentPlan
                    ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md relative'
                    : isPopular
                    ? 'border-2 border-[#FF6A00] shadow-md relative'
                    : 'border border-[#E8E6E1] hover:border-[#8E8E8E] shadow-2xs'
                }`}
              >
                {/* Popular or Current Tag */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Seu Plano Atual</span>
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#FF6A00] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                    {plan.badge || 'Recomendado'}
                  </div>
                ) : null}

                <div>
                  {/* Plan Title & Description */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#171717]">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-[#646464] mt-1.5 leading-relaxed min-h-[32px]">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="mb-6 pb-4 border-b border-[#F0EEE9] flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-[#646464]">R$</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight font-['Plus_Jakarta_Sans']">
                      {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-[#646464] font-medium">
                      /{plan.period}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E8E] mb-2">
                      Benefícios inclusos:
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#171717]">
                        <Check className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`min-h-[48px] w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : isPopular
                      ? 'bg-[#FF6A00] hover:bg-[#E55F00] text-white shadow-xs'
                      : 'bg-[#171717] hover:bg-[#262626] text-white'
                  }`}
                >
                  <span>{isCurrentPlan ? 'Gerenciar Meu Plano' : `Assinar ${plan.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee Section */}
      <div className="border-t border-[#E8E6E1] pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 p-4 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs">
          <Shield className="w-5 h-5 text-[#FF6A00] shrink-0" />
          <div className="text-xs text-[#646464]">
            <strong className="block text-[#171717]">Cancelamento Sem Burocracia</strong>
            Cancele a renovação com um único clique pela sua própria área de assinante.
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-3 p-4 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs">
          <Zap className="w-5 h-5 text-[#FF6A00] shrink-0" />
          <div className="text-xs text-[#646464]">
            <strong className="block text-[#171717]">Liberação Imediata</strong>
            100% de todo o catálogo é liberado no mesmo segundo da confirmação do pagamento.
          </div>
        </div>
      </div>
    </div>
  );
};
