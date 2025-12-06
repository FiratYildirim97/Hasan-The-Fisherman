
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';
import { GameState } from '../types';
import { Fish, Skull, Disc } from 'lucide-react';

export const DivingMinigame: React.FC = () => {
    const { gameState, endDiving, playSound } = useGame();
    const [diverX, setDiverX] = useState(50);
    const [oxygen, setOxygen] = useState(100);
    const [score, setScore] = useState(0);
    const [depth, setDepth] = useState(0);
    
    // Entities: Pearls, Jellyfish
    const [entities, setEntities] = useState<{id: number, x: number, y: number, type: 'pearl' | 'jelly' | 'gold'}[]>([]);

    const requestRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const scoreRef = useRef(0);
    const diverXRef = useRef(50);
    const controlRef = useRef<'left' | 'right' | null>(null);

    useEffect(() => {
        if (gameState !== GameState.DIVING) return;
        
        // Reset
        setDiverX(50); diverXRef.current = 50;
        setOxygen(100);
        setScore(0); scoreRef.current = 0;
        setDepth(0);
        setEntities([]);
        lastSpawnRef.current = Date.now();
        controlRef.current = null;

        const loop = () => {
            // Oxygen Decay
            setOxygen(prev => Math.max(0, prev - 0.1));
            setDepth(prev => prev + 0.1);

            // Movement
            if (controlRef.current === 'left') diverXRef.current = Math.max(5, diverXRef.current - 1.5);
            if (controlRef.current === 'right') diverXRef.current = Math.min(95, diverXRef.current + 1.5);
            setDiverX(diverXRef.current);

            // Spawning (y=100 is bottom, moves to y=0 top)
            if (Date.now() - lastSpawnRef.current > 500) {
                const typeRand = Math.random();
                const type = typeRand < 0.6 ? 'jelly' : typeRand < 0.9 ? 'pearl' : 'gold';
                setEntities(prev => [...prev, {
                    id: Date.now(),
                    x: Math.random() * 90 + 5,
                    y: 120, // Start below screen
                    type
                }]);
                lastSpawnRef.current = Date.now();
            }

            // Move Entities Up & Collision
            setEntities(prev => {
                return prev.map(e => ({...e, y: e.y - 0.8})).filter(e => {
                    // Remove if off screen
                    if (e.y < -10) return false;

                    // Collision Box (Diver is at Y=20 roughly, width 10%)
                    const distX = Math.abs(e.x - diverXRef.current);
                    const distY = Math.abs(e.y - 20); // Diver is fixed at top area

                    if (distX < 8 && distY < 8) {
                        if (e.type === 'jelly') {
                            setOxygen(o => Math.max(0, o - 20));
                            playSound('fail');
                            // Visual feedback could be added here
                        } else {
                            const points = e.type === 'gold' ? 100 : 25;
                            scoreRef.current += points;
                            setScore(scoreRef.current);
                            playSound('success');
                        }
                        return false; // Remove entity
                    }
                    return true;
                });
            });

            if (oxygen <= 0) {
                endDiving(scoreRef.current);
                return;
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);

    }, [gameState, oxygen]); // Re-bind if oxygen changes to check game over condition properly

    const handleTouchStart = (side: 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        controlRef.current = side;
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        controlRef.current = null;
    };

    if (gameState !== GameState.DIVING) return null;

    return (
        <div className="absolute inset-0 z-50 bg-indigo-900 overflow-hidden select-none">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0f172a,#1e1b4b)] opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[200%] h-[200%] bg-[radial-gradient(circle,transparent_20%,#000_100%)]" />
            </div>

            {/* UI */}
            <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center z-20">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Oksijen</span>
                    <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-500">
                        <div 
                            className={`h-full transition-all duration-200 ${oxygen < 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} 
                            style={{ width: `${oxygen}%` }} 
                        />
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-yellow-400 font-black text-2xl">{score}</div>
                    <div className="text-slate-400 text-xs font-mono">{Math.floor(depth)}m</div>
                </div>
            </div>

            {/* Diver */}
            <div 
                className="absolute top-[20%] w-12 h-12 transition-transform duration-75 z-10"
                style={{ 
                    left: `${diverX}%`, 
                    transform: `translateX(-50%) rotate(${controlRef.current === 'left' ? -15 : controlRef.current === 'right' ? 15 : 0}deg)` 
                }}
            >
                <div className="text-4xl filter drop-shadow-[0_0_10px_cyan]">🤿</div>
                {/* Bubbles */}
                <div className="absolute -top-4 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-[floatUp_1s_infinite]" />
            </div>

            {/* Entities */}
            {entities.map(e => (
                <div 
                    key={e.id}
                    className="absolute w-10 h-10 flex items-center justify-center transition-none z-0"
                    style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }}
                >
                    {e.type === 'jelly' && <div className="text-3xl animate-pulse filter drop-shadow-[0_0_5px_red]">🪼</div>}
                    {e.type === 'pearl' && <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] animate-bounce" />}
                    {e.type === 'gold' && <div className="w-5 h-5 rounded-full bg-yellow-400 shadow-[0_0_10px_orange] animate-spin-slow border-2 border-white" />}
                </div>
            ))}

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex z-30">
                <div 
                    className="flex-1 active:bg-white/5 transition-colors border-r border-white/5"
                    onMouseDown={handleTouchStart('left')} 
                    onMouseUp={handleTouchEnd}
                    onTouchStart={handleTouchStart('left')}
                    onTouchEnd={handleTouchEnd}
                />
                <div 
                    className="flex-1 active:bg-white/5 transition-colors"
                    onMouseDown={handleTouchStart('right')} 
                    onMouseUp={handleTouchEnd}
                    onTouchStart={handleTouchStart('right')}
                    onTouchEnd={handleTouchEnd}
                />
            </div>

            <div className="absolute bottom-10 w-full text-center text-white/30 text-xs pointer-events-none font-bold uppercase tracking-widest animate-pulse">
                &lt; Sola Basılı Tut | Sağa Basılı Tut &gt;
            </div>
        </div>
    );
};
