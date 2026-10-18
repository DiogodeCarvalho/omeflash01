import React, { useEffect } from 'react';
import { X, Zap, Clock, ExternalLink, SkipForward, Radio } from 'lucide-react';
import { Video } from '../types.ts';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
  onNextVideo?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, onNextVideo }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && onNextVideo) {
        // Space bar can skip to next
        onNextVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNextVideo]);

  if (!video) return null;

  const videoUrl = video.video_url || '';
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : url;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#171717]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white border border-[#E8E5DD] shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header OmeFlash */}
        <div className="flex items-center justify-between border-b border-[#E8E5DD] px-4 py-3 sm:px-6 bg-[#F8F7F4]">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00] text-white shadow-xs">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight select-none">
                  <span className="text-[#FF6A00]">Ome</span>
                  <span className="text-[#171717]">Flash</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF6A00] bg-[#FFF2E8] px-2 py-0.5 rounded-full">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  <span>Em Conversa</span>
                </span>
              </div>
              <h3 className="text-xs font-semibold text-[#171717] truncate max-w-sm sm:max-w-md mt-0.5">
                {video.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNextVideo && (
              <button
                onClick={onNextVideo}
                className="hidden sm:flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-white text-xs font-bold shadow-xs transition active:scale-95"
                title="Conectar com outro desconhecido"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span>Próximo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E5DD] bg-white text-[#646464] hover:text-[#171717] hover:bg-[#F2EFE9] transition"
              aria-label="Encerrar conversa"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Player */}
        <div className="relative aspect-video w-full bg-[#171717] shrink-0">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(video.video_url)}
              title={video.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isVimeo ? (
            <iframe
              src={getVimeoEmbedUrl(video.video_url)}
              title={video.title}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.video_url}
              controls
              autoPlay
              playsInline
              poster={video.thumbnail_url}
              className="h-full w-full object-contain"
            >
              Seu navegador não suporta reprodução de vídeo.
            </video>
          )}
        </div>

        {/* Rodapé e Ações Rápidas */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#646464]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FF6A00]">{video.category}</span>
              <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
              {video.duration && (
                <>
                  <span className="flex items-center gap-1 font-mono text-[#171717]">
                    <Clock className="h-3 w-3 text-[#646464]" />
                    {video.duration}
                  </span>
                  <span aria-hidden="true" className="text-[#E8E5DD]">·</span>
                </>
              )}
              <span>{new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
            </div>

            <div className="flex items-center gap-2">
              {onNextVideo && (
                <button
                  onClick={onNextVideo}
                  className="sm:hidden flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#E65F00] text-white text-xs font-bold transition active:scale-95"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>Próximo</span>
                </button>
              )}
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#646464] hover:text-[#171717] transition"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Link direto</span>
              </a>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#646464] leading-relaxed bg-[#F8F7F4] p-3.5 rounded-2xl border border-[#E8E5DD]">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
};
