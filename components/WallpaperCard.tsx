
import React, { useRef, useEffect, useState } from 'react';
import { Wallpaper, MediaType } from '../types';
import { HeartIcon, ShareIcon, DownloadIcon } from './Icons';

interface Props {
  wallpaper: Wallpaper;
  isActive: boolean;
  isNear: boolean;
  isImmersive: boolean;
  onToggleImmersive: () => void;
}

const WallpaperCard: React.FC<Props> = ({ wallpaper, isActive, isNear, isImmersive, onToggleImmersive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [animatingLike, setAnimatingLike] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayStateIcon, setShowPlayStateIcon] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current && isNear) {
      if (isActive) {
        setIsPlaying(true);
        videoRef.current.play().catch(() => {});
      } else {
        setIsPlaying(false);
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, isNear]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (!liked) {
      setAnimatingLike(true);
      setTimeout(() => setAnimatingLike(false), 500);
    }
  };

  const handleInteraction = () => {
    // Toggle Playback if Video
    if (wallpaper.type === MediaType.VIDEO && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
      setShowPlayStateIcon(true);
      setTimeout(() => setShowPlayStateIcon(false), 800);
    }
    
    // Toggle Immersive View
    onToggleImmersive();
  };

  return (
    <div 
      className="relative h-screen w-full bg-neutral-900 snap-item overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={handleInteraction}
    >
      {/* Background Media - Lazy Loaded with Zoom Effect */}
      <div className={`absolute inset-0 transition-transform duration-1000 ease-out ${isImmersive ? 'scale-105' : 'scale-100'}`}>
        {!isNear && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-white/5 border-t-white/20 rounded-full animate-spin"></div>
          </div>
        )}

        {isNear && (
          <>
            {wallpaper.type === MediaType.VIDEO ? (
              <video
                ref={videoRef}
                src={wallpaper.url}
                className={`h-full w-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loop
                muted
                playsInline
                onLoadedData={() => setIsLoaded(true)}
              />
            ) : (
              <img
                src={wallpaper.url}
                alt={wallpaper.title}
                className={`h-full w-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
              />
            )}

            {!isLoaded && (
              <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Playback Status Indicator (Center) */}
      {showPlayStateIcon && wallpaper.type === MediaType.VIDEO && isNear && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-full animate-out fade-out zoom-out duration-500 fill-mode-forwards">
            {!isPlaying ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Overlay Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none transition-opacity duration-700 ${isImmersive ? 'opacity-0' : 'opacity-100'}`}></div>

      {/* Media Info (Bottom Left) - UI Element */}
      <div className={`absolute bottom-10 left-4 right-20 text-white z-10 pointer-events-none transition-all duration-500 ease-in-out ${isImmersive ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <h2 className="text-xl font-bold drop-shadow-md">{wallpaper.author}</h2>
      </div>

      {/* Action Buttons (Right) - UI Elements */}
      <div className={`absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10 transition-all duration-500 ease-in-out ${isImmersive ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        <button 
          onClick={handleLike}
          className="group flex flex-col items-center pointer-events-auto"
        >
          <div className={`p-3.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 transition-all active:scale-75 ${liked ? 'text-rose-500 border-rose-500/50' : 'text-white'}`}>
            <HeartIcon filled={liked} className="w-7 h-7" />
          </div>
          <span className="text-[11px] mt-1.5 font-bold drop-shadow-md">{wallpaper.likes + (liked ? 1 : 0)}</span>
        </button>

        <button 
          className="group flex flex-col items-center pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title: wallpaper.title,
                text: wallpaper.description,
                url: wallpaper.url,
              }).catch(() => {});
            }
          }}
        >
          <div className="p-3.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 transition-all active:scale-75 text-white">
            <ShareIcon className="w-7 h-7" />
          </div>
          <span className="text-[11px] mt-1.5 font-bold drop-shadow-md">Share</span>
        </button>

        <button 
          className="group flex flex-col items-center pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            window.open(wallpaper.url, '_blank');
          }}
        >
          <div className="p-3.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 transition-all active:scale-75 text-white">
            <DownloadIcon className="w-7 h-7" />
          </div>
          <span className="text-[11px] mt-1.5 font-bold drop-shadow-md">Save</span>
        </button>
      </div>

      {/* Like Animation Overlay */}
      {animatingLike && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-ping opacity-75">
            <HeartIcon filled className="w-32 h-32 text-rose-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperCard;
