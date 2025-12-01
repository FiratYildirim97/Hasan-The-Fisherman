
import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../GameContext';
import { RODS, LOCATIONS } from '../constants';
import { GameState, WeatherType } from '../types';

export const Scene: React.FC = () => {
  const { stats, gameState, weather, toast, floatingTexts, catchVisual } = useGame();
  const location = LOCATIONS[stats.locId];
  const rod = RODS[stats.rodId];

  // Day/Night Cycle State
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 21) setTimeOfDay('sunset');
      else setTimeOfDay('night');
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTheme = () => {
    if (timeOfDay === 'night') return { sky: ['#0f172a', '#312e81'], water: ['#1e1b4b', '#312e81'], sun: '#fcd34d' };
    if (timeOfDay === 'sunset') return { sky: ['#4c1d95', '#fb923c'], water: ['#5b21b6', '#c2410c'], sun: '#fb923c' };
    // Day
    return { sky: ['#0ea5e9', '#bae6fd'], water: ['#0284c7', '#7dd3fc'], sun: '#fde047' };
  };

  const theme = getTheme();

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-slate-900 select-none">
      
      {/* 1. HIGH FIDELITY BACKGROUND */}
      <LocationScene 
        locId={stats.locId} 
        theme={theme}
        weather={weather}
        timeOfDay={timeOfDay}
      />
      
      {/* 2. CATCH ANIMATIONS LAYER */}
      {catchVisual && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* God Ray for Rare+ */}
          {catchVisual.rarity >= 4 && (
             <div className="absolute bottom-[20%] w-[500px] h-[800px] bg-gradient-to-t from-yellow-400/30 to-transparent clip-triangle origin-bottom animate-[godray_2s_ease-out]" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          )}

          {/* Rising Fish */}
          <div className="absolute bottom-[20%] text-8xl animate-[fishRise_1s_cubic-bezier(0.18,0.89,0.32,1.28)_forwards] filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            {catchVisual.emoji}
          </div>
        </div>
      )}

      {/* 3. Floating Texts */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id}
          className={`absolute z-[60] pointer-events-none animate-[floatUp_1.5s_ease-out_forwards] ${ft.color} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-2xl font-black tracking-wide`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {/* 4. Toast Notification */}
      <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {toast && (
          <div className="px-6 py-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl text-center">
            <div className={`font-bold text-lg ${toast.color}`}>{toast.msg}</div>
            {toast.sub && <div className="text-xs text-slate-400 font-medium">{toast.sub}</div>}
          </div>
        )}
      </div>

      {/* 5. Location Sign */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-0 flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 backdrop-blur-sm rounded-full border border-white/10 shadow-sm">
         <span className="text-2xl">{location.icon}</span>
         <span className="font-bold text-white uppercase tracking-widest text-xs drop-shadow-md">{location.name}</span>
         <span className="ml-2 text-xl">{weather === WeatherType.STORM ? '⛈️' : weather === WeatherType.RAIN ? '🌧️' : '☀️'}</span>
      </div>

      {/* 6. FISHING ROD & LINE SYSTEM */}
      <FishingRodSystem 
        gameState={gameState} 
        rodColor={rod.color} 
        timeOfDay={timeOfDay}
      />

      <style>{`
        @keyframes float { from { transform: translateX(0); } to { transform: translateX(100vw); } }
        @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(100vh); } }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); scale: 1; } 100% { opacity: 0; transform: translateY(-60px); scale: 1.1; } }
        @keyframes splash { 0% { opacity: 1; transform: scale(0); border-width: 4px; } 100% { opacity: 0; transform: scale(2.5); border-width: 0px; } }
        @keyframes fishRise { 0% { transform: translateY(100px) scale(0) rotate(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-150px) scale(1.5) rotate(360deg); opacity: 0; } }
        @keyframes godray { 0% { opacity: 0; transform: rotate(-10deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: rotate(10deg); } }
      `}</style>
    </div>
  );
};

