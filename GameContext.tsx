import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { PlayerStats, CatchItem, Quest, GameState, WeatherType, SavedGame, PediaEntry, FishBase, ItemType, FloatingText, CatchVisual, LifetimeStats, TournamentState, Bounty, FishVisual, MarketTrend } from './types';
import { RODS, FISH_DB, BAITS, BOBBERS, DECORATIONS, CHARMS, ACHIEVEMENTS, LOCATIONS } from './constants';

interface GameContextType {
  stats: PlayerStats;
  bag: CatchItem[];
  aquarium: CatchItem[];
  gameState: GameState;
  activeFish: FishBase | null;
  weather: WeatherType;
  quests: Quest[];
  questCooldown: number;
  skills: Record<string, number>;
  unlockedLocs: number[];
  ownedRods: number[];
  ownedBobbers: string[];
  ownedDecor: string[];
  activeDecor: string[];
  achievements: string[];
  pedia: Record<string, PediaEntry>;
  toast: { msg: string; color: string; sub?: string } | null;
  floatingTexts: FloatingText[];
  celebrationFish: CatchItem | null;
  catchVisual: CatchVisual | null;
  isMuted: boolean;
  lifetimeStats: LifetimeStats;
  dailyFortune: string;
  timeOfDay: 'day' | 'sunset' | 'night';
  
  combo: number;
  tournament: TournamentState;
  bounty: Bounty;
  closeTournamentResult: () => void;
  
  filterExpiry: number;
  cleanAquarium: () => void;
  marketTrend: MarketTrend | null;
  rodMastery: Record<number, number>;
  supplyCrate: { active: boolean; x: number; y: number } | null;
  collectCrate: () => void;
  activeDiscount: boolean;
  
  ecologyScore: number;
  buffs: { xpBoostExpiry: number; goldenHook: boolean };
  visitorTip: { active: boolean; amount: number } | null;
  collectVisitorTip: () => void;
  rerollFortune: () => void;
  cookFish: (id: string) => void;

  autoNetLevel: number;
  ownedCharms: string[];
  mapParts: number;
  spinAvailable: number;
  settings: { sortMode: 'recent' | 'value' | 'weight'; bulkSellSafe: boolean };
  newsTicker: string;
  bankDeposit: (amount: number) => void;
  bankWithdraw: (amount: number) => void;
  upgradeAutoNet: () => void;
  spinWheel: () => void;
  toggleSetting: (key: 'sortMode' | 'bulkSellSafe') => void;
  collectOfflineEarnings: () => void;
  offlineEarningsModal: number | null;

