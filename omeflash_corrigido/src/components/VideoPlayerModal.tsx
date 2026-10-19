import React from 'react';
import { X, Clock, Eye, Crown, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Video } from '../types';

interface VideoPlayerModalProps {
  video: Video | null;
  isSubscribed: boolean;
  onClose: () => void;
  onSubscribeClick: () => void;
  onLoginClick?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  isSubscribed,
  onClose,
  onSubscribeClick,
  onLoginClick,
}) => {
  if (!video) return null;

  // Video is locked if it is premium and user is not an active subscriber
  const isLocked = video.isPremium && !isSubscribed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with Close */}
        <div className="flex items-center justify-between p-3.5 px-6 border-b border-[#E8E6E1] bg-[#F8F7F4]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#E8E6E1] text-[#171717] text-xs font-semibold">
              {video.category}
            </span>
            {video.isPremium && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-bold">
                <Crown className="w-3.5 h-3.5" />
                VIP
              </span>
            )}
            {isSubscribed && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Assinante VIP Ativo
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#646464] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
            aria-label="Fechar reprodutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Locked Paywall Barrier */}
        <div className="relative aspect-video w-full bg-[#171717] flex items-center justify-center overflow-hidden">
          {isLocked ? (
            /* Paywall Barrier */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-t from-black via-black/90 to-black/80">
              <img
                src={video.thumbnailUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
              />
              <div className="relative z-10 max-w-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6A00] bg-[#FF6A00]/15 px-3 py-1 rounded-full border border-[#FF6A00]/30 inline-block">
                    Conteúdo Exclusivo VIP
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                    Desbloqueie este vídeo com sua assinatura
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                    Todos os planos do OmeFlash oferecem <strong>acesso total a 100% dos vídeos</strong> da plataforma sem limites.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSubscribeClick();
                    }}
                    className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Assinar e Liberar Acesso</span>
                  </button>

                  {onLoginClick && (
                    <button
                      onClick={() => {
                        onClose();
                        onLoginClick();
                      }}
                      className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Já sou assinante
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Video Player */
            <video
              controls
              autoPlay
              poster={video.thumbnailUrl}
              src={video.videoUrl}
              className="w-full h-full object-contain"
            >
              Seu navegador não suporta a tag de vídeo.
            </video>
          )}
        </div>

        {/* Video Info Section */}
        <div className="p-5 sm:p-6 overflow-y-auto bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-[#171717] leading-snug font-['Plus_Jakarta_Sans']">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-[#646464] shrink-0 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8E8E8E]" />
                {video.duration}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#8E8E8E]" />
                {video.views?.toLocaleString('pt-BR') || 0} visualizações
              </span>
            </div>
          </div>

          <p className="text-[#646464] text-sm leading-relaxed mb-4">
            {video.description}
          </p>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#F0EEE9]">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F8F7F4] border border-[#E8E6E1] text-[#646464]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Active subscription status note */}
          {isSubscribed && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Acesso VIP 100% Liberado:</strong> Sua assinatura ativa permite assistir a este e a todos os demais vídeos em qualidade máxima sem restrições.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
