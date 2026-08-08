import React, { useState, useEffect } from 'react';

export const GlobalLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLoading = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setLoading(customEvent.detail);
    };

    window.addEventListener('app-loading', handleLoading);
    return () => {
      window.removeEventListener('app-loading', handleLoading);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      {/* 3px animated loading progress bar at the absolute top of the viewport */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-emerald-700/30 z-[99999] overflow-hidden">
        <div className="h-full bg-emerald-500 animate-loading-bar rounded-full" />
      </div>

      {/* Lightweight overlay to block double submissions and show cursor-wait */}
      <div className="fixed inset-0 bg-white/10 backdrop-blur-[0.5px] z-[99998] cursor-wait pointer-events-auto flex items-center justify-center animate-fade-in">
        <div className="bg-white/90 border border-gray-150 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3 active:scale-95 transition-all">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent" />
          <span className="text-xs font-bold text-gray-700 tracking-wide">Memproses data...</span>
        </div>
      </div>
    </>
  );
};

export default GlobalLoader;
