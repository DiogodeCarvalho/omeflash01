import React from 'react';
import { Crown, Zap, Play, Sparkles, ShieldCheck, Flame, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onExploreCatalog: () => void;
  onOpenPlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCatalog, onOpenPlans }) => {
  const { isVip } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/25 to-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Tag Pill badge identical to image */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200 bg-orange-50/80 shadow-xs mb-8 transition-transform hover:scale-105">
          <span className="flex items-center text-xs font-semibold text-[#FF5500]">
            <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse text-[#FF5500]" />
            Conexões em tempo real
          </span>
        </div>

        {/* Headline exact copy & layout from image */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-950 tracking-tight leading-[1.08] mb-6">
          Dois<br />
          desconhecidos.<br />
          <span className="text-[#FF5500]">Uma conversa.</span><br />
          Ninguém ensaiou.
        </h1>

        {/* Subtitle from image */}
        <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-10 font-normal">
          Conheça alguém novo. Dê uma chance ao acaso. Veja onde a conversa vai parar.
        </p>

        {/* Action Buttons matching the screenshot exactly */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-3.5 mb-10">
          <button
            onClick={onExploreCatalog}
            className="w-full h-14 bg-[#FF5500] hover:bg-[#e44d00] active:scale-[0.98] text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white text-white" />
            <span>Começar a assistir</span>
          </button>

          <button
            onClick={onOpenPlans}
            className="w-full h-14 bg-white hover:bg-orange-50/50 active:scale-[0.98] text-gray-900 border border-gray-200 hover:border-orange-300 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
          >
            <Crown className="w-5 h-5 text-[#FF5500]" />
            <span>Conhecer Planos VIP</span>
          </button>
        </div>

        {/* Micro-features / Trust line */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 font-medium pt-2 border-t border-gray-100/80 w-full">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Transmissões instantâneas
          </span>
          <span className="text-gray-300">•</span>
          <span>Sem complicação</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#FF5500] font-semibold">Acesso VIP ilimitado</span>
        </div>
      </div>
    </section>
  );
};
