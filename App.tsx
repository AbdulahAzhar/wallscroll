
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wallpaper } from './types';
import { fetchWallpapersFromCloud, onCloudUpdate } from './services/syncService';
import WallpaperCard from './components/WallpaperCard';
import AdminDashboard from './components/AdminDashboard';
import TutorialOverlay from './components/TutorialOverlay';
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<'feed' | 'admin'>('feed');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Sync view state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const isParamAdmin = window.location.hash === '#/admin';
      setView(isParamAdmin ? 'admin' : 'feed');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check for first time visitor
  useEffect(() => {
    const hasSeen = localStorage.getItem('walltok_tutorial_seen');
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('walltok_tutorial_seen', 'true');
  };

  // Initial and reactive fetch
  const syncData = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const data = await fetchWallpapersFromCloud();
      setAllWallpapers(data);
      // Only hide splash after the first real data fetch
      if (showSplash) {
        setTimeout(() => setShowSplash(false), 1200); // Give splash some time to breathe
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
    
    // Listen for real-time broadcasts from other tabs (Admin edits)
    const unsubscribe = onCloudUpdate(() => {
      console.log('Cloud update detected, syncing...');
      syncData(true);
    });

    // Fallback Polling (Check every 30s)
    const pollInterval = setInterval(() => syncData(true), 30000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [view]);

  // Derive categories from tags
  const categories = useMemo(() => {
    const tagsSet = new Set<string>(['All']);
    allWallpapers.forEach(wp => {
      if (wp.tags && Array.isArray(wp.tags)) {
        wp.tags.forEach(tag => {
          if (tag) tagsSet.add(tag);
        });
      }
    });
    return Array.from(tagsSet);
  }, [allWallpapers]);

  // Filter wallpapers based on selection
  const filteredWallpapers = useMemo(() => {
    if (selectedCategory === 'All') return allWallpapers;
    return allWallpapers.filter(wp => wp.tags?.includes(selectedCategory));
  }, [allWallpapers, selectedCategory]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    // Dismiss tutorial if user scrolls
    if (showTutorial) {
      dismissTutorial();
    }

    const index = Math.round(scrollRef.current.scrollTop / window.innerHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const navigateToFeed = () => {
    window.location.hash = '#/';
  };

  // When category changes, reset scroll and active index immediately
  const handleCategorySelect = (category: string, e: React.MouseEvent) => {
    setSelectedCategory(category);
    // Center the button in the horizontal scrollbar for a better UX
    (e.currentTarget as HTMLElement).scrollIntoView({ 
      behavior: 'smooth', 
      inline: 'center', 
      block: 'nearest' 
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      // Instant reset to the top of the new filtered list
      scrollRef.current.scrollTop = 0;
      setActiveIndex(0);
    }
  }, [selectedCategory, filteredWallpapers.length]);

  if (view === 'admin') {
    return <AdminDashboard onBack={navigateToFeed} />;
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* High-Fidelity Splash Screen */}
      <SplashScreen isVisible={showSplash} />

      {/* Tutorial Overlay */}
      <TutorialOverlay isVisible={showTutorial} onDismiss={dismissTutorial} />

      {/* Immersive Category Tab Bar (Top) */}
      <div className={`absolute top-0 left-0 right-0 z-50 pt-8 pb-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-all duration-700 ease-in-out ${isImmersive ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <div 
          ref={categoriesRef}
          className="flex overflow-x-auto hide-scrollbar px-6 gap-3 pointer-events-auto items-center scroll-smooth"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={(e) => handleCategorySelect(category, e)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-md border ${
                selectedCategory === category
                  ? 'bg-indigo-600 border-indigo-500 text-white scale-105 shadow-xl shadow-indigo-600/40'
                  : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
          
          {isSyncing && (
             <div className="ml-2 flex items-center pr-6">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             </div>
          )}
        </div>
      </div>

      {/* Main Content Feed */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-container hide-scrollbar h-full bg-neutral-950"
      >
        {filteredWallpapers.length > 0 ? (
          filteredWallpapers.map((wp, index) => (
            <WallpaperCard 
              key={wp.id} 
              wallpaper={wp} 
              isActive={index === activeIndex}
              isNear={Math.abs(index - activeIndex) <= 1} // Lazy loading window: Current +/- 1
              isImmersive={isImmersive}
              onToggleImmersive={() => setIsImmersive(!isImmersive)}
            />
          ))
        ) : (
          <div className="h-screen flex flex-col items-center justify-center space-y-6 px-10 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-2">
               <div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-neutral-400 font-medium text-lg">
                {isSyncing ? "Syncing from cloud..." : `No wallpapers in "${selectedCategory}"`}
              </p>
              {!isSyncing && (
                <p className="text-neutral-600 text-sm mt-1">Try another category or add content in Admin</p>
              )}
            </div>
            {!isSyncing && (
              <button 
                onClick={() => setSelectedCategory('All')}
                className="px-6 py-2 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Reset to All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
