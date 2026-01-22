
import React from 'react';

interface Props {
  isVisible: boolean;
  onDismiss: () => void;
}

const TutorialOverlay: React.FC<Props> = ({ isVisible, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 animate-in fade-in"
      onClick={onDismiss}
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated Hand Icon */}
        <div className="w-16 h-16 flex items-center justify-center animate-bounce-vertical">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-12 h-12 text-white drop-shadow-lg"
          >
            <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
            <path d="M3.265 10.602l7.635 4.111a.75.75 0 00.699 0l7.635-4.111 2.15 1.158a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l2.15-1.158z" />
            <path d="M3.265 14.352l7.635 4.111a.75.75 0 00.699 0l7.635-4.111 2.15 1.158a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l2.15-1.158z" />
          </svg>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-white text-xl font-bold tracking-tight drop-shadow-md">Swipe up to explore</p>
          <p className="text-white/70 text-sm font-medium">Discover immersive wallpapers</p>
        </div>

        <button 
          className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full text-sm shadow-xl active:scale-95 transition-transform"
          onClick={onDismiss}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes bounce-vertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-vertical {
          animation: bounce-vertical 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TutorialOverlay;
