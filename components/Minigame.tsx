
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '../GameContext';
import { RODS } from '../constants';
import { Anchor, AlertOctagon, Zap, Target, HelpCircle } from 'lucide-react';
import { FishRenderer } from './Scene';
import { WeatherType, GameState } from '../types';

export const Minigame: React.FC = () => {
    const { gameState, activeFish, stats, reelIn, playSound } = useGame();

    // -- Oyun Durumu --
    const [progress, setProgress] = useState(0);
    const [tension, setTension] = useState(0);
    const [cursorPos, setCursorPos] = useState(0); // 0 - 100

    // -- Referanslar (Physics Loop için) --
    const progressRef = useRef(0);
    const tensionRef = useRef(0);
    const cursorPosRef = useRef(0);
    const cursorDirRef = useRef(1); // 1: sağa, -1: sola
    const requestRef = useRef<number>(0);
    
    // -- Konfigürasyon --
    const config = useRef({
        speed: 2,
        targetStart: 40,
        targetWidth: 20,
        progressGain: 25,
        failPenalty: 12
    });

    const endGame = useCallback((success: boolean, snapped: boolean) => {
        cancelAnimationFrame(requestRef.current);
        // %95 üzeri ilerleme "Perfect" sayılır
        reelIn(success, snapped, success && progressRef.current > 95);
    }, [reelIn]);

    useEffect(() => {
        if (gameState === GameState.MINIGAME && activeFish) {
            const rod = RODS[stats.rodId];
            const rarity = activeFish.rarity;
            
            // KOLAYLAŞTIRMA: Temel genişlik 15'ten 22'ye çıkarıldı.
            const width = Math.min(45, 22 + (rod.power * 2.2));
            
            // KOLAYLAŞTIRMA: Hız ölçeklendirmesi 0.6'dan 0.45'e düşürüldü.
            const speed = 1.3 + (rarity * 0.45);
            
            // Rastgele bir hedef başlangıç noktası
            const start = 10 + Math.random() * (80 - width);

            config.current = {
                speed,
                targetStart: start,
                targetWidth: width,
                progressGain: 22 + (rod.power * 1.5),
                // KOLAYLAŞTIRMA: Hata cezası düşürüldü.
                failPenalty: Math.max(5, 12 - (rod.power * 0.5))
            };

            progressRef.current = 0;
            tensionRef.current = 0;
            cursorPosRef.current = 0;
            cursorDirRef.current = 1;
            
            setProgress(0);
            setTension(0);
            setCursorPos(0);
        }
    }, [gameState, activeFish, stats.rodId]);

    useEffect(() => {
        if (gameState !== GameState.MINIGAME) return;

        const loop = () => {
            const cfg = config.current;
            
            // İmleç hareketi
            cursorPosRef.current += (cfg.speed * cursorDirRef.current);
            
            if (cursorPosRef.current >= 100) {
                cursorPosRef.current = 100;
                cursorDirRef.current = -1;
            } else if (cursorPosRef.current <= 0) {
                cursorPosRef.current = 0;
                cursorDirRef.current = 1;
            }

            setCursorPos(cursorPosRef.current);
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    const handleAction = (e?: React.SyntheticEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const cfg = config.current;
        const isHit = cursorPosRef.current >= cfg.targetStart && cursorPosRef.current <= (cfg.targetStart + cfg.targetWidth);

        if (isHit) {
            playSound('success');
            progressRef.current = Math.min(100, progressRef.current + cfg.progressGain);
            setProgress(progressRef.current);
            
            // Başarılı vuruşta hedef bölge yer değiştirsin
            config.current.targetStart = 10 + Math.random() * (80 - cfg.targetWidth);
            
            if (progressRef.current >= 100) {
                endGame(true, false);
            }
        } else {
            playSound('fail');
            tensionRef.current = Math.min(100, tensionRef.current + cfg.failPenalty);
            setTension(tensionRef.current);
            
            if (tensionRef.current >= 100) {
                endGame(false, true);
            }
        }
    };

    if (gameState !== GameState.MINIGAME) return null;

    const cfg = config.current;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-[0.3em] mb-2 italic">
                    KRİTİK VURUŞ
                </h2>
                <div className="flex items-center justify-center gap-3">
                    <div className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                        <HelpCircle size={12} className="text-cyan-400" />
                        {activeFish?.isBoss ? 'GİZEMLİ DEV' : 'BİLİNMEYEN AV'}
                    </div>
                    {activeFish?.isBoss && (
                        <div className="flex items-center gap-1 text-red-500 animate-pulse bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                            <AlertOctagon size={14} /> 
                            <span className="font-black text-[10px] tracking-widest">TEHLİKE</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Game Interface */}
            <div className="w-full max-w-md flex flex-col items-center gap-12">
                
                {/* Visual Status Bars */}
                <div className="w-full space-y-6">
                    {/* Catch Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">MÜCADELE</span>
                            <span className="text-xs font-mono font-bold text-white">{Math.floor(progress)}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Line Tension */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">MİSİNA GERİLİMİ</span>
                            <span className="text-xs font-mono font-bold text-white">{Math.floor(tension)}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${tension > 75 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}
                                style={{ width: `${tension}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* The Timing Bar */}
                <div className="relative w-full h-24 bg-slate-900/50 rounded-3xl border-4 border-slate-800 shadow-2xl flex items-center px-4">
                    {/* Background Decorative Lines */}
                    <div className="absolute inset-0 flex justify-between px-8 py-4 opacity-10 pointer-events-none">
                        {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white" />)}
                    </div>

                    {/* Target Zone (Sweet Spot) */}
                    <div 
                        className="absolute h-12 bg-gradient-to-b from-green-400/40 to-emerald-600/40 border-x-2 border-emerald-400 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(52,211,153,0.3)] flex items-center justify-center overflow-hidden"
                        style={{ 
                            left: `${cfg.targetStart}%`, 
                            width: `${cfg.targetWidth}%`,
                            transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                        }}
                    >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:50px_50px] animate-[marquee_2s_linear_infinite]" />
                         <Target size={20} className="text-emerald-300/50" />
                    </div>

                    {/* Cursor */}
                    <div 
                        className="absolute w-1.5 h-16 bg-white shadow-[0_0_20px_white] rounded-full z-20 transition-none"
                        style={{ left: `${cursorPos}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white"><Zap size={14} fill="white" /></div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white rotate-180"><Zap size={14} fill="white" /></div>
                    </div>
                </div>

                {/* Big Action Button */}
                <button
                    onMouseDown={handleAction}
                    onTouchStart={handleAction}
                    className="group relative w-full py-8 bg-gradient-to-b from-blue-500 to-blue-700 active:scale-95 active:from-blue-800 transition-all rounded-[2rem] shadow-[0_10px_40px_rgba(37,99,235,0.4)] border-b-8 border-blue-900 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center gap-1">
                        <span className="text-3xl font-black text-white tracking-[0.1em] drop-shadow-md uppercase">Vuruş Yap!</span>
                        <span className="text-[10px] text-blue-200 font-bold opacity-70 uppercase tracking-widest">Tam hizadayken yakala</span>
                    </div>
                    
                    {/* Visual Pulse for Hint */}
                    <div className="absolute inset-0 border-4 border-white/20 rounded-[2rem] animate-ping pointer-events-none opacity-20" />
                </button>
            </div>

            {/* Mystery Indicator instead of Fish Image */}
            <div className="mt-auto flex flex-col items-center opacity-40">
                <div className="w-24 h-24 flex items-center justify-center bg-slate-800 rounded-full border-4 border-slate-700 animate-pulse mb-2">
                    <HelpCircle size={48} className="text-slate-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Bilinmiyor...</span>
            </div>

            <style>{`
                @keyframes marquee {
                    from { background-position: 0 0; }
                    to { background-position: 50px 0; }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};
