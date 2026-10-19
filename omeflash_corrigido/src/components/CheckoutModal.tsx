import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Plan, SubscriberUser, Subscription } from '../types';
import { api } from '../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: Plan | null;
  currentSubscriber: SubscriberUser | null;
  onClose: () => void;
  onSuccess: (user: SubscriberUser, subscription: Subscription) => void;
  onOpenSubscriberLogin: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  plan,
  currentSubscriber,
  onClose,
  onSuccess,
  onOpenSubscriberLogin,
}) => {
  if (!isOpen || !plan) return null;

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');

  // Account creation state (if not logged in)
  const [name, setName] = useState(currentSubscriber?.name || '');
  const [email, setEmail] = useState(currentSubscriber?.email || '');
  const [password, setPassword] = useState('');

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState(currentSubscriber?.name || 'DIOGO SILVA');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardCpf, setCardCpf] = useState('123.456.789-00');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [successData, setSuccessData] = useState<{ user: SubscriberUser; subscription: Subscription } | null>(null);

  // PIX Code Simulation
  const pixCode = `00020126580014br.gov.bcb.pix0136omeflash-${plan.id}-${Date.now()}520400005303986540${plan.price.toFixed(2)}5802BR5916OMEFLASH STREAM6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleFormatCard = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleFormatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!currentSubscriber) {
      if (!email.trim() || !email.includes('@')) {
        setError('Por favor, informe um e-mail válido para a sua conta.');
        return;
      }
      if (!password.trim() || password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
    }

    try {
      setIsProcessing(true);
      setProcessingStep('Conectando ao gateway de pagamento seguro...');

      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Validando dados e autorização bancária...');

      await new Promise((r) => setTimeout(r, 700));
      setProcessingStep('Ativando assinatura recorrente e liberando catálogo...');

      const result = await api.subscribeToPlan({
        userId: currentSubscriber?.id,
        userName: currentSubscriber ? currentSubscriber.name : name,
        userEmail: currentSubscriber ? currentSubscriber.email : email,
        userPassword: password,
        planId: plan.id,
        paymentMethod,
        cardNumber,
        cardHolder,
      });

      await new Promise((r) => setTimeout(r, 400));
      setIsProcessing(false);
      setSuccessData({ user: result.user, subscription: result.subscription });
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Falha ao processar assinatura. Tente novamente.');
    }
  };

  const handleFinishSuccess = () => {
    if (successData) {
      onSuccess(successData.user, successData.subscription);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#F8F7F4] border-b border-[#E8E6E1] p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center text-white font-bold">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#171717] font-['Plus_Jakarta_Sans'] leading-tight">
                Checkout Seguro · <span className="text-[#FF6A00]">Ome</span>Flash
              </h3>
              <p className="text-xs text-[#646464]">Assinatura recorrente com ativação imediata</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#646464] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
            aria-label="Fechar checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          {successData ? (
            /* Success View */
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#FFF2E8] border-2 border-[#FF6A00] text-[#FF6A00] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FFF2E8] px-3 py-1 rounded-full">
                  Assinatura Confirmada
                </span>
                <h3 className="text-2xl font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
                  Parabéns, seu acesso VIP está ativo!
                </h3>
                <p className="text-xs sm:text-sm text-[#646464] max-w-sm mx-auto leading-relaxed">
                  Você agora tem acesso ilimitado a <strong>100% de todo o catálogo de vídeos</strong> em qualidade máxima.
                </p>
              </div>

              {/* Subscription Summary Card */}
              <div className="bg-[#F8F7F4] border border-[#E8E6E1] rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E6E1]">
                  <span className="text-[#646464]">Plano Selecionado:</span>
                  <strong className="text-[#171717] font-bold">{plan.name}</strong>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E6E1]">
                  <span className="text-[#646464]">Valor do Ciclo:</span>
                  <strong className="text-[#FF6A00] font-extrabold text-sm">
                    R$ {plan.price.toFixed(2).replace('.', ',')}/{plan.period}
                  </strong>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E6E1]">
                  <span className="text-[#646464]">Próxima Renovação:</span>
                  <span className="text-[#171717] font-semibold">{successData.subscription.nextBillingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#646464]">Status da Conta:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ativa & Liberada
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinishSuccess}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-[#FF6A00] hover:bg-[#E55F00] shadow-md shadow-[#FF6A00]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Começar a Assistir Agora (100% Liberado)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Plan Summary Banner */}
              <div className="rounded-2xl p-4 bg-[#FFF2E8] border border-[#FF6A00]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6A00]">
                    Plano Escolhido
                  </span>
                  <div className="text-base font-extrabold text-[#171717] font-['Plus_Jakarta_Sans']">
                    {plan.name}
                  </div>
                  <div className="text-[11px] text-[#646464] mt-0.5">
                    Acesso integral a 100% dos vídeos · Cancele quando quiser
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-[#FF6A00] font-['Plus_Jakarta_Sans']">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-[11px] text-[#646464] font-medium">/{plan.period}</div>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Subscriber Account Details (If not logged in) */}
              {!currentSubscriber ? (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      Crie sua conta de assinante
                    </span>
                    <button
                      type="button"
                      onClick={onOpenSubscriberLogin}
                      className="text-xs text-[#FF6A00] font-bold hover:underline cursor-pointer"
                    >
                      Já possui conta? Entrar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#646464] mb-1">Seu Nome</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Diogo Silva"
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#646464] mb-1">
                        E-mail de Acesso <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#646464] mb-1">
                      Defina sua Senha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo de 4 caracteres"
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Already logged in subscriber identity badge */
                <div className="p-3 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
                      {currentSubscriber.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <strong className="text-[#171717]">{currentSubscriber.name}</strong>
                      <div className="text-[#646464] text-[11px]">{currentSubscriber.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Conta Conectada
                  </span>
                </div>
              )}

              {/* Step 2: Payment Method Selection */}
              <div className="space-y-3.5 pt-1">
                <span className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px]">
                    {currentSubscriber ? '1' : '2'}
                  </span>
                  Escolha a Forma de Pagamento
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-[#FF6A00] bg-[#FFF2E8] shadow-xs ring-1 ring-[#FF6A00]'
                        : 'border-[#E8E6E1] bg-white hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 ${paymentMethod === 'credit_card' ? 'text-[#FF6A00]' : 'text-[#646464]'}`}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">Cartão de Crédito</div>
                      <div className="text-[10px] text-[#646464]">Recorrente Automático</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-[#FF6A00] bg-[#FFF2E8] shadow-xs ring-1 ring-[#FF6A00]'
                        : 'border-[#E8E6E1] bg-white hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <QrCode
                      className={`w-4 h-4 ${paymentMethod === 'pix' ? 'text-[#FF6A00]' : 'text-[#646464]'}`}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">PIX Recorrente</div>
                      <div className="text-[10px] text-[#646464]">Aprovação Imediata</div>
                    </div>
                  </button>
                </div>

                {/* Credit Card Form Fields */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-3 bg-[#F8F7F4] border border-[#E8E6E1] p-4 rounded-2xl animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-[#646464] mb-1">
                        Número do Cartão de Crédito
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleFormatCard(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                          className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs font-mono text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        />
                        <div className="absolute right-3 top-2 flex items-center gap-1">
                          <span className="text-[9px] font-bold bg-[#171717] text-white px-1.5 py-0.5 rounded">
                            MASTER
                          </span>
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                            VISA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#646464] mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs uppercase text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#646464] mb-1">Validade</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => handleFormatExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs font-mono text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#646464] mb-1">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs font-mono text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#646464] mb-1">CPF Titular</label>
                        <input
                          type="text"
                          required
                          value={cardCpf}
                          onChange={(e) => setCardCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX Recorrente Form */}
                {paymentMethod === 'pix' && (
                  <div className="space-y-3.5 bg-[#F8F7F4] border border-[#E8E6E1] p-4 rounded-2xl animate-fade-in text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      PIX Automático · Liberação em 3 segundos
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#E8E6E1] inline-block shadow-2xs">
                      {/* Stylized QR Code SVG */}
                      <svg
                        className="w-36 h-36 mx-auto text-[#171717]"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        <rect width="100" height="100" fill="white" />
                        <path d="M10,10 h24 v24 h-24 z M14,14 v16 h16 v-16 z M18,18 h8 v8 h-8 z" />
                        <path d="M66,10 h24 v24 h-24 z M70,14 v16 h16 v-16 z M74,18 h8 v8 h-8 z" />
                        <path d="M10,66 h24 v24 h-24 z M14,70 v16 h16 v-16 z M18,74 h8 v8 h-8 z" />
                        <rect x="42" y="10" width="8" height="8" />
                        <rect x="52" y="18" width="6" height="8" />
                        <rect x="42" y="30" width="16" height="6" />
                        <rect x="10" y="42" width="8" height="16" />
                        <rect x="22" y="46" width="12" height="6" />
                        <rect x="38" y="42" width="24" height="16" fill="#FF6A00" />
                        <rect x="66" y="42" width="10" height="8" />
                        <rect x="80" y="46" width="10" height="12" />
                        <rect x="42" y="66" width="12" height="10" />
                        <rect x="58" y="70" width="14" height="8" />
                        <rect x="76" y="66" width="14" height="24" />
                        <rect x="42" y="80" width="26" height="10" />
                      </svg>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-[#646464]">
                        Código Copia e Cola PIX:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixCode}
                          className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-xl text-[10px] font-mono text-[#646464] truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="min-h-[36px] px-3 rounded-xl bg-white hover:bg-[#E8E6E1] border border-[#E8E6E1] text-[#171717] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#646464] pt-1">
                        Abra o app do seu banco, escolha <strong>Pagar via PIX</strong> e confirme. A simulação abaixo confirma instantaneamente.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full min-h-[50px] py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-[#FF6A00] hover:bg-[#E55F00] shadow-md shadow-[#FF6A00]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Confirmar Assinatura (R$ {plan.price.toFixed(2).replace('.', ',')}/{plan.period})
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#8E8E8E]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Ambiente 100% Criptografado
                  </span>
                  <span>·</span>
                  <span>Cancelamento fácil a qualquer momento</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