// --- VECTOR ART ENGINE ---

const LocationScene: React.FC<{ 
  locId: number, 
  theme: { sky: string[], water: string[], sun: string }, 
  weather: WeatherType,
  timeOfDay: string
}> = ({ locId, theme, weather, timeOfDay }) => {
  
  // Dynamic Waves
  const waves = useMemo(() => Array.from({length: 4}).map((_, i) => ({
     y: 65 + i * 5,
     speed: 3 + i * 2,
     offset: i * 30
  })), []);

  return (
    <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]})` }}>
       <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
             <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={theme.water[0]} stopOpacity="0.8"/>
                <stop offset="100%" stopColor={theme.water[1]} stopOpacity="0.95"/>
             </linearGradient>
             <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
             </filter>
          </defs>

          {/* CELESTIAL BODY */}
          <circle cx="85%" cy="15%" r={timeOfDay === 'night' ? 30 : 50} fill={timeOfDay === 'night' ? '#f1f5f9' : theme.sun} filter="url(#glow)" opacity="0.9">
             {timeOfDay === 'night' && <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />}
          </circle>

          {/* CLOUDS (Common) */}
          {weather !== WeatherType.STORM && (
             <g fill="#fff" opacity={timeOfDay === 'night' ? "0.1" : "0.3"}>
               <path d="M100,100 Q120,80 150,100 T220,100 T280,100" stroke="white" strokeWidth="20" strokeLinecap="round" className="animate-[float_60s_linear_infinite]" />
               <path d="M400,150 Q430,120 480,150 T550,150" stroke="white" strokeWidth="15" strokeLinecap="round" className="animate-[float_45s_linear_infinite]" style={{ animationDelay: '-20s' }} />
             </g>
          )}

          {/* --- SCENERY LAYERS --- */}
          
          {/* 0: KÖY DERESİ (Creek) */}
          {locId === 0 && (
            <g>
              {/* Back Hills */}
              <path d="M0,400 Q150,250 300,400 T600,350 T900,400 V600 H0 Z" fill="#166534" opacity="0.6" />
              {/* Front Bank */}
              <path d="M-50,600 Q200,450 400,600" fill="#14532d" />
              <path d="M500,600 Q700,480 950,600" fill="#14532d" />
              {/* Trees */}
              <g transform="translate(100, 380) scale(0.8)">
                 <path d="M0,0 L20,-60 L40,0 Z" fill="#15803d" />
                 <path d="M20,-20 L20,10" stroke="#3f2c22" strokeWidth="4" />
              </g>
              <g transform="translate(800, 420) scale(1.2)">
                 <path d="M0,0 L30,-80 L60,0 Z" fill="#15803d" />
                 <path d="M30,-20 L30,10" stroke="#3f2c22" strokeWidth="6" />
              </g>
            </g>
          )}

          {/* 1: SAZLIK GÖL (Lake) */}
          {locId === 1 && (
            <g>
              {/* Distant Trees */}
              <path d="M0,380 L50,340 L100,380 L150,350 L200,380 L250,340 L300,380 L350,350 L400,380 H0 Z" fill="#3f6212" opacity="0.5" />
              {/* Reeds */}
              {[...Array(20)].map((_,i) => (
                 <line key={i} x1={i*50 + Math.random()*20} y1="600" x2={i*50 + Math.random()*20 + 10} y2={450 + Math.random()*50} stroke="#a3e635" strokeWidth="3" opacity="0.7" />
              ))}
            </g>
          )}

          {/* 2: KAYALIK SAHİL (Coast) */}
          {locId === 2 && (
             <g>
               <path d="M0,600 L100,400 L200,500 L300,450 L400,600 Z" fill="#57534e" />
               <path d="M600,600 L750,350 L850,500 L900,450 L1000,600 Z" fill="#44403c" />
               {/* Lighthouse */}
               <rect x="800" y="250" width="30" height="100" fill="#e11d48" />
               <rect x="800" y="250" width="30" height="10" fill="white" />
               <circle cx="815" cy="250" r="5" fill="yellow" filter="url(#glow)" className="animate-pulse" />
             </g>
          )}

          {/* 3: BÜYÜK NEHİR (River) */}
          {locId === 3 && (
            <g>
               <path d="M0,400 L400,200 L800,400" fill="#0f766e" opacity="0.4" />
               <path d="M200,400 L600,150 L1000,400" fill="#115e59" opacity="0.6" />
            </g>
          )}

          {/* 4: MERCAN RESİFİ (Reef) */}
          {locId === 4 && (
             <g>
                <rect x="0" y="400" width="100%" height="200" fill="url(#waterGrad)" opacity="0.3" />
                {/* Underwater Rocks/Coral hints */}
                <circle cx="200" cy="550" r="40" fill="#ec4899" opacity="0.4" />
                <circle cx="600" cy="500" r="60" fill="#f59e0b" opacity="0.4" />
             </g>
          )}

          {/* 6: AMAZON */}
          {locId === 6 && (
            <g>
               <rect x="0" y="0" width="100%" height="100%" fill="#14532d" opacity="0.2" />
               {/* Hanging Vines */}
               {[...Array(10)].map((_,i) => (
                  <path key={i} d={`M${i*100},0 Q${i*100+20},100 ${i*100},200`} stroke="#365314" strokeWidth="4" fill="none" />
               ))}
               <path d="M0,400 Q500,300 1000,400 V600 H0 Z" fill="#064e3b" />
            </g>
          )}

          {/* 7: FIYORT */}
          {locId === 7 && (
            <g>
               <path d="M0,600 L0,100 L300,400 L400,600" fill="#334155" />
               <path d="M1000,600 L1000,100 L700,400 L600,600" fill="#1e293b" />
               <path d="M0,100 L300,400" fill="none" stroke="#fff" strokeWidth="2" opacity="0.1" />
            </g>
          )}

          {/* 8: DERİN ÇUKUR */}
          {locId === 8 && (
            <g>
               <rect x="0" y="0" width="100%" height="100%" fill="#000" opacity="0.6" />
               {/* Bioluminescence */}
               {[...Array(20)].map((_,i) => (
                  <circle key={i} cx={Math.random()*1000} cy={400 + Math.random()*200} r={Math.random()*3} fill="#22d3ee" className="animate-pulse" style={{ animationDelay: `${Math.random()}s` }} />
               ))}
            </g>
          )}

          {/* 9: ANTARKTİKA */}
          {locId === 9 && (
            <g>
               <path d="M100,400 L250,200 L400,400" fill="#cbd5e1" />
               <path d="M250,200 L300,400 L150,400" fill="#94a3b8" opacity="0.5" />
               <path d="M600,400 L800,150 L1000,400" fill="#e2e8f0" />
            </g>
          )}

          {/* WATER SURFACE (Unified) */}
          <rect x="0" y="65%" width="100%" height="35%" fill="url(#waterGrad)" />
          
          {/* Surface Line */}
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke={theme.water[1]} strokeWidth="4" opacity="0.5" />

          {/* Animated Waves */}
          {waves.map((w, i) => (
             <path 
               key={i}
               d={`M0,${w.y}% Q25%,${w.y - 1}% 50%,${w.y}% T100%,${w.y}%`}
               fill="none" 
               stroke="white" 
               strokeWidth={1} 
               opacity={0.3 - i*0.05}
               className="animate-pulse"
               style={{ animationDuration: `${w.speed}s` }}
             />
          ))}

          {/* RAIN OVERLAY */}
          {weather !== WeatherType.SUNNY && (
             <g>
                {[...Array(40)].map((_, i) => (
                   <line 
                     key={i} 
                     x1={Math.random() * 100 + "%"} y1={-20} 
                     x2={Math.random() * 100 - 10 + "%"} y2={120 + "%"} 
                     stroke="white" strokeWidth={weather === WeatherType.STORM ? 2 : 1} 
                     opacity={0.4}
                     className="animate-[fall_0.5s_linear_infinite]"
                     style={{ animationDelay: `${Math.random()}s`, animationDuration: `${0.5 + Math.random() * 0.3}s` }}
                   />
                ))}
             </g>
          )}
       </svg>
    </div>
  );
};

const FishingRodSystem: React.FC<{ gameState: GameState, rodColor: string, timeOfDay: string }> = ({ gameState, rodColor, timeOfDay }) => {
  // WATER ENTRY POINT
  const waterLevel = 325; // y coordinate matching 65%
  const castX = 150;

  // Calculate Rod Tip Position
  // Idle: High up (300, 100)
  // Casting: Forward (150, 200)
  
  // Bezier Control Points for the Line
  const tipX = gameState === GameState.IDLE ? 300 : 120;
  const tipY = gameState === GameState.IDLE ? 100 : 200;

  const lineColor = timeOfDay === 'night' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)';

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax slice">
        
        {/* ROD */}
        <g className={`transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-[350px_450px]
            ${gameState === GameState.CASTING ? 'rotate-[-35deg]' : ''}
            ${gameState === GameState.WAITING ? 'rotate-[-15deg]' : ''}
            ${gameState === GameState.BITE ? 'rotate-[-10deg] animate-pulse' : ''}
            ${gameState === GameState.MINIGAME ? 'rotate-[-5deg]' : ''}
        `}>
           {/* Handle Grip */}
           <path d="M350,550 L300,400" stroke="#000" strokeWidth="14" strokeLinecap="round" />
           {/* Main Rod */}
           <path d="M350,550 L150,150" stroke={rodColor} strokeWidth="6" strokeLinecap="round" />
           
           {/* Guides */}
           {[0.2, 0.4, 0.6, 0.8, 1].map(t => {
              const x = 350 + (150 - 350) * t;
              const y = 550 + (150 - 550) * t;
              return <circle key={t} cx={x} cy={y} r={3 * (1.2-t)} fill="none" stroke="#94a3b8" strokeWidth="2" />;
           })}

           {/* Reel */}
           <g transform="translate(320, 480)">
             <circle r="15" fill="#1e293b" stroke="#334155" strokeWidth="2" />
             <path d="M0,0 L12,12" stroke="#cbd5e1" strokeWidth="4" className={`${gameState !== GameState.IDLE ? 'animate-spin' : ''}`} style={{ transformOrigin: '0 0' }} />
           </g>
        </g>

        {/* LINE PHYSICS */}
        {(gameState === GameState.WAITING || gameState === GameState.BITE || gameState === GameState.MINIGAME) && (
           <>
             {/* The String */}
             <path 
               d={`M120,200 C120,300 150,280 ${castX},${waterLevel}`} 
               fill="none" 
               stroke={lineColor} 
               strokeWidth="1.5"
             />

             {/* Water Ripple Rings */}
             <g transform={`translate(${castX}, ${waterLevel})`}>
                <ellipse rx="15" ry="4" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" className="animate-[splash_2s_infinite]" />
                <ellipse rx="25" ry="6" fill="none" stroke="white" strokeWidth="1" opacity="0.3" className="animate-[splash_2s_infinite]" style={{ animationDelay: '0.6s' }} />
             </g>

             {/* Bobber */}
             <g transform={`translate(${castX}, ${waterLevel})`}>
                <circle 
                  r="5" 
                  fill={gameState === GameState.BITE ? '#ef4444' : '#f8fafc'} 
                  stroke="#ef4444" 
                  strokeWidth="3"
                  className={`transition-transform duration-200 ${gameState === GameState.BITE ? 'translate-y-2' : 'animate-[float_3s_ease-in-out_infinite]'}`} 
                />
             </g>
           </>
        )}
      </svg>
    </div>
  );
};
