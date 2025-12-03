import React, { useEffect, useState } from 'react';
import { useGame } from '../GameContext';
import { RODS, LOCATIONS, BOBBERS } from '../constants';
import { GameState, WeatherType, FishVisual } from '../types';

export const Scene: React.FC = () => {
  const { stats, gameState, weather, toast, floatingTexts, catchVisual, supplyCrate, collectCrate, playSound, timeOfDay } = useGame();
  const location = LOCATIONS[stats.locId];
  const rod = RODS[stats.rodId];

  const [ripples, setRipples] = useState<{id:number, x:number, y:number}[]>([]);

  const getTheme = () => {
    if (timeOfDay === 'night') return { sky: ['#0f172a', '#312e81'], water: ['#1e1b4b', '#312e81'], sun: '#fcd34d' };
    if (timeOfDay === 'sunset') return { sky: ['#4c1d95', '#fb923c'], water: ['#5b21b6', '#c2410c'], sun: '#fb923c' };
    
    if (location.biome === 'ice') return { sky: ['#e0f2fe', '#bae6fd'], water: ['#0ea5e9', '#0284c7'], sun: '#fdfbf7' };
    if (location.biome === 'tropical') return { sky: ['#06b6d4', '#67e8f9'], water: ['#0891b2', '#22d3ee'], sun: '#fef08a' };
    if (location.biome === 'coastal') return { sky: ['#38bdf8', '#7dd3fc'], water: ['#0369a1', '#0ea5e9'], sun: '#fde047' };
    if (location.biome === 'ocean') return { sky: ['#1e3a8a', '#1e40af'], water: ['#172554', '#1e3a8a'], sun: '#fde047' };
    
    return { sky: ['#0ea5e9', '#bae6fd'], water: ['#0284c7', '#7dd3fc'], sun: '#fde047' };
  };

  const theme = getTheme();
  const activeBobber = BOBBERS.find(b => b.id === stats.bobberId) || BOBBERS[0];

  const handleSceneClick = (e: React.MouseEvent) => {
      if (gameState === GameState.IDLE) {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          if (y > 60) {
              const id = Date.now();
              setRipples(prev => [...prev, { id, x, y }]);
              playSound('splash');
              setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
          }
      }
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-slate-900 select-none" onClick={handleSceneClick}>
      <LocationScene 
        locId={stats.locId} 
        theme={theme}
        weather={weather}
        timeOfDay={timeOfDay}
        biome={location.biome}
      />
      {ripples.map(r => (
          <div key={r.id} className="absolute w-4 h-4 border-2 border-white/50 rounded-full animate-[splash_1s_ease-out] pointer-events-none" style={{ left: `${r.x}%`, top: `${r.y}%` }} />
      ))}
      {supplyCrate && supplyCrate.active && (
          <div 
            className="absolute w-12 h-12 bg-amber-700 border-2 border-amber-500 rounded flex items-center justify-center text-2xl animate-[float_4s_ease-in-out_infinite] cursor-pointer hover:scale-110 transition-transform shadow-lg z-20"
            style={{ left: `${supplyCrate.x}%`, top: `${supplyCrate.y}%` }}
            onClick={(e) => { e.stopPropagation(); collectCrate(); }}
          >
             📦
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
      )}
      {catchVisual && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {catchVisual.shiny && <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay z-10" />}
          {catchVisual.rarity >= 4 && (
             <div className="absolute bottom-[20%] w-[500px] h-[800px] bg-gradient-to-t from-yellow-400/30 to-transparent clip-triangle origin-bottom animate-[godray_2s_ease-out]" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          )}
          <div className="absolute bottom-[20%] animate-[fishRise_1s_cubic-bezier(0.18,0.89,0.32,1.28)_forwards] filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ filter: catchVisual.shiny ? 'hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 20px cyan)' : '' }}>
            <div className="w-48 h-48"><FishRenderer visual={catchVisual.visual} /></div>
          </div>
        </div>
      )}
      {floatingTexts.map(ft => (
        <div key={ft.id} className={`absolute z-[60] pointer-events-none animate-[floatUp_1.5s_ease-out_forwards] ${ft.color} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-2xl font-black tracking-wide`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
          {ft.text}
        </div>
      ))}
      <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {toast && (
          <div className="px-6 py-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl text-center">
            <div className={`font-bold text-lg ${toast.color}`}>{toast.msg}</div>
            {toast.sub && <div className="text-xs text-slate-400 font-medium">{toast.sub}</div>}
          </div>
        )}
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-0 flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 backdrop-blur-sm rounded-full border border-white/10 shadow-sm">
         <span className="text-2xl">{location.icon}</span>
         <span className="font-bold text-white uppercase tracking-widest text-xs drop-shadow-md">{location.name}</span>
         <span className="ml-2 text-xl">{weather === WeatherType.STORM ? '⛈️' : weather === WeatherType.RAIN ? '🌧️' : '☀️'}</span>
      </div>
      <FishingRodSystem gameState={gameState} rodColor={rod.color} timeOfDay={timeOfDay} bobberIcon={activeBobber.icon} />
      <style>{`
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
        @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(100vh); } }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); scale: 1; } 100% { opacity: 0; transform: translateY(-60px); scale: 1.1; } }
        @keyframes splash { 0% { opacity: 1; transform: scale(0); border-width: 4px; } 100% { opacity: 0; transform: scale(2.5); border-width: 0px; } }
        @keyframes fishRise { 0% { transform: translateY(100px) scale(0) rotate(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-150px) scale(1.5) rotate(360deg); opacity: 0; } }
        @keyframes godray { 0% { opacity: 0; transform: rotate(-10deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: rotate(10deg); } }
        @keyframes sinkHook { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 1; } 100% { transform: translateY(120px); } }
        @keyframes castLine { 
            0% { d: path("M150,150 Q150,150 150,150"); stroke-width: 0; } 
            50% { d: path("M150,150 Q250,50 350,200"); stroke-width: 2; } 
            100% { d: path("M150,150 Q160,300 180,380"); stroke-width: 1.5; } 
        }
        @keyframes castBobber {
            0% { transform: translate(150px, 150px) scale(0); }
            50% { transform: translate(350px, 200px) scale(1); }
            100% { transform: translate(180px, 380px) scale(1); }
        }
        @keyframes bob { 
            0%, 100% { transform: translateY(0); } 
            50% { transform: translateY(4px); } 
        }
      `}</style>
    </div>
  );
};

export const FishRenderer: React.FC<{ visual?: FishVisual }> = ({ visual }) => {
  if (!visual) return <span>🐟</span>;
  const { shape, bodyColor, finColor, pattern } = visual;
  const uniqueId = React.useId();
  
  let bodyPath = "";
  switch (shape) {
    case 'shark': bodyPath = "M90,30 Q60,10 20,40 Q60,70 90,50 Q100,40 90,30"; break;
    case 'carp': bodyPath = "M85,35 Q60,10 20,40 Q60,70 85,45 Q95,40 85,35"; break;
    case 'trout': bodyPath = "M90,35 Q50,20 15,40 Q50,60 90,45 Q100,40 90,35"; break;
    case 'round': bodyPath = "M80,40 A30,30 0 1,1 20,40 A30,30 0 1,1 80,40"; break;
    case 'long': bodyPath = "M90,30 Q50,25 10,35 Q50,55 90,50 Q95,40 90,30"; break;
    case 'blob': bodyPath = "M50,40 Q70,10 90,40 Q70,70 50,40 Q30,70 10,40 Q30,10 50,40"; break;
    case 'boot': bodyPath = "M30,10 L60,10 L65,60 L80,60 Q90,60 90,80 L20,80 Q20,60 30,50 Z"; break;
    case 'can': bodyPath = "M30,20 H70 V80 H30 Z"; break;
    case 'coin':
    case 'ring': bodyPath = "M80,50 A30,30 0 1,1 20,50 A30,30 0 1,1 80,50"; break;
    case 'crab': bodyPath = "M20,50 Q20,30 50,30 Q80,30 80,50 Q80,70 50,70 Q20,70 20,50"; break;
    case 'swordfish': bodyPath = "M95,30 L60,25 Q30,30 10,40 Q30,50 60,55 Q80,50 85,45"; break;
    case 'catfish': bodyPath = "M85,35 Q60,15 20,40 Q60,65 85,45"; break;
    case 'eel': bodyPath = "M90,25 Q60,35 40,25 T10,40 Q30,60 60,50 T90,25"; break;
    case 'angler': bodyPath = "M80,50 A30,30 0 1,1 20,50 A30,30 0 1,1 80,50"; break;
    case 'squid': bodyPath = "M80,30 Q50,20 40,40 Q50,60 80,50 Q90,40 80,30"; break;
    case 'whale': bodyPath = "M90,40 Q60,20 20,40 Q60,80 90,60 Q95,50 90,40"; break;
    default: bodyPath = "M85,35 Q60,10 20,40 Q60,70 85,45 Q95,40 85,35";
  }
  const textureUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cyprinus_carpio_02.jpg/640px-Cyprinus_carpio_02.jpg";

  return (
    <svg viewBox="0 0 100 80" className="drop-shadow-lg overflow-visible">
      <defs>
        <clipPath id={`clip-${uniqueId}`}><path d={bodyPath} /></clipPath>
        <radialGradient id={`highlight-${uniqueId}`} cx="50%" cy="20%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.6"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
        <linearGradient id={`shadow-${uniqueId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" stopOpacity="0"/><stop offset="100%" stopColor="black" stopOpacity="0.4"/></linearGradient>
      </defs>
      <path d={bodyPath} fill={bodyColor} />
      <image href={textureUrl} x="0" y="0" width="100" height="80" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'overlay', opacity: 0.8 }} />
      <image href={textureUrl} x="0" y="0" width="100" height="80" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'luminosity', opacity: 0.4 }} />
      {pattern === 'stripes' && <path d="M40,10 V70 M50,10 V70 M60,10 V70" stroke="black" strokeWidth="2" strokeOpacity="0.2" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'multiply' }} />}
      {pattern === 'spots' && <g fill="black" fillOpacity="0.2" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'multiply' }}><circle cx="30" cy="40" r="2" /><circle cx="50" cy="30" r="3" /><circle cx="60" cy="50" r="2" /><circle cx="70" cy="35" r="2" /></g>}
      <path d={bodyPath} fill={`url(#highlight-${uniqueId})`} style={{ mixBlendMode: 'screen' }} />
      <path d={bodyPath} fill={`url(#shadow-${uniqueId})`} style={{ mixBlendMode: 'multiply' }} />
      {shape !== 'round' && shape !== 'coin' && shape !== 'ring' && shape !== 'boot' && shape !== 'can' && (
         <>
            <path d="M45,30 L35,10 L55,10 Z" fill={finColor} opacity="0.8" style={{ mixBlendMode: 'multiply' }} transform="translate(10,0)" />
            <path d="M20,40 L5,25 L5,55 Z" fill={finColor} opacity="0.9" style={{ mixBlendMode: 'multiply' }} />
         </>
      )}
      {shape !== 'boot' && shape !== 'can' && shape !== 'coin' && shape !== 'ring' && (<g transform="translate(75, 35)"><circle r="3.5" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" /><circle r="1.5" fill="black" /><circle cx="0.8" cy="-0.8" r="0.8" fill="white" /></g>)}
      {pattern === 'shiny' && <circle cx="50" cy="40" r="30" fill="white" opacity="0.5" className="animate-pulse" style={{ mixBlendMode: 'screen' }} />}
    </svg>
  );
};

const LocationScene: React.FC<{ locId: number, theme: { sky: string[], water: string[], sun: string }, weather: WeatherType, timeOfDay: string, biome: string }> = ({ locId, theme, weather, timeOfDay, biome }) => {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]})` }}>
       <svg className="w-full h-full absolute inset-0 z-0" preserveAspectRatio="none">
          <defs>
             <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={theme.water[0]} stopOpacity="0.8"/><stop offset="100%" stopColor={theme.water[1]} stopOpacity="0.95"/></linearGradient>
             <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="85%" cy="15%" r={timeOfDay === 'night' ? 30 : 50} fill={timeOfDay === 'night' ? '#f1f5f9' : theme.sun} filter="url(#glow)" opacity="0.9">{timeOfDay === 'night' && <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />}</circle>
          {biome === 'freshwater' && (
             <g>
                <path d="M-50,550 Q150,300 450,550" fill="#1e293b" opacity="0.6" />
                <path d="M0,450 Q100,250 200,450" fill="#0f172a" opacity="0.8" />
                <path d="M300,450 Q400,250 500,450" fill="#0f172a" opacity="0.7" />
                <path d="M100,450 L120,350 L140,450" fill="#064e3b" />
                <path d="M50,480 L70,380 L90,480" fill="#064e3b" />
             </g>
          )}
          {biome === 'tropical' && (
             <g>
                <path d="M50,500 Q150,450 250,500" fill="#d4d404" opacity="0.9" />
                <path d="M150,450 Q160,350 200,300" stroke="#8b4513" strokeWidth="5" fill="none" />
                <path d="M200,300 L150,350 M200,300 L250,350 M200,300 L200,250" stroke="#16a34a" strokeWidth="3" />
             </g>
          )}
          {biome === 'coastal' && (
             <g>
                <path d="M300,500 L350,300 L450,500" fill="#475569" />
                <path d="M250,500 L300,400 L350,500" fill="#334155" />
             </g>
          )}
          {biome === 'ice' && (
             <g>
                <path d="M0,500 L100,300 L200,500" fill="#e2e8f0" opacity="0.9" />
                <path d="M150,500 L250,250 L350,500" fill="#cbd5e1" opacity="0.8" />
                <path d="M300,500 L400,350 L500,500" fill="#94a3b8" opacity="0.9" />
             </g>
          )}
          {biome === 'ocean' && (
             <g>
                <rect x="0" y="450" width="100%" height="50" fill="#1e3a8a" opacity="0.3" />
             </g>
          )}
          <rect x="0" y="65%" width="100%" height="35%" fill="url(#waterGrad)" />
       </svg>
       <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none" preserveAspectRatio="none">
          {weather !== WeatherType.SUNNY && <g>{[...Array(40)].map((_, i) => (<line key={i} x1={Math.random() * 100 + "%"} y1={-20} x2={Math.random() * 100 - 10 + "%"} y2={120 + "%"} stroke="white" strokeWidth={weather === WeatherType.STORM ? 2 : 1} opacity={0.4} className="animate-[fall_0.5s_linear_infinite]" style={{ animationDelay: `${Math.random()}s`, animationDuration: `${0.5 + Math.random() * 0.3}s` }} />))}</g>}
       </svg>
    </div>
  );
};

const FishingRodSystem: React.FC<{ gameState: GameState, rodColor: string, timeOfDay: string, bobberIcon: string }> = ({ gameState, rodColor, timeOfDay, bobberIcon }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax slice">
        <g className={`transition-transform duration-700 origin-[350px_450px] ${gameState === GameState.CASTING ? 'rotate-[-35deg]' : ''}`}>
            <path d="M350,550 L150,150" stroke={rodColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="250" cy="350" r="3" fill="#333" />
            <circle cx="200" cy="250" r="3" fill="#333" />
            <path 
                d={gameState === GameState.CASTING ? "M150,150 Q250,50 350,200" : "M150,150 Q160,300 180,380"} 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="1.5" 
                fill="none" 
                className={gameState === GameState.CASTING ? 'animate-[castLine_0.5s_ease-out_forwards]' : ''}
            />
            <g 
                transform={gameState === GameState.CASTING ? "translate(350, 200)" : "translate(180, 380)"}
                className={gameState === GameState.CASTING ? 'animate-[castBobber_0.5s_ease-out_forwards]' : ''}
            >
                <g className={(gameState === GameState.WAITING || gameState === GameState.BITE) ? 'animate-[bob_1.5s_ease-in-out_infinite]' : ''}>
                    <circle r="8" fill="red" stroke="white" strokeWidth="1" />
                    <circle r="8" fill="white" clipPath="inset(50% 0 0 0)" />
                </g>
                {(gameState === GameState.WAITING || gameState === GameState.BITE) && (
                    <g className="animate-[sinkHook_3s_ease-out_forwards]">
                        <line x1="0" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                        <g transform="translate(0, 100)">
                            <path d="M-3,-5 Q0,0 3,-5 M0,-5 V5 Q0,10 4,8" stroke="silver" fill="none" strokeWidth="1.5" />
                            <circle r="2" fill="yellow" className="animate-pulse" /> 
                        </g>
                    </g>
                )}
            </g>
        </g>
      </svg>
    </div>
  );
};