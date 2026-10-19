import React from 'react';
import { Users, CreditCard, QrCode, CheckCircle2, Clock, Crown, Mail, Calendar } from 'lucide-react';
import { SubscriberUser } from '../types';

interface AdminSubscriberListProps {
  subscribers: SubscriberUser[];
}

export const AdminSubscriberList: React.FC<AdminSubscriberListProps> = ({ subscribers }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6A00]" />
            <span>Assinantes e Cobranças Recorrentes ({subscribers.length})</span>
          </h2>
          <p className="text-xs text-[#646464] mt-0.5">
            Lista de usuários cadastrados, planos ativos e histórico de pagamentos recorrentes.
          </p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-12 bg-[#F8F7F4] border border-[#E8E6E1] rounded-2xl">
          <Users className="w-10 h-10 text-[#8E8E8E] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#171717]">Nenhum assinante cadastrado</h3>
          <p className="text-xs text-[#646464] mt-1">Os novos assinantes aparecerão aqui assim que contratarem um plano.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-[#646464] font-bold">
                <th className="pb-3 pl-2">Assinante</th>
                <th className="pb-3">Plano</th>
                <th className="pb-3">Valor / Ciclo</th>
                <th className="pb-3">Pagamento</th>
                <th className="pb-3">Próx. Cobrança</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE9]">
              {subscribers.map((sub) => {
                const s = sub.subscription;
                const isActive = s && s.status === 'active';

                return (
                  <tr key={sub.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="font-bold text-[#171717]">{sub.name}</div>
                      <div className="text-[#646464] text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#8E8E8E]" />
                        {sub.email}
                      </div>
                    </td>

                    <td className="py-3.5">
                      {s ? (
                        <span className="font-semibold text-[#171717] flex items-center gap-1">
                          <Crown className="w-3 h-3 text-[#FF6A00]" />
                          {s.planName}
                        </span>
                      ) : (
                        <span className="text-[#8E8E8E]">Sem plano ativo</span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {s ? (
                        <span className="font-bold text-[#171717] font-['Plus_Jakarta_Sans']">
                          R$ {s.price.toFixed(2).replace('.', ',')}/{s.period}
                        </span>
                      ) : (
                        <span className="text-[#8E8E8E]">-</span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {s ? (
                        <span className="text-[#646464] flex items-center gap-1.5">
                          {s.paymentMethod === 'pix' ? (
                            <QrCode className="w-3.5 h-3.5 text-[#FF6A00]" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-[#FF6A00]" />
                          )}
                          <span>
                            {s.paymentMethod === 'pix'
                              ? 'PIX Recorrente'
                              : `${s.cardBrand || 'Cartão'} **** ${s.cardLast4 || '4242'}`}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#8E8E8E]">-</span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {s ? (
                        <span className="text-[#646464] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8E8E8E]" />
                          {s.nextBillingDate}
                        </span>
                      ) : (
                        <span className="text-[#8E8E8E]">-</span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Ativa
                        </span>
                      ) : s?.status === 'canceled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Cancelada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F7F4] text-[#8E8E8E] border border-[#E8E6E1]">
                          Gratuito
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
