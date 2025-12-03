
import React from 'react';
import { useGame } from '../GameContext';
import { FishRenderer } from './Scene';

export const Celebration: React.FC = () => {
  const { celebrationFish, closeCelebration } = useGame();

  if (!celebrationFish) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
      onClick={closeCelebration} // Allow closing by clicking background
    >
      {/* Confetti Background (CSS based simple particles) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-[pop_1s_ease-out_infinite]"
            style={{
              left: `${50 + (Math.random() - 0.5) * 80}%`,
              top: `${50 + (Math.random() - 0.5) * 80}%`,
              animationDelay: `${Math.random()}s`,
              backgroundColor: ['#facc15', '#3b82f6', '#ec4899', '#10b981'][i % 4]
            }}
          />
        ))}
      </div>

      <div 
        className="relative flex flex-col items-center animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content card
      >
        
        {/* Glow effect - Added pointer-events-none to fix button unclickability */}
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none" />

        <div className="text-4xl mb-4 animate-bounce">
          {celebrationFish.rarity >= 6 ? '👑' : '🌟'}
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 tracking-widest mb-2 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
          EFSANEVİ!
        </h2>
        
        <div className="bg-slate-800/80 p-6 rounded-3xl border-2 border-yellow-500/50 shadow-2xl flex flex-col items-center gap-2 min-w-[280px]">
          {/* Main Visual */}
          <div className="w-48 h-48 mb-2 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-[float_4s_ease-in-out_infinite]">
             <FishRenderer visual={celebrationFish.visual} />
          </div>
          
          <div className="text-2xl font-bold text-white">{celebrationFish.name}</div>
          <div className="flex gap-4 mt-2 text-sm font-mono text-slate-300">
             <span>⚖️ {celebrationFish.weight} kg</span>
             <span className="text-yellow-400">💰 {celebrationFish.value} TL</span>
          </div>
        </div>

        <button 
          onClick={closeCelebration}
          className="mt-8 px-10 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-black text-lg rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform relative z-10"
        >
          HARİKA!
        </button>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.5) translate(var(--tw-translate-x), var(--tw-translate-y)); opacity: 0; }
        }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
      `}</style>
    </div>
  );
};
