
import React, { useEffect, useState } from 'react';
import { useGame } from './GameContext';
import { Scene } from './components/Scene';
import { Minigame } from './components/Minigame';
import { DivingMinigame } from './components/DivingMinigame';
import { UIOverlay } from './components/UIOverlay';
import { Celebration } from './components/Celebration';
import { Download, Share } from 'lucide-react';

function App() {
  const { startNewGame, playSound, stats, bag } = useGame();
  
  // States: 'intro' -> 'menu' -> 'game'
  const [view, setView] = useState<'intro' | 'menu' | 'game'>('intro');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Intro splash logic
    const timer = setTimeout(() => {
      setView('menu');
    }, 2500);

    // PWA Install Prompt Listener
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  // Main Menu Handlers
  const handleContinue = () => {
    try {
        playSound('click');
    } catch(e) {}
    setView('game');
  };

  const handleNewGame = () => {
    // Check if user has played enough to warrant a warning
    // Level > 1, Money > 0, XP > 0, or items in bag
    const hasProgress = stats.level > 1 || stats.money > 0 || stats.xp > 0 || bag.length > 0;

    if (hasProgress) {
       if (window.confirm("Mevcut ilerlemen silinecek. Yeni oyun başlatmak istiyor musun?")) {
          startNewGame();
          setView('game');
       }
    } else {
       startNewGame();
       setView('game');
    }
  };

  if (view === 'intro') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
        <div className="text-8xl mb-4 animate-[bounce_2s_infinite]">🎣</div>
        <h1 className="text-3xl font-black tracking-[0.2em] text-slate-400 animate-pulse">BALIKÇI HASAN</h1>
      </div>
    );
  }

  if (view === 'menu') {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[90] px-6">
        {/* Title Group */}
        <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-black text-center leading-tight tracking-tight">
                <span className="block bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">BALIKÇI</span>
                <span className="block bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">HASAN</span>
            </h1>
            <div className="mt-2 text-slate-500 text-xs tracking-widest font-mono">v2.1 OFFLINE EDITION</div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3">
            <button 
                onClick={handleContinue}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-900/50 transition-all touch-manipulation cursor-pointer"
            >
                DEVAM ET
            </button>
            
            <button 
                onClick={handleNewGame}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg transition-all touch-manipulation cursor-pointer"
            >
                YENİ OYUN
            </button>

            {/* Install Button (Only visible if browser supports it) */}
            {installPrompt && (
              <button 
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 animate-bounce touch-manipulation cursor-pointer"
              >
                  <Download size={18} />
                  UYGULAMAYI YÜKLE
              </button>
            )}
            
            {/* iOS Hint (Visible if on iOS and not installed) */}
            {!installPrompt && /iPhone|iPad|iPod/.test(navigator.userAgent) && (
               <div className="text-center text-slate-500 text-xs mt-4 bg-slate-800/50 p-3 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1 font-bold text-slate-400">
                     <Share size={12} /> Yüklemek İçin:
                  </div>
                  "Paylaş" butonuna bas ve <br/>"Ana Ekrana Ekle" de.
               </div>
            )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-slate-500 font-mono text-xs tracking-widest opacity-60">
            made by Fırat Yıldırım
        </div>
      </div>
    );
  }

  // Game View
  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-slate-900 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <Scene />
      <Minigame />
      <DivingMinigame />
      <UIOverlay />
      <Celebration />
    </div>
  );
}

export default App;
