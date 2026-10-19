import React, { useState } from 'react';
import { X, Copy, Check, ShieldAlert, Key, Globe, Terminal, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StripeGuideModal: React.FC = () => {
  const { stripeGuideOpen, closeStripeGuide } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!stripeGuideOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com';
  const webhookUrl = `${currentHost}/api/stripe/webhook`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center font-black text-sm">
              S
            </div>
            <div>
              <h2 className="text-base font-bold">Guia Oficial de Integração Stripe & Produção</h2>
              <p className="text-xs text-slate-300">Como conectar suas chaves reais e habilitar pagamentos em produção</p>
            </div>
          </div>

          <button
            onClick={closeStripeGuide}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed">
          {/* Important Compliance Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm mb-1">
                Aviso Importante: Política de Conteúdo da Stripe
              </p>
              <p className="text-amber-800">
                A Stripe possui diretrizes estritas sobre vídeos, streaming e conteúdo adulto/relacionamento (Restricted Businesses). 
                Certifique-se de que o catálogo do OmeFlash (gravações de conversas e encontros de bate-papo) respeita os Termos de Serviço da Stripe antes de ativar a conta para produção ao vivo.
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">1</span>
              Obter Chaves de API na Stripe
            </h3>
            <p className="text-gray-600">
              Acesse o <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-[#635BFF] font-semibold underline inline-flex items-center gap-1">Stripe Dashboard &gt; Developers &gt; API Keys <ExternalLink className="w-3 h-3" /></a> e copie suas chaves:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between">
                <span>STRIPE_SECRET_KEY="sk_test_..."</span>
                <button
                  onClick={() => copyToClipboard('STRIPE_SECRET_KEY="sk_test_..."', 'sk')}
                  className="text-gray-400 hover:text-gray-700"
                >
                  {copiedKey === 'sk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>STRIPE_PUBLISHABLE_KEY="pk_test_..."</span>
                <button
                  onClick={() => copyToClipboard('STRIPE_PUBLISHABLE_KEY="pk_test_..."', 'pk')}
                  className="text-gray-400 hover:text-gray-700"
                >
                  {copiedKey === 'pk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">2</span>
              Configurar o Endpoint do Webhook na Stripe
            </h3>
            <p className="text-gray-600">
              No painel da Stripe em <a href="https://dashboard.stripe.com/test/webhooks" target="_blank" rel="noopener noreferrer" className="text-[#635BFF] font-semibold underline inline-flex items-center gap-1">Webhooks <ExternalLink className="w-3 h-3" /></a>, clique em <strong>Adicionar Endpoint</strong> e insira o URL exato do seu backend:
            </p>
            <div className="bg-gray-900 text-amber-300 font-mono text-[11px] p-3 rounded-xl flex items-center justify-between break-all">
              <span>{webhookUrl}</span>
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="ml-2 text-gray-400 hover:text-white shrink-0"
              >
                {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Selecione os seguintes eventos para escutar:
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">checkout.session.completed</code>
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">customer.subscription.created</code>
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">customer.subscription.updated</code>
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">customer.subscription.deleted</code>
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">invoice.payment_succeeded</code>
              <br />
              • <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">invoice.payment_failed</code>
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">3</span>
              Adicionar o Segredo do Webhook (STRIPE_WEBHOOK_SECRET)
            </h3>
            <p className="text-gray-600">
              Após criar o endpoint, clique em "Revelar segredo de assinatura" (<code className="bg-gray-100 px-1 py-0.5 rounded">whsec_...</code>) e adicione no arquivo <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">.env</code> da sua hospedagem:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-[11px] flex items-center justify-between">
              <span>STRIPE_WEBHOOK_SECRET="whsec_..."</span>
              <button
                onClick={() => copyToClipboard('STRIPE_WEBHOOK_SECRET="whsec_..."', 'whsec')}
                className="text-gray-400 hover:text-gray-700"
              >
                {copiedKey === 'whsec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Test Flow */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <h4 className="font-bold text-emerald-950 text-xs mb-1">Como Testar Agora Mesmo:</h4>
            <ol className="list-decimal list-inside space-y-1 text-emerald-900 text-[11px]">
              <li>Acesse o menu e clique em <strong>Entrar</strong> &gt; use a conta rápida <strong>Comum</strong> (sem VIP).</li>
              <li>Tente clicar em qualquer vídeo com selo <strong>VIP</strong>: o vídeo será bloqueado na interface e no backend.</li>
              <li>Clique em <strong>Conhecer Planos VIP</strong> e selecione um plano.</li>
              <li>O simulador integrado Stripe irá confirmar a transação e atualizar o status no banco de dados.</li>
              <li>O vídeo VIP será liberado imediatamente para assistir!</li>
              <li>No <strong>Painel Admin</strong>, você pode cancelar a assinatura ou disparar webhooks de teste para conferir o bloqueio instantâneo.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={closeStripeGuide}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
