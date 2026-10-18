import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Tag,
  X,
  Play
} from 'lucide-react';
import { Video, VideoStatus } from '../types.ts';
import { getAdminVideos, updateAdminVideoStatus, deleteAdminVideo } from '../lib/api.ts';
import { VideoPlayerModal } from './VideoPlayerModal.tsx';

interface AdminVideoListProps {
  onAddNew: () => void;
  onEditVideo: (video: Video) => void;
}

export const AdminVideoList: React.FC<AdminVideoListProps> = ({ onAddNew, onEditVideo }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // Modal de Exclusão
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de Detalhes
  const [videoToView, setVideoToView] = useState<Video | null>(null);

  // Modal de Reprodução
  const [videoToPlay, setVideoToPlay] = useState<Video | null>(null);

  // Feedback de Sucesso
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminVideos({
        search,
        status: statusFilter,
        category: categoryFilter,
      });
      setVideos(Array.isArray(res?.videos) ? res.videos : []);
      setCategories(['Todas', ...(Array.isArray(res?.categories) ? res.categories : [])]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao listar vídeos.';
      setError(msg);
      setVideos([]);
      setCategories(['Todas']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos();
  };

  const handleToggleStatus = async (video: Video) => {
    const newStatus: VideoStatus = video.status === 'published' ? 'draft' : 'published';
    try {
      await updateAdminVideoStatus(video.id, newStatus);
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, status: newStatus } : v))
      );
      setFeedback(`Status de "${video.title}" alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}.`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao alterar status.';
      setError(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      setDeleting(true);
      await deleteAdminVideo(videoToDelete.id);
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      setFeedback(`Vídeo "${videoToDelete.title}" excluído do banco de dados.`);
      setVideoToDelete(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir vídeo.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171717] flex items-center gap-2">
            <Film className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF6A00]" />
            Gerenciamento de Vídeos
          </h1>
          <p className="text-xs sm:text-sm text-[#646464] mt-0.5">
            Cadastre, pesquise, edite e controle o status do acervo salvo no banco de dados.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] px-5 text-xs font-bold text-white shadow-sm shadow-[#FF6A00]/20 transition active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Vídeo</span>
        </button>
      </div>

      {/* Alertas de Feedback / Erro */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros e Pesquisa */}
      <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Pesquisa por título */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E8E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vídeos por título..."
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white pl-10 pr-3 text-xs text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:outline-none"
            />
          </form>

          {/* Filtro por Status (Segmented control) */}
          <div className="flex items-center p-1 rounded-xl bg-[#F2EFE9] border border-[#E8E5DD] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[36px] px-3 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'all'
                  ? 'bg-white text-[#171717] font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`min-h-[36px] px-3 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`min-h-[36px] px-3 rounded-lg font-medium transition active:scale-95 ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-[#646464] hover:text-[#171717]'
              }`}
            >
              Rascunhos
            </button>
          </div>

          {/* Filtro por Categoria */}
          {categories.length > 1 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'Todas' ? 'Todas as Categorias' : c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchVideos}
            title="Recarregar lista"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition shrink-0 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* LISTAGEM: MOBILE-FIRST CARDS (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center text-[#646464]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-2" />
            <p className="text-xs">Consultando banco de dados...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E5DD] bg-white p-8 text-center text-[#646464]">
            <Film className="mx-auto h-8 w-8 text-[#8E8E8E] mb-2" />
            <p className="font-bold text-[#171717] text-sm">Nenhum vídeo encontrado</p>
            <p className="text-xs text-[#646464] mt-1">Ajuste os filtros ou cadastre um novo vídeo.</p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl border border-[#E8E5DD] bg-white p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                {/* Miniatura 16:9 */}
                <div
                  onClick={() => setVideoToPlay(video)}
                  className="relative h-16 w-28 rounded-xl overflow-hidden bg-[#171717] shrink-0 cursor-pointer active:scale-95 transition"
                >
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/images/omeflash_spontaneous_moment.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#646464] mb-0.5">
                    <span className="font-bold text-[#FF6A00]">{video.category}</span>
                    {video.duration && (
                      <>
                        <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                        <span className="font-mono text-[#171717]">{video.duration}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#171717] line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#646464] line-clamp-1 mt-0.5">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(video)}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                    video.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title="Clique para alternar o status"
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span>{video.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVideoToView(video)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] active:scale-95"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditVideo(video)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] active:scale-95"
                    title="Editar vídeo"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setVideoToDelete(video)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95"
                    title="Excluir vídeo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LISTAGEM: DESKTOP TABLE (hidden md:block) */}
      <div className="hidden md:block rounded-2xl border border-[#E8E5DD] bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8E5DD] bg-[#F8F7F4] text-[11px] font-bold text-[#646464] uppercase tracking-wider">
              <th className="py-3.5 px-4">Vídeo</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4">Duração</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Data de Criação</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE5] text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#646464]">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent mb-2" />
                  <p>Consultando banco de dados...</p>
                </td>
              </tr>
            ) : videos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#646464]">
                  <Film className="mx-auto h-8 w-8 text-[#8E8E8E] mb-2" />
                  <p className="font-bold text-[#171717]">Nenhum vídeo encontrado</p>
                  <p className="text-[11px] text-[#646464] mt-1">
                    {search || statusFilter !== 'all' || categoryFilter !== 'Todas'
                      ? 'Tente remover os filtros ou redefinir a busca.'
                      : 'Comece adicionando seu primeiro vídeo através do botão "Cadastrar Novo Vídeo".'}
                  </p>
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id} className="hover:bg-[#F8F7F4] transition group">
                  {/* Thumbnail + Título + Descrição */}
                  <td className="py-3.5 px-4 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setVideoToPlay(video)}
                        className="relative h-14 w-24 rounded-lg overflow-hidden bg-[#171717] shrink-0 cursor-pointer group-hover:ring-2 ring-[#FF6A00]/50 transition"
                      >
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/images/omeflash_spontaneous_moment.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="h-5 w-5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#171717] truncate group-hover:text-[#FF6A00] transition">
                          {video.title}
                        </p>
                        <p className="text-[11px] text-[#646464] line-clamp-1 mt-0.5">
                          {video.description}
                        </p>
                        <span className="text-[10px] text-[#8E8E8E] font-mono">
                          ID: {video.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#171717] font-medium">
                    {video.category}
                  </td>

                  {/* Duração */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#646464] font-mono">
                    {video.duration || '—'}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(video)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        video.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Clique para alternar o status"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{video.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                    </button>
                  </td>

                  {/* Data */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#646464] font-mono text-[11px]">
                    {new Date(video.created_at).toLocaleDateString('pt-BR')}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setVideoToView(video)}
                        className="rounded-lg p-1.5 text-[#646464] hover:bg-[#F2EFE9] hover:text-[#171717] transition"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditVideo(video)}
                        className="rounded-lg p-1.5 text-[#646464] hover:bg-[#F2EFE9] hover:text-[#171717] transition"
                        title="Editar vídeo"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setVideoToDelete(video)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                        title="Excluir vídeo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Vídeo */}
      {videoToView && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setVideoToView(null)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl bg-white border border-[#E8E5DD] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
              <h3 className="text-base font-bold text-[#171717]">Detalhes do Registro</h3>
              <button
                onClick={() => setVideoToView(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#646464] hover:text-[#171717] -mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#646464] block mb-0.5">Título</span>
                <p className="font-bold text-[#171717] text-sm">{videoToView.title}</p>
              </div>

              <div>
                <span className="text-[#646464] block mb-0.5">Descrição</span>
                <p className="text-[#171717] leading-relaxed bg-[#F8F7F4] p-3 rounded-2xl border border-[#E8E5DD]">
                  {videoToView.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#646464] block mb-0.5">Categoria</span>
                  <p className="text-[#171717] font-semibold">{videoToView.category}</p>
                </div>
                <div>
                  <span className="text-[#646464] block mb-0.5">Duração</span>
                  <p className="text-[#171717] font-mono">{videoToView.duration || 'Não especificada'}</p>
                </div>
                <div>
                  <span className="text-[#646464] block mb-0.5">Status</span>
                  <p className={videoToView.status === 'published' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {videoToView.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </p>
                </div>
                <div>
                  <span className="text-[#646464] block mb-0.5">Criado em</span>
                  <p className="text-[#171717] font-mono">{new Date(videoToView.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <span className="text-[#646464] block mb-0.5">UUID</span>
                <p className="font-mono text-[11px] text-[#8E8E8E] break-all select-all">{videoToView.id}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E5DD] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setVideoToView(null);
                  onEditVideo(videoToView);
                }}
                className="min-h-[44px] px-4 rounded-xl border border-[#E8E5DD] bg-white hover:bg-[#F2EFE9] text-xs font-semibold text-[#171717] transition"
              >
                Editar
              </button>
              <button
                onClick={() => setVideoToView(null)}
                className="min-h-[44px] px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-xs font-bold text-white transition shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {videoToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !deleting && setVideoToDelete(null)}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white border border-[#E8E5DD] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Excluir Vídeo</h3>
                <p className="text-xs text-[#646464]">Esta ação é irreversível no banco de dados.</p>
              </div>
            </div>

            <p className="text-xs text-[#646464] leading-relaxed">
              Você tem certeza de que deseja remover o vídeo <strong className="text-[#171717]">"{videoToDelete.title}"</strong> permanentemente?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setVideoToDelete(null)}
                disabled={deleting}
                className="min-h-[44px] px-4 rounded-xl border border-[#E8E5DD] bg-white hover:bg-[#F2EFE9] text-xs font-medium text-[#171717] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {deleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{deleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      <VideoPlayerModal video={videoToPlay} onClose={() => setVideoToPlay(null)} />
    </div>
  );
};
