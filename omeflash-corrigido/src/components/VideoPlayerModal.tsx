import React, { useState } from 'react';
import { X, Crown, Lock, Play, Heart, Share2, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Video } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../services/api';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onOpenPlans,
  onOpenAuth,
}) => {
  const { user, isVip } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!video) return null;

  const isLocked = video.isVip && !isVip;
  const token = getAuthToken();
  const streamSrc = `${video.streamUrl}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player / VIP Lock Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {isLocked ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Blurred background preview */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover filter blur-md brightness-40 scale-105"
              />

              {/* Paywall Container */}
              <div className="relative z-10 p-6 max-w-md text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 animate-bounce">
                  <Crown className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  CONTEÚDO EXCLUSIVO VIP
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
                  Desbloqueie para assistir
                </h3>

                <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
                  Esta gravação na íntegra de <span className="text-amber-400 font-bold">{video.duration}</span> é restrita para assinantes OmeFlash VIP.
                </p>

                <div className="w-full flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPlans();
                    }}
                    className="w-full py-3.5 px-6 bg-[#FF5500] hover:bg-[#e44d00] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Liberar Acesso Agora (a partir de R$ 29,90)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  {!user && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="text-xs text-gray-400 hover:text-white underline transition-colors py-1 cursor-pointer"
                    >
                      Já tem uma assinatura? Faça login
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <video
              src={streamSrc}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              poster={video.thumbnailUrl}
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
          )}
        </div>

        {/* Video Metadata & Controls */}
        <div className="p-5 sm:p-6 bg-gray-900 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF5500] border border-orange-500/20">
                  {video.category}
                </span>
                {video.isVip && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Exclusivo VIP
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {video.views ? `${video.views.toLocaleString()} visualizações` : 'Lançamento'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {video.title}
              </h2>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-2 self-start">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  liked
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
                <span>{video.likes + (liked ? 1 : 0)}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
            {video.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-800 text-xs">
            <span className="text-gray-500 font-medium">Tags:</span>
            {video.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
