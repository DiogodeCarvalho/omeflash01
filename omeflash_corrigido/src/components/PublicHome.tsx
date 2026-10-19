import React, { useState } from 'react';
import { Play, Crown, Video as VideoIcon, Zap, Users, Sparkles, Search, Radio, CheckCircle2, Lock } from 'lucide-react';
import { Video } from '../types';

interface PublicHomeProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onNavigateToPlans: () => void;
  isSubscribed?: boolean;
  subscriberName?: string;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  videos,
  onSelectVideo,
  onNavigateToPlans,
  isSubscribed = false,
  subscriberName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const categories = ['Todos', 'Conexões', 'Comunidade', 'Ficção & Tecnologia', 'Natureza', 'Cinema'];

  const filteredVideos = videos.filter((v) => {
    const matchesCategory =
      selectedCategory === 'Todos' ||
      v.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartChat = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (videos.length > 0) {
        onSelectVideo(videos[0]);
      } else {
        document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#F8F7F4] text-[#171717]">
      {/* 1. Primeira Dobra (Hero) - Impactante, Limpa e Direta */}
      <section className="pt-10 sm:pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Tag de status sutil */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-bold tracking-wide">
              <Radio className="w-3.5 h-3.5 animate-pulse-subtle" />
              <span>Conexões em tempo real</span>
            </div>

            {isSubscribed && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>VIP Ativo {subscriberName ? `· Olá, ${subscriberName}` : ''}</span>
              </div>
            )}
          </div>

          {/* Título Principal Exato Solicitado com destaque em Laranja */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#171717] leading-[1.1] font-['Plus_Jakarta_Sans']">
            Dois desconhecidos.<br />
            <span className="text-[#FF6A00]">Uma conversa.</span><br />
            Ninguém ensaiou.
          </h1>

          {/* Texto de Apoio Exato Solicitado */}
          <p className="text-[#646464] text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Conheça alguém novo. Dê uma chance ao acaso. Veja onde a conversa vai parar.
          </p>

          {/* Botão Principal Grande e Chamativo em Laranja #FF6A00 */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={handleStartChat}
              disabled={isConnecting}
              className="w-full sm:w-auto min-h-[52px] sm:min-h-[56px] px-8 py-4 rounded-2xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-extrabold text-base sm:text-lg transition-all duration-200 shadow-md shadow-[#FF6A00]/20 hover:shadow-lg hover:shadow-[#FF6A00]/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 group"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>Começar a conversar</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToPlans}
              className="w-full sm:w-auto min-h-[52px] sm:min-h-[56px] px-6 py-4 rounded-2xl bg-white hover:bg-[#F0EEE9] text-[#171717] border border-[#E8E6E1] font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Crown className="w-4 h-4 text-[#FF6A00]" />
              <span>{isSubscribed ? 'Ver Meus Benefícios VIP' : 'Conhecer Planos VIP'}</span>
            </button>
          </div>

          <p className="text-xs text-[#8E8E8E] font-medium pt-1">
            Transmissões instantâneas · Sem complicação · Acesso direto
          </p>
        </div>
      </section>

      {/* 2. Seções que explicam a experiência - Curtas, sem estatísticas inventadas */}
      <section id="experiencia-section" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Como funciona o <span className="text-[#FF6A00]">Ome</span>Flash
          </h2>
          <p className="text-[#646464] text-sm mt-1.5">
            Três pilares simples para proporcionar interações autênticas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilar 1 */}
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-7 space-y-3 shadow-2xs hover:border-[#FF6A00]/50 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">
              Conheça pessoas novas
            </h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed">
              Abra uma chamada de vídeo e entre em contato imediato com alguém que você nunca viu antes.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-7 space-y-3 shadow-2xs hover:border-[#FF6A00]/50 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">
              Conversas espontâneas, sem roteiro
            </h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed">
              Sem filtros pesados ou perfis engessados. A autenticidade da conversa ao vivo é o que move a plataforma.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-7 space-y-3 shadow-2xs hover:border-[#FF6A00]/50 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">
              Uma experiência simples e intuitiva
            </h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed">
              Interface limpa, navegação rápida e sem distrações. Basta um toque para começar a interagir.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Catálogo de Vídeos e Transmissões */}
      <section id="videos-section" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                Catálogo de Transmissões
              </h2>
              {isSubscribed && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Liberado
                </span>
              )}
            </div>
            <p className="text-[#646464] text-sm mt-1">
              Assista a prévias e conteúdos gravados da comunidade.
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E8E8E]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar vídeos..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E8E6E1] rounded-xl text-[#171717] placeholder-[#8E8E8E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Abas de Categoria com destaque em Laranja */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#E8E6E1]">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6A00] text-white shadow-2xs'
                    : 'text-[#646464] hover:text-[#171717] hover:bg-[#F0EEE9] bg-white border border-[#E8E6E1]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grade de Vídeos (Mobile-first: 1 coluna no celular, 2 em tablet, 3 em desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isVideoUnlocked = !video.isPremium || isSubscribed;

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group bg-white border border-[#E8E6E1] hover:border-[#FF6A00]/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-2xs hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-[#171717] overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Fallback caso a imagem não carregue */}
                  <div className="absolute inset-0 bg-[#262626] flex items-center justify-center -z-10 text-white/30">
                    <VideoIcon className="w-8 h-8" />
                  </div>

                  {/* Duração */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#171717]/85 text-white text-[11px] font-mono">
                    {video.duration}
                  </div>

                  {/* Selo VIP ou Liberado */}
                  {video.isPremium && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      {isSubscribed ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          VIP Liberado
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FF6A00] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Crown className="w-3 h-3" />
                          VIP
                        </span>
                      )}
                    </div>
                  )}

                  {/* Botão Play central */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white text-[#FF6A00] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      {isVideoUnlocked ? (
                        <Play className="w-4 h-4 fill-[#FF6A00] ml-0.5" />
                      ) : (
                        <Lock className="w-4 h-4 text-[#FF6A00]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#FF6A00] transition-colors line-clamp-1 mb-1 font-['Plus_Jakarta_Sans']">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[#646464] line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {/* Metadados */}
                  <div className="mt-3.5 pt-3 border-t border-[#F0EEE9] flex items-center justify-between text-xs text-[#8E8E8E]">
                    <div className="flex items-center gap-1.5">
                      <span>{video.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{video.views?.toLocaleString('pt-BR') || 0} visualizações</span>
                    </div>
                    <span className="text-[#FF6A00] font-bold group-hover:underline flex items-center gap-1">
                      {isVideoUnlocked ? 'Assistir' : 'Desbloquear VIP'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E6E1]">
            <p className="text-[#646464] text-sm font-medium">Nenhum vídeo encontrado para esta categoria ou busca.</p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#FF6A00] font-bold hover:underline cursor-pointer"
            >
              Limpar filtros de busca
            </button>
          </div>
        )}
      </section>

      {/* 4. Chamada Limpa para os Planos de Assinatura */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-[#E8E6E1] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
              <Crown className="w-4 h-4 text-[#FF6A00]" />
              Acesso VIP Recorrente
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
              {isSubscribed
                ? 'Sua assinatura está ativa e você possui acesso total'
                : 'Desbloqueie qualidade máxima e recursos exclusivos'}
            </h3>
            <p className="text-[#646464] text-xs sm:text-sm max-w-xl leading-relaxed">
              Todos os planos garantem 100% de acesso ao catálogo, sem limites de reprodução e com cancelamento fácil a qualquer momento.
            </p>
          </div>

          <button
            onClick={onNavigateToPlans}
            className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>{isSubscribed ? 'Ver Meus Benefícios' : 'Conhecer Planos VIP'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
