import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  LogOut,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { SubscriberUser, Subscription } from '../types';
import { api } from '../lib/api';

interface SubscriberAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: SubscriberUser | null;
  onSubscriptionUpdated: (updatedSub: Subscription) => void;
  onLogout: () => void;
  onNavigateToPlans: () => void;
}

export const SubscriberAccountModal: React.FC<SubscriberAccountModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  onSubscriptionUpdated,
  onLogout,
  onNavigateToPlans,
}) => {
  if (!isOpen || !subscriber) return null;

  const subscription = subscriber.subscription;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    try {
      setIsUpdating(true);
      const updated = await api.cancelSubscription(subscriber.id);
      onSubscriptionUpdated(updated);
      setCancelModalOpen(false);
      setFeedbackMessage('Sua assinatura foi cancelada. Não haverá novas renovações.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao cancelar assinatura');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsUpdating(true);
      const updated = await api.reactivateSubscription(subscriber.id);
      onSubscriptionUpdated(updated);
      setFeedbackMessage('Assinatura reativada com sucesso! Renovação automática ativa.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao reativar assinatura');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#F8F7F4] border-b border-[#E8E6E1] p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              {subscriber.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171717] font-['Plus_Jakarta_Sans'] leading-tight">
                Minha Conta e Assinatura
              </h2>
              <p className="text-xs text-[#646464]">{subscriber.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#646464] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {feedbackMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Active Subscription Details */}
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Assinatura Recorrente
                </span>
                {subscription.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ativa & Renovação Automática
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Cancelada (Sem novas renovações)
                  </span>
                )}
              </div>

              {/* Subscription Card */}
              <div className="bg-[#F8F7F4] border border-[#E8E6E1] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E6E1] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#171717] font-['Plus_Jakarta_Sans']">
                      {subscription.planName}
                    </h3>
                    <div className="text-xs text-[#646464] mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>Acesso a 100% de todo o catálogo de vídeos liberado</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-extrabold text-[#FF6A00] font-['Plus_Jakarta_Sans']">
                      R$ {subscription.price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[11px] text-[#646464]">por {subscription.period}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#646464]">
                    <Calendar className="w-4 h-4 text-[#8E8E8E]" />
                    <span>Início: <strong className="text-[#171717]">{subscription.startDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#646464]">
                    <Calendar className="w-4 h-4 text-[#8E8E8E]" />
                    <span>Próxima Renovação: <strong className="text-[#171717]">{subscription.nextBillingDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#646464]">
                    {subscription.paymentMethod === 'pix' ? (
                      <QrCode className="w-4 h-4 text-[#FF6A00]" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-[#FF6A00]" />
                    )}
                    <span>
                      Pagamento: <strong className="text-[#171717]">
                        {subscription.paymentMethod === 'pix'
                          ? 'PIX Recorrente'
                          : `${subscription.cardBrand || 'Cartão'} final ${subscription.cardLast4 || '4242'}`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#646464]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Segurança: <strong className="text-emerald-700 font-bold">Cobrança Protegida</strong></span>
                  </div>
                </div>

                {/* Cancel or Reactivate Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  {subscription.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Cancelar Assinatura
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReactivateSubscription}
                      disabled={isUpdating}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#E55F00] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reativar Assinatura</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPlans();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#171717] bg-white hover:bg-[#E8E6E1] border border-[#E8E6E1] transition-colors cursor-pointer"
                  >
                    Ver Outros Planos
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* No subscription state */
            <div className="text-center py-8 bg-[#F8F7F4] border border-[#E8E6E1] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#171717]">Você ainda não possui um plano ativo</h3>
              <p className="text-xs text-[#646464] max-w-sm mx-auto">
                Assine agora para desbloquear 100% de todos os vídeos e transmissões sem restrições.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPlans();
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Escolher um Plano
              </button>
            </div>
          )}

          {/* Payment History / Invoices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#FF6A00]" />
                Histórico de Faturas & Pagamentos
              </span>
              <span className="text-[11px] text-[#8E8E8E]">
                {subscriber.invoices?.length || 0} faturas
              </span>
            </div>

            <div className="space-y-2">
              {subscriber.invoices && subscriber.invoices.length > 0 ? (
                subscriber.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 bg-white border border-[#E8E6E1] rounded-xl flex items-center justify-between text-xs hover:border-[#FF6A00]/40 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-[#171717]">{inv.planName}</div>
                      <div className="text-[11px] text-[#646464]">
                        {inv.date} · {inv.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-[#171717]">
                        R$ {inv.amount.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Aprovado
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-[#8E8E8E] bg-[#F8F7F4] rounded-xl border border-[#E8E6E1]">
                  Nenhuma fatura registrada anteriormente.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F7F4] border-t border-[#E8E6E1] p-4 px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-[#646464] hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#E8E6E1] border border-[#E8E6E1] rounded-xl text-xs font-semibold text-[#171717] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Modal to Cancel Subscription */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-[#E8E6E1] rounded-3xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-[#171717]">Deseja cancelar sua assinatura?</h3>
              <p className="text-xs text-[#646464] leading-relaxed">
                Ao cancelar, sua assinatura não será renovada no próximo ciclo ({subscription?.nextBillingDate}).
                Você continuará tendo acesso até essa data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 rounded-xl border border-[#E8E6E1] text-xs font-bold text-[#171717] hover:bg-[#F8F7F4] transition-colors cursor-pointer"
              >
                Voltar e Manter
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isUpdating}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUpdating ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
