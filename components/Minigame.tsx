

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../GameContext';
import { RODS } from '../constants';
import { ArrowDown, Target, Skull } from 'lucide-react';
import { FishRenderer } from './Scene';

export const Minigame: React.FC = () => {
  const { gameState, activeFish, stats, reelIn, playSound } = useGame();
  
  const [tension, setTension] = useState(0);
  const [distance, setDistance] = useState(50);
  const [isReeling, setIsReeling] = useState(false);
  const [fishState, setFishState] = useState<'calm' | 'angry'>('calm');
  const [qte, setQte] = useState<{ active: boolean; x: number; y: number; id: number } | null>(null);

  const requestRef = useRef<number>(0);
  const isReelingRef = useRef(false);
  const fishStateRef = useRef<'calm' | 'angry'>('calm');
  const qteRef = useRef<{ active: boolean; timer: number; maxTime: number }>({ active: false, timer: 0, maxTime: 0 });
  const maxTensionRef = useRef(0); 

  const params = useRef({
    tension: 0,
    distance: 50,
    maxDistance: 100,
    reelSpeed: 0.2,
    tensionRate: 0.5,
    decayRate: 1.0,
    fishStrength: 1.0,
    isBoss: false
  });

  const endGame = useCallback((success: boolean, snapped: boolean) => {
    cancelAnimationFrame(requestRef.current);
    setQte(null);
    const perfect = success && maxTensionRef.current < 50 && !params.current.isBoss; // Bosses are never "perfect" easily
    reelIn(success, snapped, perfect); 
  }, [reelIn]);

  const handleDown = (e: React.SyntheticEvent) => { e.preventDefault(); if (!isReelingRef.current) { isReelingRef.current = true; setIsReeling(true); playSound('cast'); } };
  const handleUp = (e: React.SyntheticEvent) => { e.preventDefault(); if (isReelingRef.current) { isReelingRef.current = false; setIsReeling(false); } };
  const handleQteClick = (e: React.SyntheticEvent) => { e.stopPropagation(); if (qteRef.current.active) { params.current.distance = Math.max(0, params.current.distance - 15); params.current.tension = Math.max(0, params.current.tension - 20); qteRef.current.active = false; setQte(null); playSound('success'); } };

  // Initialization
  useEffect(() => {
    if (gameState === 'MINIGAME' && activeFish) {
      const rod = RODS[stats.rodId];
      const rarity = activeFish.rarity;
      const isBoss = activeFish.isBoss || false;

      const startDist = 30 + (rarity * 10) + (isBoss ? 20 : 0);
      let strength = 0.5 + (rarity * 0.2);
      if (isBoss) strength *= 2; // Boss is much stronger

      const rodPower = rod.power;
      const tensionRate = (0.5 * strength) / Math.sqrt(rodPower);

      params.current = {
        tension: 0,
        distance: startDist,
        maxDistance: startDist + 20,
        reelSpeed: 0.15 * rodPower,
        tensionRate: Math.max(0.1, tensionRate),
        decayRate: 1.5,
        fishStrength: strength,
        isBoss: isBoss
      };

      isReelingRef.current = false;
      fishStateRef.current = 'calm';
      qteRef.current = { active: false, timer: 0, maxTime: 0 };
      maxTensionRef.current = 0; 
      
      setDistance(startDist);
      setTension(0);
      setIsReeling(false);
      setFishState('calm');
      setQte(null);
    }
  }, [gameState, activeFish, stats.rodId]); 

  // Physics Loop
  useEffect(() => {
    if (gameState !== 'MINIGAME') { cancelAnimationFrame(requestRef.current); return; }

    const loop = () => {
        const p = params.current;
        
        // Random State Change
        const angerChance = p.isBoss ? 0.03 : 0.01;
        if (Math.random() < angerChance) {
           const newState = fishStateRef.current === 'calm' ? 'angry' : 'calm';
           fishStateRef.current = newState;
           setFishState(newState);
        }

        const isAngry = fishStateRef.current === 'angry';
        let angerMult = isAngry ? 2.5 : 1.0;
        if (p.isBoss && isAngry) angerMult = 3.5; 

        if (isReelingRef.current) { 
            p.distance -= p.reelSpeed; 
            p.tension += p.tensionRate * angerMult; 
        } else { 
            p.tension -= p.decayRate; 
            p.distance += (p.isBoss ? 0.1 : 0.05) * angerMult; 
        }

        if (p.tension > maxTensionRef.current) maxTensionRef.current = p.tension;

        // QTE Chance
        if (!qteRef.current.active && !isAngry && p.distance > 15 && p.distance < p.maxDistance - 10 && Math.random() < 0.008) {
            const time = p.isBoss ? 60 : 90; 
            qteRef.current = { active: true, timer: time, maxTime: time };
            setQte({ active: true, x: 10 + Math.random() * 80, y: 10 + Math.random() * 40, id: Date.now() });
            playSound('click');
        }

        if (qteRef.current.active) {
            qteRef.current.timer--;
            if (qteRef.current.timer <= 0) { qteRef.current.active = false; setQte(null); }
        }

        if (p.tension < 0) p.tension = 0;
        
        if (p.tension >= 100) { endGame(false, true); return; }
        if (p.distance <= 0) { endGame(true, false); return; }
        if (p.distance >= p.maxDistance) { endGame(false, false); return; }

        setTension(p.tension);
        setDistance(p.distance);

        requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, endGame, playSound]);

  if (gameState !== 'MINIGAME') return null;

  const isBoss = params.current.isBoss;

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center select-none touch-none overflow-hidden ${isBoss ? 'bg-red-950/80' : 'bg-black/80'} backdrop-blur-sm transition-colors duration-500`}>
        {isBoss && (
            <div className="absolute top-10 flex items-center gap-2 animate-pulse">
                <Skull className="text-red-500" size={32} />
                <span className="text-red-500 font-black text-2xl tracking-[0.3em] uppercase drop-shadow-[0_0_10px_red]">BOSS FIGHT</span>
                <Skull className="text-red-500" size={32} />
            </div>
        )}

        {qte && (
            <button className="absolute z-[60] w-20 h-20 flex items-center justify-center animate-[pop_0.2s_ease-out]" style={{ left: `${qte.x}%`, top: `${qte.y}%` }} onMouseDown={handleQteClick} onTouchStart={handleQteClick}>
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]"><circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" /><circle cx="50%" cy="50%" r="36" fill="none" stroke={isBoss ? "#ef4444" : "#fbbf24"} strokeWidth="6" strokeDasharray="226" strokeDashoffset={226 * (1 - (qteRef.current.timer / qteRef.current.maxTime))} className="transition-all duration-75 ease-linear"/></svg>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white active:scale-90 transition-transform ${isBoss ? 'bg-red-600 shadow-[0_0_15px_red]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'}`}><Target size={24} className="text-white animate-spin-slow" /></div>
            </button>
        )}
        
        <div className="absolute top-24 text-center flex flex-col items-center">
            <div className={`w-24 h-24 ${isBoss ? 'animate-[shake_0.2s_infinite]' : 'animate-[bounce_2s_infinite]'} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}><FishRenderer visual={activeFish?.visual} /></div>
            <div className={`font-bold text-xl uppercase tracking-widest transition-colors duration-300 mt-2 ${fishState === 'angry' ? 'text-red-500 scale-110' : 'text-blue-300'}`}>{fishState === 'angry' ? '!! ÖFKELİ !!' : 'ÇEKİLİYOR'}</div>
            <div className="text-sm text-slate-400 font-mono mt-1">{distance.toFixed(1)}m</div>
        </div>

        <div className="flex flex-row items-end gap-8 h-64 mb-10 relative">
            <div className={`w-12 h-full bg-slate-800 rounded-full border-2 relative overflow-hidden transition-colors duration-200 ${tension > 80 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-slate-600'}`}>
                <div className={`absolute bottom-0 w-full transition-all duration-75 ease-linear ${tension > 80 ? 'bg-red-600 animate-pulse' : tension > 50 ? 'bg-orange-500' : isBoss ? 'bg-purple-600' : 'bg-green-500'}`} style={{ height: `${tension}%` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"><span className="text-white font-black text-sm drop-shadow-md">{Math.round(tension)}%</span></div>
            </div>
            <div className="h-full w-2 bg-slate-700/50 rounded-full relative">
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 ${isBoss ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-blue-500 shadow-[0_0_10px_blue]'}`} />
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-0.5 ${isBoss ? 'bg-red-400/50' : 'bg-blue-400/50'}`} style={{ height: `${Math.min(100, (distance / params.current.maxDistance) * 100)}%` }} />
                <div className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-75 z-10" style={{ bottom: `${Math.min(100, (distance / params.current.maxDistance) * 100)}%` }}>{isBoss ? '👹' : '🐟'}</div>
            </div>
        </div>

        <button className={`w-32 h-32 rounded-full border-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all duration-100 active:scale-95 ${isReeling ? 'bg-red-600 border-red-400 shadow-red-900/50 scale-95' : isBoss ? 'bg-purple-600 border-purple-400 shadow-purple-900/50 animate-[pulse_1s_infinite]' : 'bg-emerald-600 border-emerald-400 shadow-emerald-900/50 animate-[pulse_2s_infinite]'}`} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp} onTouchStart={handleDown} onTouchEnd={handleUp}>
            <ArrowDown size={40} className={`text-white mb-1 transition-transform ${isReeling ? 'translate-y-2' : ''}`} />
            <span className="text-xs font-black text-white tracking-widest">{isReeling ? 'ÇEKİYOR' : 'BASILI TUT'}</span>
        </button>
        
        <div className="mt-8 text-center text-slate-400 text-xs font-bold max-w-xs leading-relaxed opacity-80">
            {isBoss ? (
                <span className="text-red-400 animate-pulse">DİKKAT! BOSS ÇOK GÜÇLÜ!<br/>Çok kısa aralıklarla çek!</span>
            ) : (
                <>Misinayı koparmadan (Kırmızı Bar) balığı kendine çek.<br/><span className="text-yellow-500">Öfkeliyken DUR. Hedef çıkarsa VUR!</span></>
            )}
        </div>
        <style>{`
            @keyframes pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } } 
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
        `}</style>
    </div>
  );
};
