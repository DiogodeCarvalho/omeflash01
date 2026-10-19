import React, { useState, useEffect } from 'react';
import { X, Film, Check, AlertCircle } from 'lucide-react';
import { Video } from '../types';

interface AdminVideoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoData: Omit<Video, 'id' | 'views'>, id?: string) => Promise<void>;
  editingVideo: Video | null;
}

export const AdminVideoForm: React.FC<AdminVideoFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingVideo,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Conexões');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('10:00');
  const [isPremium, setIsPremium] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description);
      setCategory(editingVideo.category);
      setVideoUrl(editingVideo.videoUrl);
      setThumbnailUrl(editingVideo.thumbnailUrl);
      setDuration(editingVideo.duration);
      setIsPremium(editingVideo.isPremium);
      setTagsInput(editingVideo.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Conexões');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setThumbnailUrl('/images/omeflash_hero_connection.jpg');
      setDuration('12:00');
      setIsPremium(false);
      setTagsInput('hd, flash, ao vivo');
    }
    setError(null);
  }, [editingVideo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setError('Título e URL do vídeo são obrigatórios.');
      return;
    }
    if (!/^(https?:\/\/|\/)/i.test(videoUrl.trim())) {
      setError('A URL do vídeo deve começar com http://, https:// ou /.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          videoUrl: videoUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || '/images/omeflash_hero_connection.jpg',
          duration: duration.trim() || '10:00',
          isPremium,
          tags,
        },
        editingVideo?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar vídeo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-[#E8E6E1] rounded-3xl p-6 sm:p-8 shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#646464] hover:text-[#171717] rounded-xl hover:bg-[#F8F7F4] cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171717] font-['Plus_Jakarta_Sans']">
              {editingVideo ? 'Editar Vídeo' : 'Cadastrar Vídeo'}
            </h3>
            <p className="text-xs text-[#646464]">Informações do conteúdo exibido aos usuários</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Título do Vídeo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conexão Espontânea #01"
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              >
                <option value="Conexões">Conexões</option>
                <option value="Comunidade">Comunidade</option>
                <option value="Ficção & Tecnologia">Ficção & Tecnologia</option>
                <option value="Natureza">Natureza</option>
                <option value="Cinema">Cinema</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Duração</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 12:45"
                className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">URL do Vídeo (MP4/Stream) *</label>
            <input
              type="text"
              inputMode="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://exemplo.com/video.mp4"
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">URL da Capa (Thumbnail)</label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="/images/omeflash_hero_connection.jpg ou URL"
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Descrição</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumo sobre o vídeo..."
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="hd, exclusivo, ao vivo"
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-xl text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isPremium"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00] accent-[#FF6A00]"
            />
            <label htmlFor="isPremium" className="text-xs font-medium text-[#171717] cursor-pointer">
              Vídeo Exclusivo VIP (Apenas para assinantes)
            </label>
          </div>

          <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-[#646464] hover:text-[#171717] text-xs font-semibold hover:bg-[#F8F7F4] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar Vídeo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
