import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Film, 
  Sparkles
} from 'lucide-react';
import { Video, VideoFormData } from '../types.ts';
import { createAdminVideo, updateAdminVideo } from '../lib/api.ts';

interface AdminVideoFormProps {
  initialVideo?: Video | null;
  onSuccess: (video: Video) => void;
  onCancel: () => void;
}

const CATEGORY_SUGGESTIONS = [
  'Tecnologia',
  'Cinema',
  'Documentário',
  'Educação',
  'Tutoriais',
  'Áudio',
  'Design',
  'Negócios',
];

export const AdminVideoForm: React.FC<AdminVideoFormProps> = ({
  initialVideo,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!initialVideo;

  const [formData, setFormData] = useState<VideoFormData>({
    title: initialVideo?.title || '',
    description: initialVideo?.description || '',
    video_url: initialVideo?.video_url || '',
    thumbnail_url: initialVideo?.thumbnail_url || '',
    category: initialVideo?.category || 'Tecnologia',
    duration: initialVideo?.duration || '',
    status: initialVideo?.status || 'published',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCat, setUseCustomCat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVideo) {
      setFormData({
        title: initialVideo.title,
        description: initialVideo.description,
        video_url: initialVideo.video_url,
        thumbnail_url: initialVideo.thumbnail_url,
        category: initialVideo.category,
        duration: initialVideo.duration,
        status: initialVideo.status,
      });

      if (!CATEGORY_SUGGESTIONS.includes(initialVideo.category)) {
        setUseCustomCat(true);
        setCustomCategory(initialVideo.category);
      }
    }
  }, [initialVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setError('O título do vídeo é obrigatório e deve ter no mínimo 2 caracteres.');
      return;
    }

    if (!formData.description.trim()) {
      setError('A descrição do vídeo é obrigatória.');
      return;
    }

    if (!formData.video_url.trim()) {
      setError('A URL ou referência do arquivo de vídeo é obrigatória.');
      return;
    }

    const finalCategory = useCustomCat
      ? customCategory.trim() || 'Geral'
      : formData.category || 'Geral';

    const payload: VideoFormData = {
      ...formData,
      category: finalCategory,
      thumbnail_url: formData.thumbnail_url.trim() || '/src/assets/images/thumb_sci_fi_thriller_1792239265919.jpg',
    };

    try {
      setLoading(true);
      if (isEditing && initialVideo) {
        const res = await updateAdminVideo(initialVideo.id, payload);
        onSuccess(res.video);
      } else {
        const res = await createAdminVideo(payload);
        onSuccess(res.video);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar os dados do vídeo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoVideo = () => {
    setFormData((prev) => ({
      ...prev,
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: '/src/assets/images/thumb_cinematic_documentary_1792239265232.jpg',
      duration: '09:56',
    }));
  };

  return (
    <div className="rounded-3xl border border-[#E8E5DD] bg-white p-5 sm:p-8 shadow-xs max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <Film className="h-5 w-5 text-[#FF6A00]" />
            {isEditing ? 'Editar Dados do Vídeo' : 'Cadastrar Novo Vídeo'}
          </h2>
          <p className="text-xs text-[#646464] mt-1">
            Preencha os campos obrigatórios. Os dados serão persistidos no banco de dados.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition"
          aria-label="Cancelar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
            Título do Vídeo *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Conexão Espontânea entre Desconhecidos"
            className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-4 text-sm text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
            Sinopse / Descrição Completa *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva a dinâmica da conversa, temas abordados e contexto..."
            className="w-full rounded-xl border border-[#E8E5DD] bg-white p-3.5 text-sm text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
          />
        </div>

        {/* Grid de URL de Vídeo e Miniatura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                URL do Vídeo (MP4 / WebM / YT) *
              </label>
              <button
                type="button"
                onClick={handleUseDemoVideo}
                className="text-[11px] font-bold text-[#FF6A00] hover:text-[#E65F00] flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Usar Demo
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://...arquivo.mp4 ou YouTube"
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-4 text-xs font-mono text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
              URL da Miniatura (Thumbnail)
            </label>
            <input
              type="text"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="/images/omeflash_hero_call.jpg ou https://..."
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-4 text-xs font-mono text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:outline-none"
            />
          </div>
        </div>

        {/* Preview da Miniatura */}
        {formData.thumbnail_url && (
          <div>
            <span className="block text-[11px] font-bold text-[#646464] uppercase tracking-wider mb-2">
              Pré-visualização do Enquadramento
            </span>
            <div className="relative aspect-video max-w-xs rounded-2xl overflow-hidden bg-[#171717] border border-[#E8E5DD]">
              <img
                src={formData.thumbnail_url}
                alt="Prévia da miniatura"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/images/omeflash_spontaneous_moment.jpg';
                }}
              />
            </div>
          </div>
        )}

        {/* Categoria, Duração e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
              Categoria
            </label>
            {!useCustomCat ? (
              <div className="space-y-1.5">
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setUseCustomCat(true);
                      setCustomCategory('');
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:outline-none"
                >
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Nova Categoria...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Nome do gênero"
                  className="flex-1 min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-3 text-xs text-[#171717] focus:border-[#FF6A00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setUseCustomCat(false)}
                  className="min-h-[44px] px-3 rounded-xl border border-[#E8E5DD] bg-[#F2EFE9] text-xs text-[#171717] hover:bg-[#E8E5DD]"
                >
                  Lista
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
              Duração Estimada
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex: 09:42 ou 15m"
              className="w-full min-h-[44px] rounded-xl border border-[#E8E5DD] bg-white px-4 text-xs font-mono text-[#171717] placeholder-[#8E8E8E] focus:border-[#FF6A00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
              Status de Publicação
            </label>
            <div className="flex items-center p-1 rounded-xl bg-[#F2EFE9] border border-[#E8E5DD]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'published' })}
                className={`flex-1 min-h-[36px] rounded-lg text-xs font-bold transition active:scale-95 ${
                  formData.status === 'published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#646464] hover:text-[#171717]'
                }`}
              >
                Publicado
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'draft' })}
                className={`flex-1 min-h-[36px] rounded-lg text-xs font-bold transition active:scale-95 ${
                  formData.status === 'draft'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[#646464] hover:text-[#171717]'
                }`}
              >
                Rascunho
              </button>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-4 border-t border-[#E8E5DD] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-[44px] px-6 rounded-xl border border-[#E8E5DD] bg-white hover:bg-[#F2EFE9] text-xs font-semibold text-[#646464] hover:text-[#171717] transition active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] px-7 rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-xs font-bold text-white shadow-md shadow-[#FF6A00]/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : isEditing ? 'Atualizar Vídeo' : 'Cadastrar Vídeo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
