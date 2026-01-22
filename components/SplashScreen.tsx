
import React, { useEffect, useState } from 'react';

interface Props {
  isVisible: boolean;
}

const SplashScreen: React.FC<Props> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black transition-all duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Brand Mark */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-indigo-600/20 rounded-full blur-2xl animate-pulse"></div>
          <h1 className={`text-5xl font-black tracking-tighter text-white transition-all duration-1000 delay-100 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            Wall<span className="text-indigo-500">Tok</span>
          </h1>
        </div>
        
        {/* Minimal Progress Line */}
        <div className="mt-8 w-12 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
