import React, { useState } from 'react';
import { Film, Edit3, Trash2, Plus, Eye, Clock, Crown, Search, Play } from 'lucide-react';
import { Video } from '../types';

interface AdminVideoListProps {
  videos: Video[];
  onAddVideo: () => void;
  onEditVideo: (video: Video) => void;
  onDeleteVideo: (id: string) => Promise<void>;
  onWatchVideo: (video: Video) => void;
}

export const AdminVideoList: React.FC<AdminVideoListProps> = ({
  videos,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
  onWatchVideo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este vídeo?')) {
      try {
        setDeleteError(null);
        setDeletingId(id);
        await onDeleteVideo(id);
      } catch (err: any) {
        setDeleteError(err?.message || 'Não foi possível excluir o vídeo.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E8E]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou categoria..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] placeholder-[#8E8E8E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <button
          onClick={onAddVideo}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Vídeo</span>
        </button>
      </div>

      {deleteError && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-3">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="font-bold shrink-0 cursor-pointer" aria-label="Fechar aviso">✕</button>
        </div>
      )}

      {/* MOBILE VIEW: Organized touch-friendly cards (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="p-4 bg-[#F8F7F4] border border-[#E8E6E1] rounded-2xl space-y-3 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 rounded-xl bg-black overflow-hidden shrink-0 relative">
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#646464] border border-[#E8E6E1]">
                    {video.category}
                  </span>
                  {video.isPremium && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/20 flex items-center gap-0.5">
                      <Crown className="w-3 h-3" /> VIP
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#171717] truncate font-['Plus_Jakarta_Sans']" title={video.title}>
                  {video.title}
                </h4>
                <div className="text-[11px] text-[#646464] flex items-center gap-2 mt-1">
                  <span>{video.duration}</span>
                  <span>·</span>
                  <span>{video.views?.toLocaleString('pt-BR') || 0} visualizações</span>
                </div>
              </div>
            </div>

            {/* Mobile Actions: min 44px height for comfort */}
            <div className="pt-2.5 border-t border-[#E8E6E1] flex items-center justify-between gap-2">
              <button
                onClick={() => onWatchVideo(video)}
                className="min-h-[42px] px-3 rounded-xl text-xs font-bold text-[#171717] bg-white hover:bg-[#E8E6E1] border border-[#E8E6E1] flex items-center gap-1.5 flex-1 justify-center cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#171717]" />
                <span>Assistir</span>
              </button>
              <button
                onClick={() => onEditVideo(video)}
                className="min-h-[42px] px-3 rounded-xl text-xs font-bold text-[#171717] bg-white hover:bg-[#E8E6E1] border border-[#E8E6E1] flex items-center gap-1.5 flex-1 justify-center cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(video.id)}
                disabled={deletingId === video.id}
                className="min-h-[42px] px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5 justify-center cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Clean Table (screens >= 768px) */}
      <div className="hidden md:block bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E6E1] bg-[#F8F7F4] text-xs font-bold text-[#646464] uppercase tracking-wider">
                <th className="py-3.5 px-4">Vídeo</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Duração</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Acesso</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE9] text-sm">
              {filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-9 rounded-lg bg-black overflow-hidden shrink-0">
                        <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-xs">
                        <div className="font-bold text-[#171717] truncate font-['Plus_Jakarta_Sans']" title={video.title}>
                          {video.title}
                        </div>
                        <div className="text-xs text-[#646464] truncate">{video.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#171717]">
                    <span className="px-2.5 py-1 rounded-md bg-[#F8F7F4] text-xs font-semibold text-[#171717] border border-[#E8E6E1]">
                      {video.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#646464] text-xs font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8E8E8E]" />
                      {video.duration}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#646464] text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#8E8E8E]" />
                      {video.views?.toLocaleString('pt-BR') || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {video.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/20">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-[#646464] bg-[#F8F7F4] border border-[#E8E6E1]">
                        Geral
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onWatchVideo(video)}
                        title="Assistir prévia"
                        className="p-2 text-[#646464] hover:text-[#171717] hover:bg-[#F8F7F4] rounded-lg transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-[#646464]" />
                      </button>
                      <button
                        onClick={() => onEditVideo(video)}
                        title="Editar vídeo"
                        className="p-2 text-[#646464] hover:text-[#FF6A00] hover:bg-[#FFF2E8] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingId === video.id}
                        title="Excluir vídeo"
                        className="p-2 text-[#646464] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-[#E8E6E1] text-[#646464] text-sm">
          Nenhum vídeo cadastrado ou encontrado.
        </div>
      )}
    </div>
  );
};
