import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ArrowLeft, 
  CreditCard, 
  AlertCircle,
  HelpCircle,
  X,
  Zap,
  Sparkles
} from 'lucide-react';
import { Plan, BillingInterval } from '../types.ts';
import { getPublicPlans } from '../lib/api.ts';
import { FALLBACK_PLANS } from '../lib/fallbackData.ts';

interface PublicPlansProps {
  onNavigateHome: () => void;
  onNavigateToAdmin: () => void;
}

export const PublicPlans: React.FC<PublicPlansProps> = ({ onNavigateHome, onNavigateToAdmin }) => {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalFilter, setIntervalFilter] = useState<'all' | BillingInterval>('all');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPublicPlans();
      const fetchedPlans = Array.isArray(res?.plans) ? res.plans : [];
      if (fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
      } else {
        setPlans(FALLBACK_PLANS);
      }
    } catch (err: unknown) {
      console.warn('API de planos indisponível, utilizando planos demonstrativos locais:', err);
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const formatPrice = (cents: number, currency: string) => {
    const value = cents / 100;
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    if (currency === 'EUR') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    return `${currency} ${value.toFixed(2)}`;
  };

  const getIntervalLabel = (interval: BillingInterval, count: number = 1) => {
    switch (interval) {
      case 'month':
        return count === 1 ? 'mês' : `${count} meses`;
      case 'quarter':
        return 'trimestre';
      case 'semester':
        return 'semestre';
      case 'year':
        return 'ano';
      default:
        return interval;
    }
  };

  const getMonthlyEquivalent = (cents: number, interval: BillingInterval, currency: string) => {
    let months = 1;
    if (interval === 'quarter') months = 3;
    if (interval === 'semester') months = 6;
    if (interval === 'year') months = 12;

    if (months <= 1) return null;

    const monthlyCents = Math.round(cents / months);
    return `${formatPrice(monthlyCents, currency)} / mês`;
  };

  const safePlans = Array.isArray(plans) ? plans : [];
  const filteredPlans = safePlans.filter((p) => {
    if (intervalFilter === 'all') return true;
    return p.billing_interval === intervalFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex flex-col pb-24 sm:pb-16 selection:bg-[#FF6A00] selection:text-white">
      {/* Header da Página de Planos OmeFlash */}
      <section className="border-b border-[#E8E5DD] bg-[#F8F7F4] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#646464] hover:text-[#171717] transition active:scale-95 min-h-[40px] px-3.5 rounded-xl border border-[#E8E5DD] bg-white shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-[#FF6A00]" />
            <span>Voltar ao início</span>
          </button>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
              Passe VIP OmeFlash
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717] [text-wrap:balance]">
              Mais encontros. Zero esperas.
            </h1>
            <p className="text-sm sm:text-base text-[#646464] max-w-xl mx-auto leading-relaxed [text-wrap:balance]">
              Desbloqueie prioridade instantânea nas filas de vídeo, resolução Ultra HD e conecte-se com pessoas incríveis sem limites.
            </p>
          </div>

          {/* Segmented Control para Filtro de Ciclos */}
          <div className="pt-2 inline-flex items-center p-1 rounded-2xl bg-[#EFECE5] border border-[#E8E5DD] text-xs font-semibold max-w-full overflow-x-auto">
            <button
              onClick={() => setIntervalFilter('all')}
              className={`min-h-[40px] px-4 rounded-xl transition whitespace-nowrap active:scale-95 ${
                intervalFilter === 'all'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Todos os Planos
            </button>
            <button
              onClick={() => setIntervalFilter('month')}
              className={`min-h-[40px] px-4 rounded-xl transition whitespace-nowrap active:scale-95 ${
                intervalFilter === 'month'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIntervalFilter('quarter')}
              className={`min-h-[40px] px-4 rounded-xl transition whitespace-nowrap active:scale-95 ${
                intervalFilter === 'quarter'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Trimestral
            </button>
            <button
              onClick={() => setIntervalFilter('year')}
              className={`min-h-[40px] px-4 rounded-xl transition whitespace-nowrap active:scale-95 ${
                intervalFilter === 'year'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Anual
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Cards de Planos */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-3" />
            <p className="text-xs text-[#646464] font-medium">Carregando planos OmeFlash...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-medium">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-4 min-h-[44px] px-5 rounded-xl bg-[#FF6A00] text-xs font-bold text-white hover:bg-[#E65F00] transition shadow-2xs"
            >
              Tentar Novamente
            </button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-8 text-center max-w-md mx-auto">
            <p className="text-sm font-bold text-[#171717]">Nenhum plano disponível para este período</p>
            <p className="mt-1 text-xs text-[#646464]">
              Alterne o filtro acima para visualizar todas as opções ativas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredPlans.map((plan) => {
              const monthlyEquivalent = getMonthlyEquivalent(plan.price_in_cents, plan.billing_interval, plan.currency);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl flex flex-col justify-between p-6 sm:p-8 transition-all ${
                    plan.is_featured
                      ? 'bg-white border-2 border-[#FF6A00] shadow-xl shadow-[#FF6A00]/10'
                      : 'bg-white border border-[#E8E5DD] hover:border-[#171717]/30 shadow-xs'
                  }`}
                >
                  <div className="space-y-5">
                    {/* Cabeçalho do Plano */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-xl font-extrabold text-[#171717]">{plan.name}</h3>
                        {plan.is_featured && (
                          <span className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-wider bg-[#FFF2E8] px-2.5 py-0.5 rounded-full">
                            Mais Escolhido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#646464] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Preço de Destaque */}
                    <div className="py-4 border-y border-[#E8E5DD]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight font-sans tabular-nums">
                          {formatPrice(plan.price_in_cents, plan.currency)}
                        </span>
                        <span className="text-xs text-[#646464] font-medium">
                          / {getIntervalLabel(plan.billing_interval, plan.interval_count)}
                        </span>
                      </div>

                      {monthlyEquivalent && (
                        <div className="text-[11px] text-[#FF6A00] font-bold mt-1">
                          Equivale a {monthlyEquivalent}
                        </div>
                      )}

                      <div className="text-[11px] text-[#8E8E8E] mt-1.5">
                        {plan.auto_renewal
                          ? 'Renovação automática · Cancele facilmente quando quiser'
                          : 'Pagamento avulso sem renovação recorrente'}
                      </div>
                    </div>

                    {/* Lista de Vantagens Inclusas */}
                    <div className="space-y-3 pt-1">
                      <div className="text-[11px] font-bold text-[#171717] uppercase tracking-wider">
                        Vantagens inclusas
                      </div>
                      <div className="space-y-2.5">
                        {(Array.isArray(plan.benefits)
                          ? plan.benefits
                          : typeof plan.benefits === 'string'
                          ? (() => {
                              try {
                                return JSON.parse(plan.benefits);
                              } catch {
                                return [];
                              }
                            })()
                          : []
                        ).map((b: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#171717]">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFF2E8] text-[#FF6A00] mt-0.5">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Contratação */}
                  <div className="pt-6 mt-6 border-t border-[#E8E5DD]">
                    <button
                      onClick={() => setSelectedPlanForCheckout(plan)}
                      className={`w-full min-h-[48px] rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition active:scale-[0.98] ${
                        plan.is_featured
                          ? 'bg-[#FF6A00] hover:bg-[#E65F00] text-white shadow-md shadow-[#FF6A00]/25'
                          : 'bg-[#171717] hover:bg-[#262626] text-white'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Assinar {plan.name}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ OmeFlash */}
      <section className="border-t border-[#E8E5DD] bg-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold text-[#171717] flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#FF6A00]" />
              Dúvidas Frequentes sobre o Passe VIP
            </h2>
            <p className="text-xs sm:text-sm text-[#646464]">Informações claras e transparentes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="rounded-2xl border border-[#E8E5DD] bg-[#F8F7F4] p-5 space-y-1">
              <h4 className="text-xs font-bold text-[#171717]">Como funciona o cancelamento?</h4>
              <p className="text-xs text-[#646464] leading-relaxed">
                Você tem autonomia para cancelar a assinatura quando desejar, sem multas, contratos ou burocracias.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E5DD] bg-[#F8F7F4] p-5 space-y-1">
              <h4 className="text-xs font-bold text-[#171717]">Formas de pagamento</h4>
              <p className="text-xs text-[#646464] leading-relaxed">
                Integração compatível com Cartão de Crédito, Pix e métodos digitais com cobrança protegida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Provisório de Checkout */}
      {selectedPlanForCheckout && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedPlanForCheckout(null)}
        >
          <div 
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-[#E8E5DD] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E8E5DD] rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF2E8] text-[#FF6A00]">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">Assinatura VIP OmeFlash</h3>
                  <p className="text-[11px] text-[#646464]">Confirmação de Plano</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#646464] hover:text-[#171717]"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumo */}
            <div className="rounded-2xl bg-[#F8F7F4] border border-[#E8E5DD] p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#646464]">Plano Escolhido:</span>
                <span className="font-bold text-[#171717]">{selectedPlanForCheckout.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646464]">Valor:</span>
                <span className="font-bold text-[#FF6A00] font-mono tabular-nums text-sm">
                  {formatPrice(selectedPlanForCheckout.price_in_cents, selectedPlanForCheckout.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646464]">Ciclo:</span>
                <span className="capitalize font-medium text-[#171717]">
                  {getIntervalLabel(selectedPlanForCheckout.billing_interval, selectedPlanForCheckout.interval_count)}
                </span>
              </div>
            </div>

            {/* Aviso informativo transparente */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 leading-relaxed space-y-1">
                <p className="font-bold text-amber-900">
                  Banco de dados e planos configurados
                </p>
                <p>
                  As regras e o catálogo comercial estão ativos no sistema. O checkout final com processador de pagamento está em fase de habilitação. Nenhuma cobrança foi gerada no seu cartão.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="w-full min-h-[48px] rounded-2xl bg-[#171717] hover:bg-[#262626] text-xs font-bold text-white transition active:scale-[0.98]"
            >
              Compreendido, Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
