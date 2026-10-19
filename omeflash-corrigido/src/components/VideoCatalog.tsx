import React, { useState } from 'react';
import { Search, Crown, Lock, Play, Sparkles, Filter, Eye, Heart, Clock, CheckCircle2 } from 'lucide-react';
import { Video } from '../types';
import { useAuth } from '../context/AuthContext';

interface VideoCatalogProps {
  videos: Video[];
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
  onOpenPlans: () => void;
}

export const VideoCatalog: React.FC<VideoCatalogProps> = ({
  videos,
  isLoading,
  onSelectVideo,
  onOpenPlans,
}) => {
  const { isVip } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAccessible, setOnlyAccessible] = useState<boolean>(false);

  // Extract unique categories
  const categories = ['Todos', 'Conversas Marcantes', 'Encontros VIP', 'Flagras Divertidos', 'Destaques'];

  const filteredVideos = videos.filter((video) => {
    // Category filter
    if (selectedCategory !== 'Todos' && video.category !== selectedCategory) {
      return false;
    }

    // Accessible filter
    if (onlyAccessible && video.isVip && !isVip) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = video.description.toLowerCase().includes(q);
      const matchTags = video.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) {
        return false;
      }
    }

    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF5500] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Catálogo OmeFlash
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Gravações & Encontros Exclusivos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isVip
              ? '✨ Você possui acesso VIP liberado a todos os vídeos do catálogo.'
              : 'Assine um plano para liberar os vídeos marcados com o selo VIP.'}
          </p>
        </div>

        {!isVip && (
          <button
            onClick={onOpenPlans}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Desbloquear Catálogo Completo</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-8">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, assunto ou participante..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/30 focus:border-[#FF5500] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Category Pills (horizontally scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setOnlyAccessible(!onlyAccessible)}
            className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ml-auto border transition-all cursor-pointer ${
              onlyAccessible
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Liberados para mim</span>
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF5500] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Nenhum vídeo encontrado</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Não encontramos nenhum resultado com os filtros selecionados. Tente buscar por outros termos.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Todos');
              setSearchQuery('');
              setOnlyAccessible(false);
            }}
            className="mt-4 text-xs font-bold text-[#FF5500] hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isLocked = video.isVip && !isVip;

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 flex flex-col cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      isLocked ? 'blur-[1px] brightness-90' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    {video.isVip ? (
                      <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                        <Crown className="w-3.5 h-3.5" />
                        VIP
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        GRÁTIS
                      </span>
                    )}

                    {video.featured && (
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        Em Alta
                      </span>
                    )}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-300" />
                    {video.duration}
                  </div>

                  {/* Center Play or Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-90 group-hover:bg-black/40 group-hover:opacity-100 transition-all">
                    {isLocked ? (
                      <div className="w-12 h-12 rounded-full bg-amber-500/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Lock className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Info Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1.5">
                      <span className="text-[#FF5500] font-semibold">{video.category}</span>
                      <span>•</span>
                      <span>{video.views ? `${(video.views / 1000).toFixed(1)}k visualizações` : 'Novo'}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#FF5500] transition-colors mb-2">
                      {video.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {video.description}
                    </p>
                  </div>

                  {/* Footer status & tags */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {video.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {isLocked ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1 text-[11px]">
                        <Lock className="w-3 h-3" />
                        Requer VIP
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        Assistir
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
