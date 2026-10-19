import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, CreditCard, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { Plan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface StripeSimulatorModalProps {
  plan: Plan;
  sessionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const StripeSimulatorModal: React.FC<StripeSimulatorModalProps> = ({
  plan,
  sessionId,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardName, setCardName] = useState(user?.name || 'Cliente OmeFlash');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate real bank/Stripe latency
      await new Promise((r) => setTimeout(r, 1200));

      const res = await api.simulateCheckoutSuccess(plan.id, sessionId);
      if (res.success) {
        await refreshUser();
        setCompleted(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      alert('Erro na simulação do pagamento: ' + (err.message || 'Tente novamente'));
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        {/* Stripe Header Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#635BFF] flex items-center justify-center text-white font-black text-xs">
              S
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Stripe Checkout</p>
              <p className="text-xs text-amber-400 font-medium">Modo de Teste / Simulação Integrada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Pagamento Confirmado!</h3>
            <p className="text-sm text-gray-600 max-w-xs mb-6">
              Sua assinatura <span className="font-bold text-[#FF5500]">{plan.name}</span> está ativa. O catálogo VIP foi desbloqueado com sucesso!
            </p>
            <div className="text-xs text-gray-400">Redirecionando para o catálogo...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Order Summary */}
            <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Assinatura</p>
                <p className="text-base font-bold text-gray-900">OmeFlash - {plan.name}</p>
                <p className="text-xs text-[#FF5500] font-medium">Cobrança recorrente a cada {plan.periodLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-gray-500 block">/{plan.periodLabel}</span>
              </div>
            </div>

            {/* Simulated Payment Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Informações do Cartão
                </span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Criptografia 256-bit
                </span>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome no Cartão</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Número do Cartão de Teste</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#635BFF] text-white px-2 py-0.5 rounded">
                    VISA TEST
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Validade</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CVC / CVV</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-[#635BFF] hover:bg-[#5349e4] disabled:opacity-75 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando na Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pagar R$ {plan.price.toFixed(2).replace('.', ',')} e Ativar VIP</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-400">
              Ambiente de teste seguro OmeFlash. Seus dados de cartão reais não são cobrados na simulação.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