  castRod: () => void;
  reelIn: (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => void;
  sellItem: (id: string, fromAqua?: boolean) => void;
  sellAll: () => void;
  recycleJunk: () => void;
  buyItem: (type: 'rod' | 'bait' | 'upgrade' | 'location' | 'bobber' | 'decor' | 'buff' | 'charm', id: number | string) => void;
  equipRod: (id: number) => void;
  equipBobber: (id: string) => void;
  toggleDecor: (id: string) => void;
  repairRod: () => void;
  travel: (id: number) => void;
  claimQuest: (index: number) => void;
  moveToAqua: (id: string) => void;
  upgradeSkill: (id: string) => void;
  resetGame: () => void;
  startNewGame: () => void;
  closeCelebration: () => void;
  playSound: (type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl' | 'splash') => void;
  toggleMute: () => void;
  getRank: () => string;
  generateQuests: (locId: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};

const INITIAL_STATS: PlayerStats = {
  money: 0, xp: 0, level: 1, rodId: 0, rodHp: 10, locId: 0, bagLimit: 5, aquaLimit: 7, baitId: null, bobberId: 'basic', bankBalance: 0
};

const INITIAL_LIFETIME: LifetimeStats = {
  totalCaught: 0,
  totalMoneyEarned: 0,
  heaviestFish: 0,
  legendariesCaught: 0,
  playTimeMinutes: 0,
  shinyCaught: 0,
  goldenCaught: 0,
  offlineEarnings: 0
};

const FORTUNES = [
  "Bugün şansın yaver gidecek!",
  "Sular bugün çok durgun...",
  "Büyük balıklar derinlerde bekliyor.",
  "Rüzgar senden yana esiyor.",
  "Parlak bir şey görebilirsin!",
  "Balıklar bugün çok aç!",
  "İyi bir av seni bekliyor."
];

const NEWS_HEADLINES = [
  "BORSA: Balık fiyatlarında artış bekleniyor!",
  "HAVA DURUMU: Yarın fırtına uyarısı.",
  "ŞEHİR: Yeni bir balık restoranı açıldı, talep artıyor.",
  "EKOLOJİ: Deniz temizliği çalışmaları hız kazandı.",
  "BİLİM: Nadir bir balık türü keşfedildi.",
  "BANKA: Faiz oranları sabit kaldı (%1/dk).",
  "İPUCU: Gece avlanan balıklar daha değerlidir.",
  "DEDİKODU: Efsanevi bir balığın görüldüğü söyleniyor."
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(INITIAL_LIFETIME);
  const [bag, setBag] = useState<CatchItem[]>([]);
  const [aquarium, setAquarium] = useState<CatchItem[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [activeFish, setActiveFish] = useState<FishBase | null>(null);
  const [weather, setWeather] = useState<WeatherType>(WeatherType.SUNNY);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questCooldown, setQuestCooldown] = useState(0);
  const [skills, setSkills] = useState<Record<string, number>>({ luck: 0, haggle: 0, repair: 0, biology: 0 });
  const [unlockedLocs, setUnlockedLocs] = useState<number[]>([0]);
  const [ownedRods, setOwnedRods] = useState<number[]>([0]);
  const [ownedBobbers, setOwnedBobbers] = useState<string[]>(['basic']);
  const [ownedDecor, setOwnedDecor] = useState<string[]>([]);
  const [activeDecor, setActiveDecor] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [pedia, setPedia] = useState<Record<string, PediaEntry>>({});
  const [toast, setToast] = useState<{ msg: string; color: string; sub?: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [dailyFortune, setDailyFortune] = useState(FORTUNES[0]);
  
  const [rodMastery, setRodMastery] = useState<Record<number, number>>({});
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [supplyCrate, setSupplyCrate] = useState<{ active: boolean; x: number; y: number } | null>(null);
  const [activeDiscount, setActiveDiscount] = useState(false);
  const [ecologyScore, setEcologyScore] = useState(0);
  const [buffs, setBuffs] = useState({ xpBoostExpiry: 0, goldenHook: false });
  const [visitorTip, setVisitorTip] = useState<{ active: boolean; amount: number } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');

  const [autoNetLevel, setAutoNetLevel] = useState(0);
  const [ownedCharms, setOwnedCharms] = useState<string[]>([]);
  const [mapParts, setMapParts] = useState(0);
  const [spinAvailable, setSpinAvailable] = useState(0); 
  const [settings, setSettings] = useState({ sortMode: 'recent' as const, bulkSellSafe: false });
  const [newsTicker, setNewsTicker] = useState(NEWS_HEADLINES[0]);
  const [offlineEarningsModal, setOfflineEarningsModal] = useState<number | null>(null);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [celebrationFish, setCelebrationFish] = useState<CatchItem | null>(null);
  const [catchVisual, setCatchVisual] = useState<CatchVisual | null>(null);

  const [combo, setCombo] = useState(0);
  const [tournament, setTournament] = useState<TournamentState>({
    active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null
  });
  const [bounty, setBounty] = useState<Bounty>({
    active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0
  });
  
  const [filterExpiry, setFilterExpiry] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
      const timer = setInterval(() => {
          setNewsTicker(NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)]);
      }, 30000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          setStats(prev => {
              if (prev.bankBalance > 0) {
                  const interest = Math.floor(prev.bankBalance * 0.01);
                  return { ...prev, bankBalance: prev.bankBalance + interest };
              }
              return prev;
          });
          
          if (autoNetLevel > 0) {
              const income = autoNetLevel * 10;
              const boost = ownedCharms.includes('auto_gear') ? 1.2 : 1;
              setStats(prev => ({ ...prev, money: prev.money + Math.floor(income * boost) }));
          }
      }, 60000);
      return () => clearInterval(timer);
  }, [autoNetLevel, ownedCharms]);

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

  useEffect(() => {
      const timer = setInterval(() => {
          if (!visitorTip && aquarium.length > 0 && Math.random() < 0.1) {
              setVisitorTip({ active: true, amount: Math.floor(Math.random() * 50) + 10 });
          }
      }, 30000);
      return () => clearInterval(timer);
  }, [visitorTip, aquarium.length]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const getRank = useCallback(() => {
    const total = lifetimeStats.totalCaught;
    const legend = lifetimeStats.legendariesCaught;
    if (legend >= 50) return "BALIKÇI KRAL 👑";
    if (legend >= 10) return "EFSANEVİ USTA";
    if (total >= 1000) return "Deniz Kurdu";
    if (total >= 500) return "Usta Balıkçı";
    if (total >= 100) return "Tecrübeli";
    if (total >= 50) return "Hevesli";
    return "Acemi";
  }, [lifetimeStats]);

  const generateQuests = useCallback((locId: number) => {
    const mult = locId + 1;
    const newQuests: Quest[] = [
      { id: Date.now(), desc: "3 Balık Tut", target: 3, current: 0, reward: 100 * mult, claimed: false, type: 'count' },
      { id: Date.now()+1, desc: "Gelir Elde Et", target: 200 * mult, current: 0, reward: 150 * mult, claimed: false, type: 'money' },
      { id: Date.now()+2, desc: "1 Nadir+ Balık", target: 1, current: 0, reward: 250 * mult, claimed: false, type: 'rare' }
    ];
    setQuests(newQuests);
    setQuestCooldown(0);
  }, []);

  const closeTournamentResult = useCallback(() => {
    setTournament(prev => ({ ...prev, finished: false }));
  }, []);

  useEffect(() => {
     const allFish = Object.values(FISH_DB).flat().filter(f => f.type === ItemType.FISH);
     if (allFish.length > 0) {
         const trendFish = allFish[Math.floor(Math.random() * allFish.length)];
         setMarketTrend({ fishName: trendFish.name, multiplier: 1.5 });
     }
     setActiveDiscount(Math.random() < 0.2);
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!supplyCrate && gameState === GameState.IDLE && Math.random() < 0.15) {
              setSupplyCrate({
                  active: true,
                  x: 10 + Math.random() * 80,
                  y: 50 + Math.random() * 20
              });
              setTimeout(() => setSupplyCrate(null), 10000);
          }
      }, 45000);
      return () => clearInterval(interval);
  }, [supplyCrate, gameState]);

  const collectCrate = () => {
      if (!supplyCrate) return;
      playSound('success');
      setSupplyCrate(null);
      const rand = Math.random();
      if (rand < 0.4) {
          const reward = 50 + stats.level * 20;
          setStats(s => ({ ...s, money: s.money + reward }));
          spawnText(`+${reward} TL`, "text-yellow-400", supplyCrate.x, supplyCrate.y);
      } else if (rand < 0.7) {
          const bait = BAITS[Math.floor(Math.random() * 3)];
          setStats(s => ({ ...s, baitId: bait.id }));
          showToast(`Kasa: ${bait.name}`, "text-emerald-400");
      } else {
          showToast("Kasa Boş Çıktı :(", "text-slate-400");
      }
  };

  const collectVisitorTip = () => {
      if (!visitorTip || !visitorTip.active) return;
      setStats(prev => ({ ...prev, money: prev.money + visitorTip.amount }));
      setVisitorTip(null);
      spawnText(`+${visitorTip.amount} TL`, "text-yellow-300", 50, 50);
      playSound('cash');
  };

  const rerollFortune = () => {
      if (stats.money >= 1000) {
          setStats(prev => ({ ...prev, money: prev.money - 1000 }));
          setDailyFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
          showToast("Fal Yenilendi", "text-purple-400");
          playSound('success');
      } else {
          showToast("Yetersiz Bakiye (1000 TL)", "text-red-400");
      }
  };

  const cookFish = (id: string) => {
      const fish = bag.find(f => f.id === id);
      if (!fish) return;
      
      const hpRestore = Math.ceil(fish.weight * 2);
      setStats(prev => ({ ...prev, rodHp: Math.min(RODS[prev.rodId].maxHp, prev.rodHp + hpRestore) }));
      setBag(prev => prev.filter(f => f.id !== id));
      spawnText(`+${hpRestore} HP`, "text-green-400", 50, 50);
      playSound('click');
  };

  const bankDeposit = (amount: number) => {
      if (stats.money >= amount) {
          setStats(s => ({ ...s, money: s.money - amount, bankBalance: s.bankBalance + amount }));
          playSound('cash');
      }
  };

  const bankWithdraw = (amount: number) => {
      if (stats.bankBalance >= amount) {
          setStats(s => ({ ...s, money: s.money + amount, bankBalance: s.bankBalance - amount }));
          playSound('cash');
      }
  };

  const upgradeAutoNet = () => {
      const cost = (autoNetLevel + 1) * 2000;
      if (stats.money >= cost) {
          setStats(s => ({ ...s, money: s.money - cost }));
          setAutoNetLevel(l => l + 1);
          playSound('lvl');
          showToast(`Otomatik Ağ Yükseltildi: Seviye ${autoNetLevel + 1}`, "text-blue-400");
      }
  };

  const spinWheel = () => {
      if (Date.now() < spinAvailable) {
          showToast("Çark henüz hazır değil!", "text-red-400");
          return;
      }
      const rewards = [
          { type: 'money', val: 500 },
          { type: 'xp', val: 500 },
          { type: 'bait', val: 'shrimp' },
          { type: 'gold', val: 5000 }, 
      ];
      const res = rewards[Math.random() < 0.05 ? 3 : Math.floor(Math.random() * 3)];
      
      if (res.type === 'money' || res.type === 'gold') setStats(s => ({ ...s, money: s.money + (res.val as number) }));
      if (res.type === 'xp') setStats(s => ({ ...s, xp: s.xp + (res.val as number) }));
      if (res.type === 'bait') setStats(s => ({ ...s, baitId: res.val as string }));

      setSpinAvailable(Date.now() + 24 * 60 * 60 * 1000); 
      playSound('success');
      showToast(res.type === 'gold' ? "BÜYÜK ÖDÜL!" : "Ödül Kazanıldı!", "text-yellow-400");
  };

  const toggleSetting = (key: 'sortMode' | 'bulkSellSafe') => {
      setSettings(prev => {
          if (key === 'sortMode') {
              const modes = ['recent', 'value', 'weight'] as const;
              const nextIndex = (modes.indexOf(prev.sortMode) + 1) % modes.length;
              return { ...prev, sortMode: modes[nextIndex] };
          }
          if (key === 'bulkSellSafe') return { ...prev, bulkSellSafe: !prev.bulkSellSafe };
          return prev;
      });
  };

  const collectOfflineEarnings = () => {
      if (offlineEarningsModal) {
          setStats(s => ({ ...s, money: s.money + offlineEarningsModal }));
          setLifetimeStats(s => ({ ...s, offlineEarnings: s.offlineEarnings + offlineEarningsModal }));
          setOfflineEarningsModal(null);
          playSound('cash');
      }
  };

  const playSound = useCallback((type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl' | 'splash') => {
    if (isMuted) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (ctx.state === 'closed') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      const rate = Math.min(2.0, 1.0 + (combo * 0.05));

      if (type === 'splash') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(200 * rate, now);
         osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.3);
         osc.start(now);
         osc.stop(now + 0.3);
      } else if (type === 'cast') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150 * rate, now); osc.frequency.linearRampToValueAtTime(600 * rate, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(440 * rate, now); osc.frequency.setValueAtTime(554 * rate, now + 0.1); osc.frequency.setValueAtTime(659 * rate, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4);
      } else if (type === 'fail') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'cash') {
        osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(1100, now + 0.05); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'lvl') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(800, now + 0.5); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 1); osc.start(now); osc.stop(now + 1);
      } else if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); osc.start(now); osc.stop(now + 0.05);
      }
    } catch (e) { }
  }, [isMuted, combo]);

  const showToast = useCallback((msg: string, color: string, sub?: string) => {
    setToast({ msg, color, sub });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const spawnText = useCallback((text: string, color: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("balikciHasanSave_v6");
    if (saved) {
      try {
        const data: SavedGame = JSON.parse(saved);
        
        if (data.autoNetLevel && data.autoNetLevel > 0 && data.lastLogin) {
            const now = Date.now();
            const minutesOffline = Math.floor((now - data.lastLogin) / 60000);
            if (minutesOffline > 10) {
                const income = minutesOffline * data.autoNetLevel * 10;
                if (income > 0) setOfflineEarningsModal(income);
            }
        }

        setStats({ ...INITIAL_STATS, ...data.stats });
        
        const hydrateItems = (items: CatchItem[]) => items.map(i => {
             if (!i.visual) {
                const dbItem = Object.values(FISH_DB).flat().find(f => f.name === i.name);
                return { ...i, visual: dbItem?.visual || { shape: 'round', bodyColor: '#888', finColor: '#666', pattern: 'none' } };
             }
             return i;
        });

        setBag(hydrateItems(data.bag));
        setAquarium(hydrateItems(data.aquarium));
        
        setUnlockedLocs(data.unlockedLocs);
        setOwnedRods(data.ownedRods);
        setOwnedBobbers(data.ownedBobbers || ['basic']);
        setOwnedDecor(data.ownedDecor || []);
        setActiveDecor(data.activeDecor || []);
        setAchievements(data.achievements || []);
        setSkills(data.skills);
        setPedia(data.pedia);
        setQuests(data.quests);
        setQuestCooldown(data.questCooldown);
        setFilterExpiry(data.filterExpiry || 0);
        setRodMastery(data.rodMastery || {}); 
        if (data.lifetimeStats) setLifetimeStats(data.lifetimeStats);
        
        setEcologyScore(data.ecologyScore || 0);
        setBuffs(data.buffs || { xpBoostExpiry: 0, goldenHook: false });
        
        if (data.autoNetLevel) setAutoNetLevel(data.autoNetLevel);
        if (data.ownedCharms) setOwnedCharms(data.ownedCharms);
        if (data.mapParts) setMapParts(data.mapParts);
        if (data.spinAvailable) setSpinAvailable(data.spinAvailable);
        if (data.settings) setSettings(data.settings);

      } catch (e) { console.error("Save file corrupted", e); }
    } else {
      generateQuests(INITIAL_STATS.locId);
    }
  }, []);

  useEffect(() => {
    const data: SavedGame = {
      stats, bag, aquarium, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, skills, pedia, quests, questCooldown,
      lastLogin: Date.now(), lifetimeStats, filterExpiry, rodMastery, ecologyScore, buffs,
      autoNetLevel, ownedCharms, mapParts, spinAvailable, settings
    };
    localStorage.setItem("balikciHasanSave_v6", JSON.stringify(data));
  }, [stats, bag, aquarium, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, skills, pedia, quests, questCooldown, lifetimeStats, filterExpiry, rodMastery, ecologyScore, buffs, autoNetLevel, ownedCharms, mapParts, spinAvailable, settings]);

  const cleanAquarium = () => {
    playSound('click');
    const cost = 250;
    if (stats.money >= cost) {
       setStats(prev => ({ ...prev, money: prev.money - cost }));
       setFilterExpiry(Date.now() + 10 * 60000);
       showToast("Filtre Temizlendi!", "text-cyan-400", "Gelir x2 (10dk)");
       spawnText("+10dk BOOST", "text-cyan-300", 50, 50);
       playSound('success');
    } else {
       showToast("Yetersiz Bakiye", "text-red-500");
       playSound('fail');
    }
  };

  const castRod = () => {
    playSound('click');
    triggerHaptic(50);
    if (stats.rodHp <= 0) { showToast("⚠️ Olta Kırık!", "text-red-500"); return; }
    if (bag.length >= stats.bagLimit) { showToast("⚠️ Çanta Dolu!", "text-orange-400"); return; }
    
    const critCast = Math.random() < 0.05; 
    
    setGameState(GameState.CASTING);
    playSound('cast');
    
    if (critCast) spawnText("KRİTİK ATIŞ!", "text-amber-400", 50, 40);

    setTimeout(() => {
      setGameState(GameState.WAITING);
      let waitTime = critCast ? 200 : (2000 + Math.random() * 3000); 
      if (weather === WeatherType.RAIN) {
          waitTime *= 0.7;
          if (!critCast) spawnText("Hızlı Vuruş! (Yağmur)", "text-blue-300", 50, 40);
      }
      
      setTimeout(() => {
        setGameState(GameState.BITE);
        triggerHaptic([50, 50, 50]);
        pickFish();
      }, waitTime);
    }, 500);
  };

  const pickFish = () => {
    const pool = FISH_DB[stats.locId];
    const rod = RODS[stats.rodId];
    const baitBonus = stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.bonus || 1 : 1;
    
    const masteryCount = rodMastery[stats.rodId] || 0;
    const masteryBonus = 1 + Math.min(0.5, (masteryCount / 50) * 0.01);

    const useGoldenHook = buffs.goldenHook;
    if (useGoldenHook) {
        setBuffs(prev => ({ ...prev, goldenHook: false }));
        spawnText("ALTIN İĞNE KULLANILDI", "text-yellow-300", 50, 60);
    }

    let totalW = 0;
    const wPool = pool.map(f => {
      let w = 100 / Math.pow(2, f.rarity);
      
      if (f.type !== ItemType.JUNK) {
        w *= (rod.power * masteryBonus * baitBonus * (1 + skills['luck'] * 0.1));
        if (ownedCharms.includes('clover')) w *= 1.1;

        if (weather === WeatherType.STORM && f.rarity >= 4) w *= 1.5;
        if (weather === WeatherType.RAIN) w *= 1.2;
        
        if (timeOfDay === 'night' && f.rarity >= 3) w *= 1.25;

        if (useGoldenHook) {
            if (f.rarity < 3) w = 0; 
            else w *= 5;
        }
      } else {
        w /= (rod.power * 1.5); 
      }
      
      totalW += w;
      return { ...f, weightVal: w };
    });
    
    if (totalW === 0 && useGoldenHook) totalW = 1;

    let r = Math.random() * totalW;
    let selected = wPool[0];
    for (const f of wPool) {
      if (f.weightVal > 0) { 
          if (r < f.weightVal) { selected = f; break; }
          r -= f.weightVal;
      }
    }
    
    setActiveFish(selected);
    
    if (selected.type === ItemType.JUNK) {
      setTimeout(() => reelIn(true, false, false, selected), 500);
    } else {
      setGameState(GameState.MINIGAME);
    }
  };

  const reelIn = (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => {
    const currentFish = fishOverride || activeFish;

    if (stats.baitId && Math.random() < (ownedCharms.includes('bait_box') ? 0.2 : 0.05)) { 
        spawnText("YEM KURTARILDI!", "text-cyan-400", 50, 80);
    } else if (stats.baitId && Math.random() > 0.5) {
        setStats(prev => ({ ...prev, baitId: null }));
    }

    if (snapped) {
      setGameState(GameState.BROKEN);
      setStats(prev => ({ ...prev, rodHp: Math.max(0, prev.rodHp - 3) }));
      showToast("MİSİNA KOPTU!", "text-red-500");
      setCombo(0);
      playSound('fail');
      triggerHaptic(200);
    } else if (success && currentFish) {
      setGameState(GameState.CAUGHT);
      playSound('success');
      triggerHaptic([100, 50, 100]);
      
      if (currentFish.type !== ItemType.JUNK) {
         setCombo(prev => {
            const next = prev + 1;
            if (next > 1) spawnText(`COMBO x${next}`, "text-purple-400", 50, 25);
            return next;
         });
         
         setRodMastery(prev => ({ ...prev, [stats.rodId]: (prev[stats.rodId] || 0) + 1 }));
         
      } else {
         if (Math.random() < 0.1 && mapParts < 4) {
             setMapParts(p => p + 1);
             showToast("HARİTA PARÇASI BULUNDU!", "text-amber-400", `${mapParts + 1}/4`);
             if (mapParts + 1 === 4) {
                 setTimeout(() => {
                     setStats(s => ({ ...s, money: s.money + 10000 }));
                     showToast("HAZİNE HARİTASI TAMAMLANDI!", "text-yellow-400", "+10.000 TL");
                     playSound('cash');
                 }, 2000);
             }
         }
         
         setCombo(0);
         showToast("ÇÖP! Combo Sıfırlandı", "text-slate-400");
      }
      
      const baseW = (Math.random() * 5 + 1) * (1 + skills['biology'] * 0.2) * (1 + stats.locId * 0.2);
      const finalWeight = Number(baseW.toFixed(2));
      
      const isShiny = Math.random() < 0.005; 
      const isGolden = Math.random() < 0.01;

      let finalValue = currentFish.value;
      if (isGolden) finalValue *= 10;
      else if (isShiny) finalValue *= 5;
      
      if (perfect) finalValue = Math.floor(finalValue * 1.2);
      if (ecologyScore >= 100) finalValue = Math.floor(finalValue * 1.2);

      const count = pedia[currentFish.name]?.count || 0;
      const masteryLevel = count > 100 ? 3 : count > 50 ? 2 : count > 10 ? 1 : 0;
      finalValue = Math.floor(finalValue * (1 + masteryLevel * 0.1));

      const names = ["Bob", "Nemo", "Dory", "Jaws", "Bubbles", "Fin", "Splash", "Sushi", "Captain", "Glub"];
      const petName = names[Math.floor(Math.random() * names.length)];

      const visualData: FishVisual = currentFish.visual || { shape: 'round', bodyColor: '#888', finColor: '#666', pattern: 'none' };

      const caughtItem: CatchItem = { 
        ...currentFish, 
        weight: finalWeight, 
        id: Date.now().toString(),
        shiny: isShiny,
        golden: isGolden,
        value: finalValue,
        visual: visualData,
        perfect,
        masteryLevel,
        petName
      };
      
      setCatchVisual({ emoji: caughtItem.emoji, visual: visualData, rarity: caughtItem.rarity, id: Date.now(), shiny: isShiny, golden: isGolden });

      if (Math.random() < 0.05 && currentFish.type === ItemType.FISH) {
          setTimeout(() => {
              const bonus = Math.random() < 0.5 ? 50 : 100;
              setStats(s => ({ ...s, money: s.money + bonus }));
              showToast("Midesinden Yüzük Çıktı!", "text-yellow-300", `+${bonus} TL`);
          }, 2000);
      }

      if (Math.random() < 0.05) {
          const luckyBait = BAITS[Math.floor(Math.random() * 2)];
          setStats(s => ({ ...s, baitId: luckyBait.id }));
          setTimeout(() => spawnText(`ŞANSLI! +${luckyBait.name}`, "text-pink-300", 50, 70), 1000);
      }

      setTimeout(() => {
        setBag(prev => [...prev, caughtItem]);
        
        let xpGain = Math.floor(currentFish.rarity * 12 * (1 + stats.locId * 0.1));
        if (perfect) {
            xpGain = Math.floor(xpGain * 1.2);
            spawnText("KUSURSUZ! +%20", "text-emerald-400", 50, 60);
        }
        if (ownedCharms.includes('expert_book')) xpGain = Math.floor(xpGain * 1.1);
        
        if (Date.now() < buffs.xpBoostExpiry) {
            xpGain *= 2;
            spawnText("XP BOOST (x2)", "text-purple-300", 50, 20);
        }

        const prevRecord = pedia[currentFish.name]?.maxWeight || 0;
        if (finalWeight > prevRecord && prevRecord > 0) {
            spawnText("🏆 YENİ REKOR!", "text-amber-300", 50, 10);
            playSound('success');
        }

        setStats(prev => {
          let newXp = prev.xp + xpGain;
          let newLvl = prev.level;
          let lvlUp = false;
          if (newXp >= prev.level * 300) {
             newXp -= prev.level * 300;
             newLvl++;
             lvlUp = true;
          }
          if (lvlUp) {
            const cashReward = newLvl * 100;
            setTimeout(() => { 
                playSound('lvl'); 
                showToast("SEVİYE ATLADIN!", "text-yellow-400", `+${cashReward} TL`); 
                setStats(s => ({ ...s, money: s.money + cashReward }));
            }, 500);
          }
          return {
            ...prev,
            xp: newXp,
            level: newLvl,
            rodHp: Math.max(0, prev.rodHp - (1 - skills['repair'] * 0.1)),
            aquaLimit: 5 + newLvl * 2
          };
        });

        setLifetimeStats(prev => ({
          ...prev,
          totalCaught: prev.totalCaught + 1,
          heaviestFish: Math.max(prev.heaviestFish, finalWeight),
          legendariesCaught: prev.legendariesCaught + (currentFish.rarity >= 5 ? 1 : 0),
          shinyCaught: prev.shinyCaught + (isShiny ? 1 : 0),
          goldenCaught: prev.goldenCaught + (isGolden ? 1 : 0)
        }));

        setPedia(prev => ({
          ...prev,
          [currentFish.name]: {
            count: (prev[currentFish.name]?.count || 0) + 1,
            maxWeight: Math.max(prev[currentFish.name]?.maxWeight || 0, finalWeight),
            shinyCaught: (prev[currentFish.name]?.shinyCaught || false) || isShiny,
            goldenCaught: (prev[currentFish.name]?.goldenCaught || false) || isGolden
          }
        }));

        setQuests(prev => prev.map(q => {
          if (q.claimed) return q;
          if (q.type === 'count' && q.desc.includes(currentFish.name)) {
             return { ...q, current: Math.min(q.target, q.current + 1) };
          }
          if (q.type === 'rare' && q.desc.includes(currentFish.name)) {
             return { ...q, current: Math.min(q.target, q.current + 1) };
          }
          return q;
        }));

        spawnText(`+${xpGain} XP`, "text-blue-400", 70, 40);

        if (tournament.active && currentFish.type !== ItemType.JUNK) {
           const points = Math.floor(currentFish.rarity * 10 * finalWeight);
           setTournament(t => ({ ...t, playerScore: t.playerScore + points }));
           spawnText(`+${points} Puan!`, "text-orange-500", 50, 60);
        }

        if (bounty.active && stats.locId === bounty.locId && currentFish.name === bounty.fishName && finalWeight >= bounty.minWeight) {
           setStats(s => ({ ...s, money: s.money + bounty.reward }));
           setBounty(b => ({ ...b, active: false }));
           showToast("ARANAN YAKALANDI!", "text-green-400", `+${bounty.reward} TL`);
           playSound('cash');
        }

        if (currentFish.type === ItemType.FISH && currentFish.rarity >= 5) {
          setCelebrationFish(caughtItem);
        } else {
          showToast(`+ ${currentFish.name}`, currentFish.type === ItemType.TREASURE ? 'text-yellow-400' : 'text-white');
        }
        
        if (stats.baitId && Math.random() > 0.5) setStats(prev => ({ ...prev, baitId: null }));
        
        setCatchVisual(null);
      }, 1000);
    } else {
      setGameState(GameState.IDLE);
      setStats(prev => ({ ...prev, rodHp: Math.max(0, prev.rodHp - 1) }));
      showToast("KAÇTI!", "text-slate-400");
      setCombo(0);
      playSound('fail');
    }

    setTimeout(() => {
       if (!celebrationFish) setGameState(GameState.IDLE);
       if (quests.every(q => q.claimed)) {
          setQuestCooldown(prev => prev + 1);
          if (questCooldown >= 10) generateQuests(stats.locId);
       }
    }, 1500);
  };
  
  const closeCelebration = useCallback(() => {
    setCelebrationFish(null);
    setGameState(GameState.IDLE);
  }, []);

  const sellItem = (id: string, fromAqua = false) => {
    playSound('click');
    const list = fromAqua ? aquarium : bag;
    const item = list.find(i => i.id === id);
    if (!item) return;

    const comboMultiplier = 1 + (combo * 0.1);
    const trendBonus = marketTrend && marketTrend.fishName === item.name ? marketTrend.multiplier : 1;
    const ecoBonus = ecologyScore >= 100 ? 1.2 : 1;

    // Feature 10: Critical Sell
    const critSell = Math.random() < 0.05; // 5% chance
    const critBonus = critSell ? 3 : 1;

    const basePrice = Math.floor(item.value * (1 + skills['haggle'] * 0.1));
    const finalPrice = Math.floor(basePrice * comboMultiplier * trendBonus * critBonus * ecoBonus);

    setStats(prev => ({ ...prev, money: prev.money + finalPrice }));
    setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + finalPrice }));
    
    if (fromAqua) setAquarium(prev => prev.filter(i => i.id !== id));
    else setBag(prev => prev.filter(i => i.id !== id));

    setQuests(prev => prev.map(q => {
      if (!q.claimed && q.type === 'money') return { ...q, current: Math.min(q.target, q.current + finalPrice) };
      return q;
    }));

    if (critSell) spawnText("KOLEKSİYONCU! x3", "text-pink-400", 50, 40);
    if (trendBonus > 1) spawnText("TREND! x1.5", "text-orange-400", 50, 60);
    if (ecoBonus > 1) spawnText("DOĞA DOSTU! x1.2", "text-green-400", 50, 30);
    spawnText(`+${finalPrice} TL`, "text-yellow-400", 50, 50);
    playSound('cash');
  };

  const sellAll = () => {
    playSound('click');
    if (bag.length === 0) return;
    let total = 0;
    const comboMultiplier = 1 + (combo * 0.1);
    const ecoBonus = ecologyScore >= 100 ? 1.2 : 1;
    
    // Feature 12: Bulk Sell Filter (if safe mode is on, keep rares)
    const itemsToSell = settings.bulkSellSafe ? bag.filter(i => i.rarity < 3 && i.type !== ItemType.TREASURE) : bag;
    
    if (itemsToSell.length === 0) {
        showToast("Satılacak eşya yok (Güvenli Mod)", "text-orange-400");
        return;
    }

    itemsToSell.forEach(i => {
       if (i.type !== ItemType.JUNK) {
           const trendBonus = marketTrend && marketTrend.fishName === i.name ? marketTrend.multiplier : 1;
           total += Math.floor(i.value * (1 + skills['haggle'] * 0.1) * comboMultiplier * trendBonus * ecoBonus);
       } else {
           total += 1;
       }
    });

    setStats(prev => ({ ...prev, money: prev.money + total }));
    setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + total }));
    
    // Remove sold items
    const soldIds = itemsToSell.map(i => i.id);
    setBag(prev => prev.filter(i => !soldIds.includes(i.id)));
    
    setQuests(prev => prev.map(q => {
      if (!q.claimed && q.type === 'money') return { ...q, current: Math.min(q.target, q.current + total) };
      return q;
    }));
    
    showToast(`Satıldı: +${total} TL`, "text-yellow-400");
    playSound('cash');
  };

  const buyItem = (type: 'rod' | 'bait' | 'upgrade' | 'location' | 'bobber' | 'decor' | 'buff' | 'charm', id: number | string) => {
    playSound('click');
    let baseCost = 0;
    if (type === 'rod') baseCost = RODS.find(r => r.id === id)?.price || 0;
    if (type === 'bait') baseCost = BAITS.find(b => b.id === id)?.price || 0;
    if (type === 'location') baseCost = LOCATIONS.find(l => l.id === id)?.price || 0;
    if (type === 'bobber') baseCost = BOBBERS.find(b => b.id === id)?.price || 0;
    if (type === 'decor') baseCost = DECORATIONS.find(d => d.id === id)?.price || 0;
    if (type === 'upgrade' && id === 'bag') baseCost = 500;
    if (type === 'charm') baseCost = CHARMS.find(c => c.id === id)?.price || 0;
    
    if (type === 'buff' && id === 'energy') baseCost = 250;
    if (type === 'buff' && id === 'golden') baseCost = 1000;

    const cost = activeDiscount && (type === 'rod' || type === 'bait') ? Math.floor(baseCost * 0.8) : baseCost;

    if (stats.money >= cost) {
      setStats(prev => ({ ...prev, money: prev.money - cost }));
      playSound('cash');
      
      if (type === 'rod') {
        setOwnedRods(prev => [...prev, Number(id)]);
        setStats(prev => ({ ...prev, rodId: Number(id), rodHp: RODS.find(r => r.id === id)!.maxHp }));
        showToast("Yeni Olta Alındı!", "text-white");
      }
      if (type === 'bait') { setStats(prev => ({ ...prev, baitId: String(id) })); showToast("Yem Takıldı", "text-emerald-400"); }
      if (type === 'location') { setUnlockedLocs(prev => [...prev, Number(id)]); travel(Number(id)); }
      if (type === 'upgrade') { setStats(prev => ({ ...prev, bagLimit: prev.bagLimit + 5 })); showToast("Çanta Genişletildi", "text-blue-400"); }
      if (type === 'bobber') { setOwnedBobbers(prev => [...prev, String(id)]); setStats(prev => ({ ...prev, bobberId: String(id) })); showToast("Şamandıra Alındı!", "text-white"); }
      if (type === 'decor') { setOwnedDecor(prev => [...prev, String(id)]); setActiveDecor(prev => [...prev, String(id)]); showToast("Dekor Eklendi!", "text-white"); }
      if (type === 'buff' && id === 'energy') { setBuffs(prev => ({...prev, xpBoostExpiry: Date.now() + 5*60000})); showToast("Enerji İçeceği İçildi!", "text-purple-400", "5dk 2x XP"); }
      if (type === 'buff' && id === 'golden') { setBuffs(prev => ({...prev, goldenHook: true})); showToast("Altın İğne Takıldı!", "text-yellow-300", "Sıradaki Balık: Nadir+"); }
      if (type === 'charm') { setOwnedCharms(prev => [...prev, String(id)]); showToast("Tılsım Alındı!", "text-purple-300"); }

    } else {
      showToast("Yetersiz Bakiye", "text-red-500");
      playSound('fail');
    }
  };

  const equipRod = (id: number) => { playSound('click'); setStats(prev => ({ ...prev, rodId: id, rodHp: RODS[id].maxHp })); showToast("Olta Kuşanıldı", "text-white"); };
  const equipBobber = (id: string) => { playSound('click'); setStats(prev => ({ ...prev, bobberId: id })); showToast("Şamandıra Seçildi", "text-white"); };
  const toggleDecor = (id: string) => { playSound('click'); if (activeDecor.includes(id)) { setActiveDecor(prev => prev.filter(d => d !== id)); } else { setActiveDecor(prev => [...prev, id]); } };
  const repairRod = () => { playSound('click'); if (stats.money >= 50) { setStats(prev => ({ ...prev, money: prev.money - 50, rodHp: RODS[prev.rodId].maxHp })); showToast("Tamir Edildi", "text-blue-400"); playSound('success'); } };
  const travel = (id: number) => { 
      playSound('click'); 
      setStats(prev => ({ ...prev, locId: id })); 
      generateQuests(id); 
      showToast(`Konum: ${LOCATIONS[id].name}`, "text-white");
      
      if (Math.random() < 0.3) {
          setTimeout(() => {
              const reward = Math.floor(Math.random() * 50) + 20;
              setStats(prev => ({ ...prev, money: prev.money + reward }));
              spawnText(`Yolda Para Buldun: +${reward} TL`, "text-yellow-300", 50, 50);
          }, 1000);
      }
  };
  const claimQuest = (index: number) => { playSound('click'); const q = quests[index]; if (q.claimed) return; setStats(prev => ({ ...prev, money: prev.money + q.reward })); setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + q.reward })); setQuests(prev => { const copy = [...prev]; copy[index].claimed = true; return copy; }); spawnText(`+${q.reward} TL`, "text-yellow-400"); playSound('cash'); };
  const moveToAqua = (id: string) => { playSound('click'); if (aquarium.length >= stats.aquaLimit) { showToast("Akvaryum Dolu!", "text-red-500"); return; } const item = bag.find(i => i.id === id); if (item) { setBag(prev => prev.filter(i => i.id !== id)); setAquarium(prev => [...prev, item]); showToast("Akvaryuma Eklendi", "text-cyan-400"); } };
  const upgradeSkill = (id: string) => { playSound('click'); const lvl = skills[id] || 0; const cost = (lvl + 1) * 500; if (stats.money >= cost) { setStats(prev => ({ ...prev, money: prev.money - cost })); setSkills(prev => ({ ...prev, [id]: lvl + 1 })); showToast("Yetenek Geliştirildi", "text-purple-400"); playSound('lvl'); } };
  const resetGame = () => { localStorage.removeItem("balikciHasanSave_v6"); window.location.reload(); };
  const startNewGame = () => { playSound('click'); setStats(INITIAL_STATS); setLifetimeStats(INITIAL_LIFETIME); setBag([]); setAquarium([]); setGameState(GameState.IDLE); setActiveFish(null); setWeather(WeatherType.SUNNY); setSkills({ luck: 0, haggle: 0, repair: 0, biology: 0 }); setUnlockedLocs([0]); setOwnedRods([0]); setOwnedBobbers(['basic']); setOwnedDecor([]); setActiveDecor([]); setAchievements([]); setPedia({}); setTournament({ active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null }); setBounty({ active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0 }); setCombo(0); setFilterExpiry(0); setRodMastery({}); setEcologyScore(0); setBuffs({ xpBoostExpiry: 0, goldenHook: false }); setOwnedCharms([]); setAutoNetLevel(0); setMapParts(0); generateQuests(0); localStorage.removeItem("balikciHasanSave_v6"); showToast("Yeni Oyun Başlatıldı", "text-white"); };
  const recycleJunk = () => { 
      playSound('click'); 
      const junks = bag.filter(i => i.type === ItemType.JUNK); 
      if (junks.length < 5) { showToast("Yetersiz Çöp (Min 5)", "text-red-400"); return; } 
      let removed = 0; 
      setBag(prev => prev.filter(item => { if (item.type === ItemType.JUNK && removed < 5) { removed++; return false; } return true; })); 
      const bait = BAITS[Math.floor(Math.random() * 3)]; 
      setStats(prev => ({ ...prev, baitId: bait.id })); 
      
      setEcologyScore(prev => Math.min(100, prev + 10));
      
      showToast(`Doğa Temizlendi! +10 Puan`, "text-green-400"); 
      playSound('success'); 
  };

  return (
    <GameContext.Provider value={{
      stats, bag, aquarium, gameState, activeFish, weather, quests, questCooldown, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, toast, floatingTexts, celebrationFish, catchVisual, isMuted, lifetimeStats, dailyFortune,
      combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium, marketTrend, supplyCrate, collectCrate, rodMastery, activeDiscount,
      timeOfDay, ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
      autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
      castRod, reelIn, sellItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, claimQuest, moveToAqua, upgradeSkill, resetGame, startNewGame, closeCelebration, playSound, toggleMute, getRank, generateQuests
    }}>
      {children}
    </GameContext.Provider>
  );
};