import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Video as VideoIcon, 
  Search, 
  Clock, 
  RefreshCw, 
  CreditCard, 
  ArrowRight, 
  Play,
  Users,
  Compass,
  MessageCircleHeart,
  Radio
} from 'lucide-react';
import { Video } from '../types.ts';
import { getPublicVideos, getPublicCategories } from '../lib/api.ts';
import { FALLBACK_VIDEOS, FALLBACK_CATEGORIES } from '../lib/fallbackData.ts';
import { VideoPlayerModal } from './VideoPlayerModal.tsx';

interface PublicHomeProps {
  onNavigateToAdmin: () => void;
  onNavigateToPlans?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigateToAdmin, onNavigateToPlans }) => {
  const [videos, setVideos] = useState<Video[]>(FALLBACK_VIDEOS);
  const [categories, setCategories] = useState<string[]>(['Todas', ...FALLBACK_CATEGORIES]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [videosRes, catsRes] = await Promise.all([
        getPublicVideos(selectedCategory, searchQuery),
        getPublicCategories(),
      ]);

      const fetchedVideos = Array.isArray(videosRes?.videos) ? videosRes.videos : [];
      const fetchedCats = Array.isArray(catsRes?.categories) ? catsRes.categories : [];

      if (fetchedVideos.length > 0 || fetchedCats.length > 0) {
        setVideos(fetchedVideos);
        setCategories(['Todas', ...fetchedCats]);
      } else {
        // Fallback demonstrativo local com busca e categoria
        let localVideos = FALLBACK_VIDEOS;
        if (selectedCategory && selectedCategory !== 'Todas') {
          localVideos = localVideos.filter((v) => v.category === selectedCategory);
        }
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          localVideos = localVideos.filter(
            (v) => v.title.toLowerCase().includes(query) || v.description.toLowerCase().includes(query)
          );
        }
        setVideos(localVideos);
        setCategories(['Todas', ...FALLBACK_CATEGORIES]);
      }
    } catch (err: unknown) {
      console.warn('API de vídeos indisponível, utilizando dados demonstrativos:', err);
      let localVideos = FALLBACK_VIDEOS;
      if (selectedCategory && selectedCategory !== 'Todas') {
        localVideos = localVideos.filter((v) => v.category === selectedCategory);
      }
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        localVideos = localVideos.filter(
          (v) => v.title.toLowerCase().includes(query) || v.description.toLowerCase().includes(query)
        );
      }
      setVideos(localVideos);
      setCategories(['Todas', ...FALLBACK_CATEGORIES]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStartChat = () => {
    const pool = videos.length > 0 ? videos : FALLBACK_VIDEOS;
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setActiveVideo(pool[randomIndex]);
    }
  };

  const handleNextStranger = () => {
    const pool = videos.length > 0 ? videos : FALLBACK_VIDEOS;
    if (pool.length > 1) {
      const remaining = pool.filter((v) => v.id !== activeVideo?.id);
      const nextIndex = Math.floor(Math.random() * remaining.length);
      setActiveVideo(remaining[nextIndex]);
    } else if (pool.length === 1) {
      setActiveVideo(pool[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex flex-col pb-24 sm:pb-16 selection:bg-[#FF6A00] selection:text-white">
      {/* 1. HERO SECTION IMPACTANTE */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-28 border-b border-[#E8E5DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Coluna de Texto e Ação */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              {/* Indicador sutil de proposta */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#646464]">
                <span className="flex h-2 w-2 rounded-full bg-[#FF6A00]" />
                <span className="tracking-wide text-[#171717] font-bold">OmeFlash</span>
                <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                <span>Conexões em tempo real</span>
              </div>

              {/* Título Principal Conforme Instruções */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#171717] leading-[1.08] [text-wrap:balance]">
                Dois desconhecidos.<br />
                <span className="text-[#FF6A00]">Uma conversa.</span><br />
                Ninguém ensaiou.
              </h1>

              {/* Subtítulo Conforme Instruções */}
              <p className="text-base sm:text-xl text-[#646464] max-w-xl leading-relaxed [text-wrap:balance]">
                Conheça alguém novo. Dê uma chance ao acaso. Veja onde a conversa vai parar.
              </p>

              {/* Botão Principal Grande Chamativo na cor Laranja */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-lg">
                <button
                  onClick={handleStartChat}
                  className="group relative flex items-center justify-center gap-3 min-h-[54px] sm:min-h-[60px] px-8 rounded-2xl bg-[#FF6A00] hover:bg-[#E65F00] text-white text-base sm:text-lg font-bold shadow-lg shadow-[#FF6A00]/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="h-5 w-5 fill-current transition-transform duration-200 group-hover:scale-115 group-active:rotate-12" />
                  <span>Começar a conversar</span>
                </button>

                <a
                  href="#conversas"
                  className="flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[60px] px-6 rounded-2xl border border-[#E8E5DD] bg-white hover:bg-[#F2EFE9] text-[#171717] text-sm font-semibold transition active:scale-[0.98] shadow-xs"
                >
                  <Play className="h-4 w-4 fill-current text-[#FF6A00]" />
                  <span>Ver conversas</span>
                </a>
              </div>

              {/* Micro-características sem promessas inventadas */}
              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#646464]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#171717]">Direto no navegador</span>
                </div>
                <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#171717]">Áudio e vídeo de alta definição</span>
                </div>
                <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#171717]">Fácil de alternar</span>
                </div>
              </div>
            </div>

            {/* Coluna Visual do Hero (Preview de Conexão Real OmeFlash) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Moldura da chamada em vídeo */}
                <div 
                  className="relative rounded-3xl overflow-hidden border border-[#E8E5DD] bg-[#171717] shadow-xl group cursor-pointer transition-all hover:border-[#FF6A00]/50"
                  onClick={handleStartChat}
                >
                  <img
                    src="/images/omeflash_hero_connection.jpg"
                    alt="Preview de conversa em vídeo no OmeFlash"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[16/10] sm:aspect-[16/10] object-cover group-hover:scale-103 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/omeflash_hero_call.jpg';
                    }}
                  />

                  {/* Overlay gradiente suave para contraste e elegância */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                  {/* Header da chamada simulada */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px]">
                      <Radio className="h-3 w-3 text-[#FF6A00] animate-pulse" />
                      <span>Conexão ativa</span>
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-mono tabular-nums">
                      04:18
                    </span>
                  </div>

                  {/* Botão Play / Conectar Central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6A00] text-white shadow-xl shadow-[#FF6A00]/40 group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Rodapé do preview */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white text-xs">
                    <div>
                      <p className="font-semibold text-sm">Encontro espontâneo em andamento</p>
                      <p className="text-[11px] text-white/80">Clique para iniciar a sua própria conversa</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF6A00] bg-white px-3 py-1.5 rounded-xl shadow-xs">
                      <Zap className="h-3 w-3 fill-current" />
                      <span>Iniciar</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PROPOSTA DE VALOR & COMO FUNCIONA (SEÇÕES CURTAS REQUERIDAS) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
            A Experiência OmeFlash
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            Conversas reais. Sem filtros, sem roteiro.
          </h2>
          <p className="text-sm sm:text-base text-[#646464] leading-relaxed">
            Feito para quem valoriza a magia de um diálogo genuíno com alguém desconhecido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pilar 1: Conheça pessoas novas */}
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-7 sm:p-8 space-y-4 hover:border-[#FF6A00]/40 transition-colors shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2E8] text-[#FF6A00]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                Conheça pessoas novas
              </h3>
              <p className="text-sm text-[#646464] leading-relaxed">
                Descubra histórias, pontos de vista e personalidades de lugares diferentes. Cada clique conecta você a alguém novo.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#FF6A00] flex items-center gap-1">
              <span>Novas conexões a cada rodada</span>
            </div>
          </div>

          {/* Pilar 2: Conversas espontâneas, sem roteiro */}
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-7 sm:p-8 space-y-4 hover:border-[#FF6A00]/40 transition-colors shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2E8] text-[#FF6A00]">
                <MessageCircleHeart className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                Conversas espontâneas, sem roteiro
              </h3>
              <p className="text-sm text-[#646464] leading-relaxed">
                Nenhum ensaio, sem perfis engessados. Apenas duas pessoas dialogando ao vivo com autenticidade e respeito mútuo.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#FF6A00] flex items-center gap-1">
              <span>Diálogos orgânicos</span>
            </div>
          </div>

          {/* Pilar 3: Uma experiência simples e intuitiva */}
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-7 sm:p-8 space-y-4 hover:border-[#FF6A00]/40 transition-colors shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2E8] text-[#FF6A00]">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                Uma experiência simples e intuitiva
              </h3>
              <p className="text-sm text-[#646464] leading-relaxed">
                Um botão para iniciar. Se a conversa não engatar, basta passar para a próxima com um simples comando e seguir em frente.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#FF6A00] flex items-center gap-1">
              <span>Controle total na ponta dos dedos</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO DE CONVERSAS GRAVADAS & MOMENTOS (#conversas) */}
      <section id="conversas" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-[#E8E5DD]">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                Catálogo em Exibição
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
                Conversas e Momentos em Destaque
              </h2>
              <p className="text-xs sm:text-sm text-[#646464] mt-0.5">
                {(videos || []).length} gravação(ões) disponível(is) para assistir agora
              </p>
            </div>

            {/* Barra de Busca e Filtro */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E8E]" />
                <input
                  type="text"
                  placeholder="Pesquisar por assunto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white pl-10 pr-3 text-xs sm:text-sm text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-xs font-bold text-white transition shrink-0 active:scale-95 shadow-2xs"
              >
                Buscar
              </button>
              {(searchQuery || selectedCategory !== 'Todas') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                    loadData();
                  }}
                  title="Limpar filtros"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition shrink-0 active:scale-95 shadow-2xs"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Categorias Interativas */}
          {(categories || []).length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {(categories || []).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] border border-[#E8E5DD]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feedback de Carregamento / Erro / Vazio */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-3" />
            <p className="text-xs text-[#646464] font-medium">Carregando catálogo do OmeFlash...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-medium">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 min-h-[44px] px-5 rounded-xl bg-[#FF6A00] text-xs font-bold text-white hover:bg-[#E65F00] transition shadow-2xs"
            >
              Recarregar
            </button>
          </div>
        ) : (videos || []).length === 0 ? (
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-8 sm:p-12 text-center max-w-md mx-auto">
            <VideoIcon className="h-8 w-8 text-[#8E8E8E] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#171717]">Nenhuma conversa encontrada</p>
            <p className="mt-1 text-xs text-[#646464]">
              {searchQuery || selectedCategory !== 'Todas'
                ? 'Tente ajustar os filtros ou pesquisar outros termos.'
                : 'Cadastre novos encontros no painel administrativo.'}
            </p>
          </div>
        ) : (
          /* Grade de Cards de Conversas */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {(videos || []).map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group cursor-pointer rounded-2xl border border-[#E8E5DD] bg-white hover:border-[#FF6A00] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col active:scale-[0.99]"
              >
                {/* 16:9 Thumbnail com fallback local resiliente */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#F2EFE9]">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/omeflash_spontaneous_moment.jpg';
                    }}
                  />
                  
                  {/* Gradiente sutil inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[#171717] shadow-md group-hover:bg-[#FF6A00] group-hover:text-white transition">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duração formatada */}
                  {video.duration && (
                    <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-[#171717]/80 px-2 py-0.5 text-[10px] font-mono font-medium text-white backdrop-blur-xs">
                      <Clock className="h-2.5 w-2.5" />
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Conteúdo do Card com Metadados Limpos (Sem Pills) */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Linha de Metadados com separador tipográfico */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#646464] mb-1.5">
                      <span className="font-bold text-[#FF6A00]">{video.category}</span>
                      <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                      <span>{new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#FF6A00] transition-colors line-clamp-1 leading-snug">
                      {video.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-[#646464] line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#EFECE5] flex items-center justify-between text-[11px] text-[#646464]">
                    <span>Áudio & Vídeo HD</span>
                    <span className="font-bold text-[#FF6A00] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Assistir
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SEÇÃO COMERCIAL DE PLANOS E PASSE VIP */}
      {onNavigateToPlans && (
        <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-3xl border border-[#E8E5DD] bg-white p-7 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                Passe VIP OmeFlash
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                Mais conexões, prioridade na fila e sem limites
              </h3>
              <p className="text-xs sm:text-sm text-[#646464] leading-relaxed">
                Desbloqueie filtros de preferência, resolução máxima e recursos exclusivos para quem leva conversas a sério.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onNavigateToPlans}
                className="flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[#FF6A00] hover:bg-[#E65F00] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF6A00]/20 transition active:scale-95 cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>Ver Planos Disponíveis</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. FOOTER OFICIAL OMEFLASH */}
      <footer className="border-t border-[#E8E5DD] py-10 px-4 sm:px-6 lg:px-8 bg-white text-xs text-[#646464]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-tight select-none">
              <span className="text-[#FF6A00]">Ome</span>
              <span className="text-[#171717]">Flash</span>
            </span>
            <span className="text-[#E8E5DD]">·</span>
            <span>Dois desconhecidos. Uma conversa. Ninguém ensaiou.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#conversas" className="hover:text-[#171717] transition">
              Conversas
            </a>
            {onNavigateToPlans && (
              <button onClick={onNavigateToPlans} className="hover:text-[#171717] transition cursor-pointer">
                Planos & VIP
              </button>
            )}
            <button onClick={onNavigateToAdmin} className="hover:text-[#171717] transition font-medium cursor-pointer">
              Acesso Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* Modal do Player de Vídeo com suporte a "Próximo Desconhecido" */}
      <VideoPlayerModal 
        video={activeVideo} 
        onClose={() => setActiveVideo(null)} 
        onNextVideo={handleNextStranger}
      />
    </div>
  );
};
