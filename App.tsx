
import React, { useEffect, useState } from 'react';
import { useGame } from './GameContext';
import { Scene } from './components/Scene';
import { Minigame } from './components/Minigame';
import { DivingMinigame } from './components/DivingMinigame';
import { UIOverlay } from './components/UIOverlay';
import { Celebration } from './components/Celebration';

function App() {
  const { startNewGame, playSound, stats, bag } = useGame();
  
  // States: 'intro' -> 'menu' -> 'game'
  const [view, setView] = useState<'intro' | 'menu' | 'game'>('intro');

  useEffect(() => {
    // Intro splash logic
    const timer = setTimeout(() => {
      setView('menu');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Main Menu Handlers
  const handleContinue = () => {
    playSound('click');
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
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
        <div className="text-8xl mb-4 animate-[bounce_2s_infinite]">🎣</div>
        <h1 className="text-3xl font-black tracking-[0.2em] text-slate-400 animate-pulse">BALIKÇI HASAN</h1>
      </div>
    );
  }

  if (view === 'menu') {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 px-6">
        {/* Title Group */}
        <div className="flex flex-col items-center mb-12">
            <h1 className="text-5xl font-black text-center leading-tight tracking-tight">
                <span className="block bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">BALIKÇI</span>
                <span className="block bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">HASAN</span>
            </h1>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-4">
            <button 
                onClick={handleContinue}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-900/50 transition-all"
            >
                DEVAM ET
            </button>
            
            <button 
                onClick={handleNewGame}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg transition-all"
            >
                YENİ OYUN
            </button>
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
