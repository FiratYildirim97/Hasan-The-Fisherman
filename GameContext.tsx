
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  PlayerStats, CatchItem, Quest, GameState, WeatherType, SavedGame, PediaEntry, 
  FishBase, ItemType, FloatingText, CatchVisual, LifetimeStats, TournamentState, 
  Bounty, FishVisual, MarketTrend, OwnedPet, CraftingRecipe, MysteryMerchant, RadioStation, RestaurantState, Customer, GameEvent
} from './types';
import { RODS, FISH_DB, BAITS, BOBBERS, DECORATIONS, CHARMS, ACHIEVEMENTS, LOCATIONS, PETS, PRESTIGE_UPGRADES, CRAFTING_RECIPES } from './constants';

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
  marketMultipliers: Record<string, number>; 
  rodMastery: Record<number, number>;
  supplyCrate: { active: boolean; x: number; y: number } | null;
  collectCrate: () => void;
  activeDiscount: boolean;
  mysteryMerchant: MysteryMerchant | null;
  
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
  upgradeWormFarm: () => void;
  spinWheel: () => void;
  toggleSetting: (key: 'sortMode' | 'bulkSellSafe') => void;
  collectOfflineEarnings: () => void;
  offlineEarningsModal: number | null;

  ownedPets: OwnedPet[];
  buyPet: (id: string) => void;
  feedPet: (id: string) => void;

  prestigeUpgrades: Record<string, number>;
  doPrestige: () => void;
  buyPrestigeUpgrade: (id: string) => void;
  calculatePrestigePearls: () => number;
  
  donateFish: (id: string) => void;
  craftItem: (recipeId: string) => void;
  buyMerchantItem: (idx: number) => void;

  castRod: () => void;
  reelIn: (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => void;
  sellItem: (id: string, fromAqua?: boolean) => void;
  useItem: (id: string) => void;
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
  startDiving: () => void;
  endDiving: (score: number) => void;

  radioStation: RadioStation;
  cycleRadio: () => void;
  hookFish: () => void;
  playSlotMachine: (bet: number) => { result: string[]; reward: number; winType: 'none' | 'small' | 'big' | 'jackpot' };
  
  dailyRewardPopup: { active: boolean; streak: number; reward: number } | null;
  claimDailyReward: () => void;

  restaurant: RestaurantState;
  activeCustomers: Customer[];
  buyIngredient: (type: 'vegetables' | 'meze' | 'raki' | 'oil', amount: number, cost: number) => void;
  serveCustomer: (customerId: number, fishId: string) => void;
  rejectCustomer: (customerId: number) => void;
  isRestaurantOpen: boolean;
  setIsRestaurantOpen: (open: boolean) => void;
  unlockRestaurant: () => void;

  activeEvent: GameEvent | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};

const INITIAL_STATS: PlayerStats = {
  money: 0, xp: 0, level: 1, rodId: 0, rodHp: 10, locId: 0, bagLimit: 5, aquaLimit: 7, baitId: null, bobberId: 'basic', bankBalance: 0,
  pearls: 0, prestigeLevel: 0, wormFarmLevel: 0, dailyStreak: 0, lastRewardTime: 0
};

const INITIAL_RESTAURANT: RestaurantState = {
  isUnlocked: false,
  level: 1,
  ingredients: { vegetables: 0, meze: 0, raki: 0, oil: 0 },
  reputation: 0
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
  "DEDİKODU: Gizemli Tüccar bu aralar sık görülüyor."
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
  const [marketMultipliers, setMarketMultipliers] = useState<Record<string, number>>({}); 
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
  const [settings, setSettings] = useState<{ sortMode: 'recent' | 'value' | 'weight'; bulkSellSafe: boolean }>({ sortMode: 'recent', bulkSellSafe: false });
  const [newsTicker, setNewsTicker] = useState(NEWS_HEADLINES[0]);
  const [offlineEarningsModal, setOfflineEarningsModal] = useState<number | null>(null);
  
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([]);
  
  const [prestigeUpgrades, setPrestigeUpgrades] = useState<Record<string, number>>({});
  const [mysteryMerchant, setMysteryMerchant] = useState<MysteryMerchant | null>(null);

  // Restaurant State
  const [restaurant, setRestaurant] = useState<RestaurantState>(INITIAL_RESTAURANT);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);

  // Global Event State
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

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
  const [radioStation, setRadioStation] = useState<RadioStation>('off');
  
  const [dailyRewardPopup, setDailyRewardPopup] = useState<{ active: boolean; streak: number; reward: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const radioNodesRef = useRef<any[]>([]);
  const biteTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, color: string, sub?: string) => {
    setToast({ msg, color, sub });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const spawnText = useCallback((text: string, color: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev: FloatingText[]) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev: FloatingText[]) => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

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

  // EVENT SYSTEM LOGIC
  useEffect(() => {
      // Event Trigger Loop (Check every minute)
      const eventLoop = setInterval(() => {
          if (!activeEvent && Math.random() < 0.15) { // 15% chance every minute
              const eventTypes: GameEvent[] = [
                  { id: 'frenzy', name: '🌊 Balık Sürüsü', description: 'Balıklar çok hızlı vuruyor!', duration: 60000, startTime: Date.now(), color: 'text-blue-400' },
                  { id: 'gold_rush', name: '💰 Altın Akını', description: 'Satış fiyatları x2!', duration: 60000, startTime: Date.now(), color: 'text-yellow-400' },
                  { id: 'giant_fish', name: '🐋 Devlerin Göçü', description: 'Balıklar %50 daha ağır!', duration: 90000, startTime: Date.now(), color: 'text-purple-400' },
                  { id: 'calm_waters', name: '✨ Sakin Sular', description: 'Balık tutmak çok kolaylaştı!', duration: 60000, startTime: Date.now(), color: 'text-cyan-400' }
              ];
              const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
              setActiveEvent(randomEvent);
              playSound('lvl');
              showToast(`OLAY BAŞLADI: ${randomEvent.name}`, "text-white", randomEvent.description);
          }
      }, 60000);

      // Event Expiry Loop (Check every second)
      const expiryLoop = setInterval(() => {
          if (activeEvent) {
              if (Date.now() > activeEvent.startTime + activeEvent.duration) {
                  setActiveEvent(null);
                  showToast("Etkinlik Sona Erdi", "text-slate-400");
              }
          }
      }, 1000);

      return () => {
          clearInterval(eventLoop);
          clearInterval(expiryLoop);
      };
  }, [activeEvent, playSound, showToast]);

  const buyIngredient = (type: 'vegetables' | 'meze' | 'raki' | 'oil', amount: number, cost: number) => {
      if (stats.money >= cost) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost }));
          setRestaurant((prev: RestaurantState) => ({
              ...prev,
              ingredients: {
                  ...prev.ingredients,
                  [type]: prev.ingredients[type] + amount
              }
          }));
          playSound('cash');
          showToast(`Satın alındı!`, "text-green-400");
      } else {
          showToast("Yetersiz Bakiye", "text-red-400");
          playSound('fail');
      }
  };

  const unlockRestaurant = () => {
      const COST = 30000;
      if (stats.level < 5) {
          showToast("Seviye 5 Gerekli!", "text-red-400");
          return;
      }
      if (stats.money >= COST) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - COST }));
          setRestaurant((prev: RestaurantState) => ({ ...prev, isUnlocked: true }));
          playSound('success');
          showToast("Restoran Satın Alındı!", "text-cyan-400", "İşletmeye Başla!");
      } else {
          showToast(`Yetersiz Bakiye (${COST.toLocaleString()} TL)`, "text-red-400");
          playSound('fail');
      }
  };

  useEffect(() => {
      // Customer Spawner (Only if unlocked)
      if (!isRestaurantOpen || !restaurant.isUnlocked) return;
      
      const spawnCustomer = () => {
          if (activeCustomers.length >= 4) return;
          
          const names = ["Hüseyin Abi", "Müjgan Abla", "Balıkçı Nuri", "Turist John", "Gurme Vedat", "Mahalleli Ayşe", "Dayı", "Kaptan Jack"];
          const orders = ['grilled', 'sandwich', 'raki_table'] as const;
          
          const isVip = Math.random() < (0.05 + (restaurant.reputation / 1000));
          const diff = Math.min(5, 1 + Math.floor(restaurant.reputation / 100));
          const orderType = Math.random() < 0.2 ? 'raki_table' : Math.random() < 0.6 ? 'grilled' : 'sandwich';
          
          const customer: Customer = {
              id: Date.now() + Math.random(),
              name: isVip ? `⭐ GURME ${names[Math.floor(Math.random() * names.length)]}` : names[Math.floor(Math.random() * names.length)],
              order: orderType,
              fishReq: {
                  rarity: orderType === 'raki_table' ? 3 : orderType === 'grilled' ? 2 : 1,
                  minWeight: 1 + Math.random() * diff
              },
              patience: 100,
              maxPatience: 100,
              reward: 0,
              isVip: isVip
          };
          
          setActiveCustomers((prev: Customer[]) => [...prev, customer]);
          if (isVip) {
              playSound('success');
              showToast("GURME GELDİ!", "text-yellow-300", "Özel Servis Yap!");
          } else {
              playSound('click'); 
          }
      };

      const spawnRate = Math.max(1000, 3000 - (restaurant.reputation * 5));
      
      const interval = setInterval(() => {
          if (Math.random() < 0.4) spawnCustomer();
          setActiveCustomers((prev: Customer[]) => prev.map((c: Customer) => ({
              ...c, 
              patience: c.patience - (c.isVip ? 4 : 2)
          })).filter((c: Customer) => {
              if (c.patience <= 0) {
                  setRestaurant((r: RestaurantState) => ({...r, reputation: Math.max(0, r.reputation - 10)})); // Bigger penalty
                  showToast("Müşteri Sinirlendi!", "text-red-400");
                  return false; 
              }
              return true;
          }));

      }, spawnRate);

      return () => clearInterval(interval);
  }, [isRestaurantOpen, restaurant.isUnlocked, activeCustomers.length, restaurant.reputation, playSound, showToast]);

  const serveCustomer = (customerId: number, fishId: string) => {
      const customer = activeCustomers.find(c => c.id === customerId);
      const fish = bag.find(f => f.id === fishId);
      if (!customer || !fish) return;

      const ings = restaurant.ingredients;
      let costVeg = 0, costOil = 0, costRaki = 0, costMeze = 0;
      let multiplier = 1;

      if (customer.order === 'sandwich') { costVeg = 1; multiplier = 2.5; }
      if (customer.order === 'grilled') { costOil = 1; costVeg = 1; multiplier = 3.5; }
      if (customer.order === 'raki_table') { costRaki = 1; costMeze = 2; costVeg = 2; costOil = 1; multiplier = 8.0; }

      if (ings.vegetables < costVeg || ings.oil < costOil || ings.raki < costRaki || ings.meze < costMeze) {
          showToast("Malzemeler Eksik!", "text-red-400");
          return;
      }

      if (fish.rarity < customer.fishReq.rarity || fish.weight < customer.fishReq.minWeight) {
          showToast("Müşteri bu balığı beğenmedi!", "text-orange-400");
          return;
      }

      setBag((prev: CatchItem[]) => prev.filter(f => f.id !== fishId));
      
      let reputationGain = customer.isVip ? 10 : 2;
      let newReputation = restaurant.reputation + reputationGain;
      let newLevel = restaurant.level;
      if (newReputation >= newLevel * 100) {
          newLevel++;
          playSound('lvl');
          showToast("Restoran Seviye Atladı!", "text-yellow-400");
      }
      
      setRestaurant((prev: RestaurantState) => ({
          ...prev,
          ingredients: {
              vegetables: prev.ingredients.vegetables - costVeg,
              oil: prev.ingredients.oil - costOil,
              raki: prev.ingredients.raki - costRaki,
              meze: prev.ingredients.meze - costMeze,
          },
          reputation: newReputation,
          level: 1 + Math.floor(newReputation / 100)
      }));
      setActiveCustomers((prev: Customer[]) => prev.filter(c => c.id !== customerId));

      let reward = Math.floor(fish.value * multiplier);
      if (customer.isVip) reward *= 3; 

      let tip = 0;
      if (customer.patience > 80) tip += Math.floor(reward * 0.3);
      else if (customer.patience > 50) tip += Math.floor(reward * 0.15);
      if (restaurant.reputation > 50) tip += Math.floor(restaurant.reputation * 0.5);
      
      const totalReward = reward + tip;

      setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + totalReward, xp: prev.xp + (customer.isVip ? 200 : 50) }));
      playSound('cash');
      showToast("Sipariş Tamamlandı!", "text-green-400", `+${reward} TL ${tip > 0 ? `(+${tip} Bahşiş)` : ''}`);
      spawnText(`+${totalReward} TL`, "text-yellow-400", 50, 50);
  };

  const rejectCustomer = (customerId: number) => {
      setActiveCustomers((prev: Customer[]) => prev.filter(c => c.id !== customerId));
      setRestaurant((prev: RestaurantState) => ({ ...prev, reputation: Math.max(0, prev.reputation - 2) }));
  };

  // ... (Existing Radio Logic etc)
  useEffect(() => {
    radioNodesRef.current.forEach(node => {
        try { node.stop(); } catch {}
        try { node.disconnect(); } catch {}
    });
    radioNodesRef.current = [];

    if (radioStation === 'off' || isMuted) return;

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
        const ctx = audioCtxRef.current;
        if (ctx?.state === 'suspended') ctx.resume();

        const masterGain = ctx?.createGain();
        if (masterGain && ctx) {
            masterGain.gain.value = 0.05; 
            masterGain.connect(ctx.destination);

            if (radioStation === 'nature') {
                 const bufferSize = ctx.sampleRate * 2;
                 const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                 const data = buffer.getChannelData(0);
                 let lastOut = 0;
                 for (let i = 0; i < bufferSize; i++) {
                     const white = Math.random() * 2 - 1;
                     data[i] = (lastOut + (0.02 * white)) / 1.02;
                     lastOut = data[i];
                     data[i] *= 3.5; 
                 }
                 const noise = ctx.createBufferSource();
                 noise.buffer = buffer;
                 noise.loop = true;
                 const filter = ctx.createBiquadFilter();
                 filter.type = 'lowpass';
                 filter.frequency.value = 400;
                 const lfo = ctx.createOscillator();
                 lfo.type = 'sine';
                 lfo.frequency.value = 0.1;
                 const lfoGain = ctx.createGain();
                 lfoGain.gain.value = 300;
                 lfo.connect(lfoGain);
                 lfoGain.connect(filter.frequency);
                 noise.connect(filter);
                 filter.connect(masterGain);
                 noise.start();
                 lfo.start();
                 radioNodesRef.current.push(noise, lfo);
            } else if (radioStation === 'lofi') {
                 const chords = [261.63, 311.13, 392.00, 466.16]; 
                 chords.forEach((freq, i) => {
                     const osc = ctx.createOscillator();
                     osc.type = 'triangle';
                     osc.frequency.value = freq;
                     const gain = ctx.createGain();
                     gain.gain.value = 0.1 / chords.length;
                     const lfo = ctx.createOscillator();
                     lfo.frequency.value = 0.5 + Math.random();
                     const lfoGain = ctx.createGain();
                     lfoGain.gain.value = 2; 
                     lfo.connect(lfoGain);
                     lfoGain.connect(osc.frequency);
                     osc.connect(gain);
                     gain.connect(masterGain);
                     osc.start();
                     lfo.start();
                     radioNodesRef.current.push(osc, lfo);
                 });
            }
        }
    } catch (e) { console.error("Radio error", e); }
  }, [radioStation, isMuted]);

  const cycleRadio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
      }
      setRadioStation((prev: RadioStation) => {
          if (prev === 'off') return 'nature';
          if (prev === 'nature') return 'lofi';
          return 'off';
      });
      const next = radioStation === 'off' ? 'nature' : radioStation === 'nature' ? 'lofi' : 'off';
      const msg = next === 'nature' ? "Radyo: Doğa Sesleri" : next === 'lofi' ? "Radyo: Lo-Fi Modu" : "Radyo: Kapalı";
      showToast(msg, "text-white");
  };

  const getPrestigeBonus = useCallback((type: 'money' | 'xp' | 'power' | 'luck' | 'auto' | 'discount') => {
      let multiplier = 0;
      PRESTIGE_UPGRADES.filter(u => u.type === type).forEach(u => {
          const level = prestigeUpgrades[u.id] || 0;
          multiplier += level * u.effectPerLevel;
      });
      return multiplier;
  }, [prestigeUpgrades]);

  useEffect(() => {
    const updateMarket = () => {
        const prices: Record<string, number> = {};
        const allFish = (Object.values(FISH_DB) as FishBase[][]).flat();
        allFish.forEach(f => {
            if (f.type === ItemType.FISH) {
                const mult = 0.75 + Math.random() * 0.6; 
                prices[f.name] = Number(mult.toFixed(2));
            }
        });
        setMarketMultipliers(prices);
    };
    updateMarket(); 
    const timer = setInterval(() => {
        updateMarket();
        showToast("📉 Borsa Güncellendi! Fiyatlar değişti.", "text-blue-300");
    }, 60000); 
    return () => clearInterval(timer);
  }, [showToast]);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!mysteryMerchant && Math.random() < 0.1) {
              const items: { type: 'bait'|'buff'|'rod', id: string|number, price: number, name: string }[] = [
                  { type: 'bait', id: 'legendary_bait', price: 25000, name: 'Efsanevi Yem (İndirimli)' },
                  { type: 'buff', id: 'xp_elixir', price: 5000, name: 'XP İksiri (5000 XP)' }, 
                  { type: 'rod', id: 4, price: 2000, name: 'Göl Kamışı (Fırsat)' } 
              ];
              setMysteryMerchant({
                  active: true,
                  expiry: Date.now() + 60000, 
                  items: items
              });
              showToast("Gizemli Tüccar Belirdi!", "text-fuchsia-400");
              playSound('success');
          }
      }, 60000);
      return () => clearInterval(interval);
  }, [mysteryMerchant, playSound, showToast]);

  useEffect(() => {
      if (mysteryMerchant && Date.now() > mysteryMerchant.expiry) {
          setMysteryMerchant(null);
          showToast("Gizemli Tüccar Ayrıldı", "text-slate-400");
      }
      const checkExpiry = setInterval(() => {
          if (mysteryMerchant && Date.now() > mysteryMerchant.expiry) {
              setMysteryMerchant(null);
              showToast("Gizemli Tüccar Ayrıldı", "text-slate-400");
          }
      }, 1000);
      return () => clearInterval(checkExpiry);
  }, [mysteryMerchant, showToast]);

  useEffect(() => {
      const timer = setInterval(() => {
          setNewsTicker(NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)]);
      }, 30000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          setStats((prev: PlayerStats) => {
              if (prev.bankBalance > 0) {
                  const interest = Math.floor(prev.bankBalance * 0.01);
                  return { ...prev, bankBalance: prev.bankBalance + interest };
              }
              return prev;
          });
          
          if (autoNetLevel > 0) {
              const income = autoNetLevel * 10;
              const charmBoost = ownedCharms.includes('auto_gear') ? 1.2 : 1;
              const prestigeBoost = 1 + getPrestigeBonus('auto');
              setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + Math.floor(income * charmBoost * prestigeBoost) }));
          }

          setOwnedPets((pets: OwnedPet[]) => pets.map(p => {
             if (p.hunger > 0) return { ...p, hunger: Math.max(0, p.hunger - 5) }; 
             return p;
          }));

          if (stats.wormFarmLevel > 0) {
              setBag((currentBag: CatchItem[]) => {
                  if (currentBag.length < stats.bagLimit) {
                      const newWorm: CatchItem = {
                          name: 'Solucan',
                          type: ItemType.BAIT,
                          value: 5,
                          rarity: 0,
                          emoji: '🪱',
                          weight: 0.1,
                          id: Date.now().toString() + Math.random(),
                          visual: { shape: 'long', bodyColor: '#fca5a5', finColor: '#ef4444', pattern: 'none' }
                      };
                      const amount = stats.wormFarmLevel;
                      const space = stats.bagLimit - currentBag.length;
                      const toAdd = Math.min(amount, space);
                      if (toAdd > 0) {
                          showToast(`Solucan Çiftliği: +${toAdd} Yem`, "text-amber-400");
                          const worms = Array(toAdd).fill(null).map((_, i) => ({...newWorm, id: newWorm.id + i}));
                          return [...currentBag, ...worms];
                      }
                  }
                  return currentBag;
              });
          }

      }, 60000);
      return () => clearInterval(timer);
  }, [autoNetLevel, ownedCharms, prestigeUpgrades, getPrestigeBonus, stats.wormFarmLevel, stats.bagLimit, showToast]);

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
    setIsMuted((prev: boolean) => !prev);
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
    setTournament((prev: TournamentState) => ({ ...prev, finished: false }));
  }, []);

  useEffect(() => {
     const allFish = (Object.values(FISH_DB) as FishBase[][]).flat().filter(f => f.type === ItemType.FISH);
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
          setStats((s: PlayerStats) => ({ ...s, money: s.money + reward }));
          spawnText(`+${reward} TL`, "text-yellow-400", supplyCrate.x, supplyCrate.y);
      } else if (rand < 0.7) {
          const bait = BAITS[Math.floor(Math.random() * 3)];
          setStats((s: PlayerStats) => ({ ...s, baitId: bait.id }));
          showToast(`Kasa: ${bait.name}`, "text-emerald-400");
      } else {
          showToast("Kasa Boş Çıktı :(", "text-slate-400");
      }
  };

  const collectVisitorTip = () => {
      if (!visitorTip || !visitorTip.active) return;
      setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + visitorTip.amount }));
      setVisitorTip(null);
      spawnText(`+${visitorTip.amount} TL`, "text-yellow-300", 50, 50);
      playSound('cash');
  };

  const rerollFortune = () => {
      if (stats.money >= 1000) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - 1000 }));
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
      setStats((prev: PlayerStats) => ({ ...prev, rodHp: Math.min(RODS[prev.rodId].maxHp, prev.rodHp + hpRestore) }));
      setBag((prev: CatchItem[]) => prev.filter(f => f.id !== id));
      spawnText(`+${hpRestore} HP`, "text-green-400", 50, 50);
      playSound('click');
  };

  const bankDeposit = (amount: number) => {
      if (stats.money >= amount) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money - amount, bankBalance: s.bankBalance + amount }));
          playSound('cash');
      }
  };

  const bankWithdraw = (amount: number) => {
      if (stats.bankBalance >= amount) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money + amount, bankBalance: s.bankBalance - amount }));
          playSound('cash');
      }
  };

  const upgradeAutoNet = () => {
      const cost = (autoNetLevel + 1) * 2000;
      if (stats.money >= cost) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money - cost }));
          setAutoNetLevel((l: number) => l + 1);
          playSound('lvl');
          showToast(`Otomatik Ağ Yükseltildi: Seviye ${autoNetLevel + 1}`, "text-blue-400");
      }
  };

  const upgradeWormFarm = () => {
      const cost = (stats.wormFarmLevel + 1) * 2500;
      if (stats.money >= cost) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money - cost, wormFarmLevel: s.wormFarmLevel + 1 }));
          playSound('lvl');
          showToast(`Solucan Çiftliği Yükseltildi!`, "text-amber-400");
      } else {
          showToast("Yetersiz Bakiye", "text-red-400");
      }
  };

  const spinWheel = () => {
      if (Date.now() < spinAvailable) {
          showToast("Çark henüz hazır değil!", "text-red-400");
          return;
      }
      const rewards: { type: string, val: string | number }[] = [
          { type: 'money', val: 500 },
          { type: 'xp', val: 500 },
          { type: 'bait', val: 'shrimp' },
          { type: 'gold', val: 5000 }, 
      ];
      const res = rewards[Math.random() < 0.05 ? 3 : Math.floor(Math.random() * 3)];
      
      if (res.type === 'money' || res.type === 'gold') {
          const amount = res.val as number;
          setStats((s: PlayerStats) => ({ ...s, money: s.money + amount }));
      }
      if (res.type === 'xp') {
          const amount = res.val as number;
          setStats((s: PlayerStats) => ({ ...s, xp: s.xp + amount }));
      }
      if (res.type === 'bait') setStats((s: PlayerStats) => ({ ...s, baitId: res.val as string }));

      setSpinAvailable(Date.now() + 24 * 60 * 60 * 1000); 
      playSound('success');
      showToast(res.type === 'gold' ? "BÜYÜK ÖDÜL!" : "Ödül Kazanıldı!", "text-yellow-400");
  };

  const toggleSetting = (key: 'sortMode' | 'bulkSellSafe') => {
      setSettings((prev: { sortMode: 'recent' | 'value' | 'weight'; bulkSellSafe: boolean }) => {
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
          setStats((s: PlayerStats) => ({ ...s, money: s.money + offlineEarningsModal }));
          setLifetimeStats((s: LifetimeStats) => ({ ...s, offlineEarnings: s.offlineEarnings + offlineEarningsModal }));
          setOfflineEarningsModal(null);
          playSound('cash');
      }
  };

  const getPetBonus = (type: 'money' | 'xp' | 'catch_rate' | 'discount'): number => {
     let bonus = 0;
     ownedPets.forEach(p => {
        if (p.hunger > 0) {
           const def = PETS.find(d => d.id === p.id);
           if (def && def.bonusType === type) {
               bonus += def.bonusValue * (1 + (p.level - 1) * 0.1);
           }
        }
     });
     return bonus;
  };

  const buyPet = (id: string) => {
      playSound('click');
      if (ownedPets.find(p => p.id === id)) {
          showToast("Bu yoldaşa zaten sahipsin!", "text-orange-400");
          return;
      }
      const petDef = PETS.find(p => p.id === id);
      if (!petDef) return;

      if (stats.money >= petDef.price) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money - petDef.price }));
          setOwnedPets((prev: OwnedPet[]) => [...prev, { id, hunger: 100, level: 1, xp: 0 }]);
          playSound('success');
          showToast(`${petDef.name} artık seninle!`, "text-white");
      } else {
          showToast("Yetersiz Bakiye", "text-red-500");
          playSound('fail');
      }
  };

  const feedPet = (id: string) => {
      playSound('click');
      const petIdx = ownedPets.findIndex(p => p.id === id);
      if (petIdx === -1) return;
      
      const food = bag.find(i => i.type === ItemType.JUNK) || bag.find(i => i.type === ItemType.FISH);
      if (!food) {
          showToast("Çantanda balık veya çöp yok!", "text-red-400");
          return;
      }
      
      setBag((prev: CatchItem[]) => prev.filter(i => i.id !== food.id));
      
      setOwnedPets((prev: OwnedPet[]) => {
          const copy = [...prev];
          const p = copy[petIdx];
          p.hunger = Math.min(100, p.hunger + 20);
          p.xp += 10;
          if (p.xp >= p.level * 50) {
              p.xp = 0;
              p.level = Math.min(10, p.level + 1);
              showToast("Yoldaş Seviye Atladı!", "text-yellow-400");
              playSound('lvl');
          }
          return copy;
      });
      
      showToast(`${food.name} verildi`, "text-green-400");
      playSound('click');
  };

  const calculatePrestigePearls = () => {
      if (stats.level < 50) return 0;
      const levelBonus = 1 + Math.floor((stats.level - 50) / 10);
      const moneyBonus = Math.floor(stats.money / 100000);
      const bankBonus = Math.floor(stats.bankBalance / 100000);
      return levelBonus + moneyBonus + bankBonus;
  };

  const doPrestige = () => {
      if (stats.level < 50) {
          showToast("Seviye 50 olmalısın!", "text-red-500");
          return;
      }
      
      const pearlsEarned = calculatePrestigePearls();
      const nextPrestigeLevel = stats.prestigeLevel + 1;
      const currentPearls = stats.pearls + pearlsEarned;
      const currentUpgrades = { ...prestigeUpgrades };
      const currentAchievements = [ ...achievements ];
      const currentLifetime = { ...lifetimeStats };
      const currentSettings = { ...settings };
      const currentPedia = { ...pedia };

      setStats({
          ...INITIAL_STATS,
          pearls: currentPearls,
          prestigeLevel: nextPrestigeLevel
      });

      setBag([]);
      setAquarium([]);
      setSkills({ luck: 0, haggle: 0, repair: 0, biology: 0 });
      setUnlockedLocs([0]);
      setOwnedRods([0]);
      setOwnedBobbers(['basic']);
      setOwnedDecor([]);
      setActiveDecor([]);
      setQuests([]);
      setQuestCooldown(0);
      setRodMastery({});
      setOwnedCharms([]);
      setAutoNetLevel(0);
      setMapParts(0);
      setOwnedPets([]); 
      
      setAchievements(currentAchievements);
      setLifetimeStats(currentLifetime);
      setSettings(currentSettings);
      setPedia(currentPedia);
      setPrestigeUpgrades(currentUpgrades);
      setRestaurant(INITIAL_RESTAURANT);

      generateQuests(0);
      
      playSound('lvl');
      showToast("YENİDEN DOĞUŞ GERÇEKLEŞTİ!", "text-cyan-300", `${pearlsEarned} İnci Kazanıldı!`);
  };

  const buyPrestigeUpgrade = (id: string) => {
      playSound('click');
      const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
      if (!upgrade) return;
      
      const currentLevel = prestigeUpgrades[id] || 0;
      if (currentLevel >= upgrade.maxLevel) {
          showToast("Maksimum Seviye!", "text-orange-400");
          return;
      }
      
      if (stats.pearls >= upgrade.cost) {
          setStats((prev: PlayerStats) => ({ ...prev, pearls: prev.pearls - upgrade.cost }));
          setPrestigeUpgrades((prev: Record<string, number>) => ({ ...prev, [id]: currentLevel + 1 }));
          playSound('success');
          showToast(`${upgrade.name} Yükseltildi!`, "text-cyan-400");
      } else {
          showToast("Yetersiz İnci", "text-red-400");
          playSound('fail');
      }
  };

  const donateFish = (id: string) => {
      const fish = bag.find(f => f.id === id);
      if (!fish) return;
      if (pedia[fish.name]?.donated) {
          showToast("Zaten bağışlanmış!", "text-orange-400");
          return;
      }

      setBag((prev: CatchItem[]) => prev.filter(f => f.id !== id));

      setPedia((prev: Record<string, PediaEntry>) => ({
          ...prev,
          [fish.name]: {
              ...prev[fish.name],
              donated: true
          }
      }));

      const pearlReward = 1; 
      const moneyReward = fish.value * 5;
      
      setStats((prev: PlayerStats) => ({
          ...prev, 
          money: prev.money + moneyReward,
          pearls: prev.pearls + pearlReward
      }));

      playSound('success');
      showToast("Müzeye Bağışlandı!", "text-purple-400", `+${pearlReward} İnci, +${moneyReward} TL`);
  };

  const craftItem = (recipeId: string) => {
      const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
      if (!recipe) return;

      const canCraft = recipe.inputs.every(inp => bag.filter(i => i.name === inp.itemName).length >= inp.count);

      if (canCraft) {
          let newBag = [...bag];
          recipe.inputs.forEach(inp => {
              let removed = 0;
              newBag = newBag.filter(item => {
                  if (item.name === inp.itemName && removed < inp.count) {
                      removed++;
                      return false; 
                  }
                  return true; 
              });
          });
          
          const outputItem: CatchItem = {
             id: Date.now().toString(),
             name: recipe.output.name,
             type: recipe.output.type === 'bait' ? ItemType.BAIT : recipe.output.type === 'buff' ? ItemType.BUFF : ItemType.CHARM,
             value: 100,
             rarity: 3,
             emoji: recipe.output.type === 'bait' ? '🪱' : recipe.output.type === 'buff' ? '🧪' : '🧿',
             weight: 0.1,
             visual: { shape: 'round', bodyColor: '#fff', finColor: '#fff', pattern: 'none' }
          };
          
          setBag([...newBag, outputItem]);
          
          playSound('success');
          showToast(`${recipe.output.name} Üretildi!`, "text-amber-400");
      } else {
          showToast("Malzemeler Eksik", "text-red-400");
          playSound('fail');
      }
  };

  const buyMerchantItem = (idx: number) => {
      if (!mysteryMerchant) return;
      const item = mysteryMerchant.items[idx];
      
      if (stats.money >= item.price) {
          if (item.type === 'rod' && typeof item.id === 'number' && ownedRods.includes(item.id)) {
               showToast("Zaten Sahipsin!", "text-orange-400");
               return;
          }

          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - item.price }));
          
          if (item.type === 'bait') {
               setStats((prev: PlayerStats) => ({ ...prev, baitId: item.id as string }));
               showToast(`${item.name} Kuşanıldı`, "text-emerald-400");
          } else if (item.type === 'rod') {
               setOwnedRods((prev: number[]) => [...prev, item.id as number]);
               showToast("Yeni Olta Alındı!", "text-white");
          } else if (item.type === 'buff') {
               if (item.id === 'xp_elixir') {
                   setStats((prev: PlayerStats) => ({ ...prev, xp: prev.xp + 5000 }));
                   showToast("5000 XP Kazanıldı!", "text-purple-400");
               }
          }

          playSound('cash');
      } else {
          showToast("Yetersiz Bakiye", "text-red-500");
          playSound('fail');
      }
  };

  const useItem = (id: string) => {
      const item = bag.find(i => i.id === id);
      if (!item) return;
      
      if (item.type === ItemType.BAIT) {
          let baitId = 'worm';
          if (item.name === 'Kaşık (Spoon)') baitId = 'lure_spoon';
          if (item.name === 'Döner Kaşık') baitId = 'lure_spinner';
          
          setStats((prev: PlayerStats) => ({ ...prev, baitId: baitId }));
          showToast(`${item.name} Takıldı!`, "text-green-400");
      } else if (item.type === ItemType.BUFF) {
          if (item.name === 'Enerji İçeceği') {
             setBuffs((prev: { xpBoostExpiry: number; goldenHook: boolean }) => ({...prev, xpBoostExpiry: Date.now() + 5*60000})); 
             showToast("Enerji İçeceği İçildi!", "text-purple-400", "5dk 2x XP");
          }
      } else if (item.type === ItemType.CHARM) {
          const charm = CHARMS.find(c => c.name === item.name);
          if (charm) {
              if (!ownedCharms.includes(charm.id)) {
                  setOwnedCharms((prev: string[]) => [...prev, charm.id]);
                  showToast(`${item.name} Kuşanıldı!`, "text-purple-400");
              } else {
                  showToast("Zaten sahipsin (Satıldı)", "text-yellow-400", "+500 TL");
                  setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + 500 }));
              }
          }
      }
      
      setBag((prev: CatchItem[]) => prev.filter(i => i.id !== id));
      playSound('click');
  };

  const playSlotMachine = (bet: number): { result: string[]; reward: number; winType: 'none' | 'small' | 'big' | 'jackpot' } => {
      if (stats.money < bet) return { result: ['❌', '❌', '❌'], reward: 0, winType: 'none' };

      setStats((s: PlayerStats) => ({ ...s, money: s.money - bet }));
      
      const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
      const weights = [40, 30, 20, 8, 2]; // Probabilities
      
      const getRandomSymbol = () => {
          const rand = Math.random() * 100;
          let sum = 0;
          for (let i = 0; i < weights.length; i++) {
              sum += weights[i];
              if (rand < sum) return symbols[i];
          }
          return symbols[0];
      };

      const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      
      // Calculate Payout
      let reward = 0;
      let winType: 'none' | 'small' | 'big' | 'jackpot' = 'none';

      if (result[0] === result[1] && result[1] === result[2]) {
          // 3 of a kind
          if (result[0] === '7️⃣') { reward = bet * 50; winType = 'jackpot'; }
          else if (result[0] === '💎') { reward = bet * 20; winType = 'big'; }
          else if (result[0] === '🍇') { reward = bet * 10; winType = 'big'; }
          else if (result[0] === '🍋') { reward = bet * 5; winType = 'small'; }
          else { reward = bet * 3; winType = 'small'; } // Cherries
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
          // 2 of a kind
          reward = Math.floor(bet * 1.5);
          winType = 'small';
      }

      if (reward > 0) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money + reward }));
          playSound('cash');
      }

      return { result, reward, winType };
  };

  const claimDailyReward = () => {
      if (dailyRewardPopup && dailyRewardPopup.active) {
          setStats((s: PlayerStats) => ({ ...s, money: s.money + dailyRewardPopup.reward, dailyStreak: dailyRewardPopup.streak, lastRewardTime: Date.now() }));
          setDailyRewardPopup(null);
          playSound('success');
          showToast(`Günlük Ödül Alındı!`, "text-yellow-400", `+${dailyRewardPopup.reward} TL`);
      }
  };

  useEffect(() => {
    const saved = localStorage.getItem("balikciHasanSave_v6");
    if (saved) {
      try {
        const data: SavedGame = JSON.parse(saved);
        
        if (data.autoNetLevel && data.autoNetLevel > 0 && data.lastLogin) {
            const now = Date.now();
            const minutesOffline = Math.floor((now - data.lastLogin) / 60000);
            if (minutesOffline > 10) {
                const prestigeBoost = 1 + (data.prestigeUpgrades?.['perm_auto'] || 0) * 0.2;
                const income = Math.floor(minutesOffline * data.autoNetLevel * 10 * prestigeBoost);
                if (income > 0) setOfflineEarningsModal(income);
            }
        }
        
        let loadedPets = data.ownedPets || [];
        if (data.lastLogin && loadedPets.length > 0) {
             const now = Date.now();
             const minutesOffline = Math.floor((now - data.lastLogin) / 60000);
             if (minutesOffline > 0) {
                 loadedPets = loadedPets.map(p => ({
                     ...p,
                     hunger: Math.max(0, p.hunger - (minutesOffline * 5))
                 }));
             }
        }

        // Daily Reward Logic
        const now = Date.now();
        const lastReward = data.stats.lastRewardTime || 0;
        const lastDate = new Date(lastReward);
        const currentDate = new Date(now);
        
        // Reset time to midnight for comparison
        lastDate.setHours(0,0,0,0);
        currentDate.setHours(0,0,0,0);
        
        if (currentDate.getTime() > lastDate.getTime()) {
            // New day
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let newStreak = (data.stats.dailyStreak || 0);
            if (diffDays === 1) {
                newStreak += 1;
            } else {
                newStreak = 1;
            }
            
            const reward = newStreak * 200 + 100;
            setDailyRewardPopup({ active: true, streak: newStreak, reward });
        }

        setStats({ ...INITIAL_STATS, ...data.stats });
        
        const hydrateItems = (items: CatchItem[]) => items.map(i => {
             if (!i.visual) {
                const dbItem = (Object.values(FISH_DB) as FishBase[][]).flat().find(f => f.name === i.name);
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
        if (data.prestigeUpgrades) setPrestigeUpgrades(data.prestigeUpgrades);
        
        if (data.radioStation) setRadioStation(data.radioStation); 
        
        // Load Restaurant state if exists, else merge with default (locked)
        if (data.restaurant) {
            setRestaurant({
                ...INITIAL_RESTAURANT,
                ...data.restaurant,
                // Ensure legacy saves get locked status if undefined
                isUnlocked: data.restaurant.isUnlocked ?? false,
                level: data.restaurant.level ?? 1
            });
        }

        setOwnedPets(loadedPets);

      } catch (e) { console.error("Save file corrupted", e); }
    } else {
      generateQuests(INITIAL_STATS.locId);
    }
  }, []);

  useEffect(() => {
    const data: SavedGame = {
      stats, bag, aquarium, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, skills, pedia, quests, questCooldown,
      lastLogin: Date.now(), lifetimeStats, filterExpiry, rodMastery, ecologyScore, buffs,
      autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, ownedPets, prestigeUpgrades,
      radioStation, restaurant
    };
    localStorage.setItem("balikciHasanSave_v6", JSON.stringify(data));
  }, [stats, bag, aquarium, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, skills, pedia, quests, questCooldown, lifetimeStats, filterExpiry, rodMastery, ecologyScore, buffs, autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, ownedPets, prestigeUpgrades, radioStation, restaurant]);

  const cleanAquarium = () => {
    playSound('click');
    const cost = 250;
    if (stats.money >= cost) {
       setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost }));
       setFilterExpiry(Date.now() + 10 * 60000);
       showToast("Filtre Temizlendi!", "text-cyan-400", "Gelir x2 (10dk)");
       spawnText("+10dk BOOST", "text-cyan-300", 50, 50);
       playSound('success');
    } else {
       showToast("Yetersiz Bakiye", "text-red-500");
       playSound('fail');
    }
  };

  const hookFish = useCallback(() => {
    if (gameState === GameState.BITE) {
        if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
        pickFish();
    }
  }, [gameState]);

  const castRod = () => {
    playSound('click');
    if (stats.rodHp <= 0) { showToast("⚠️ Olta Kırık!", "text-red-500"); return; }
    if (bag.length >= stats.bagLimit) { showToast("⚠️ Çanta Dolu!", "text-orange-400"); return; }
    
    const critCast = Math.random() < 0.05; 
    
    setGameState(GameState.CASTING);
    playSound('cast');
    
    if (critCast) spawnText("KRİTİK ATIŞ!", "text-amber-400", 50, 40);

    setTimeout(() => {
      setGameState(GameState.WAITING);
      let waitTime = critCast ? 200 : (2000 + Math.random() * 3000); 
      if (weather === WeatherType.RAIN) waitTime *= 0.7;
      if (activeEvent?.id === 'frenzy') waitTime *= 0.5; // Frenzy event reduce wait time
      
      setTimeout(() => {
        setGameState(GameState.BITE);
        playSound('splash');
        
        // Timeout to miss fish if not clicked
        biteTimeoutRef.current = window.setTimeout(() => {
             if (gameState === GameState.BITE) { // Check if still in bite state
                setGameState(GameState.IDLE);
                showToast("Balık Kaçtı!", "text-slate-400");
             }
        }, 1500);

      }, waitTime);
    }, 500);
  };

  const pickFish = () => {
    const pool = FISH_DB[stats.locId];
    const rod = RODS[stats.rodId];
    const baitBonus = stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.bonus || 1 : 1;
    
    const masteryCount = rodMastery[stats.rodId] || 0;
    const masteryBonus = 1 + Math.min(0.5, (masteryCount / 50) * 0.01);
    const petCatchBonus = getPetBonus('catch_rate');
    const prestigePower = 1 + getPrestigeBonus('power');
    const prestigeLuck = 1 + getPrestigeBonus('luck');

    const useGoldenHook = buffs.goldenHook;
    if (useGoldenHook) {
        setBuffs((prev: { xpBoostExpiry: number; goldenHook: boolean }) => ({ ...prev, goldenHook: false }));
        spawnText("ALTIN İĞNE KULLANILDI", "text-yellow-300", 50, 60);
    }

    let totalW = 0;
    const wPool = pool.map(f => {
      let w = 100 / Math.pow(2, f.rarity);
      
      if (f.type !== ItemType.JUNK) {
        w *= (rod.power * masteryBonus * baitBonus * prestigePower * (1 + skills['luck'] * 0.1) * prestigeLuck);
        if (ownedCharms.includes('clover')) w *= 1.1;
        if (petCatchBonus > 0 && f.rarity >= 3) w *= (1 + petCatchBonus);
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
    
    if (snapped) {
      setGameState(GameState.BROKEN);
      setStats((prev: PlayerStats) => ({ ...prev, rodHp: Math.max(0, prev.rodHp - 3) }));
      showToast("MİSİNA KOPTU!", "text-red-500");
      setCombo(0);
      playSound('fail');
    } else if (success && currentFish) {
      setGameState(GameState.CAUGHT);
      playSound('success');

      // Double Hook Logic
      const doubleHookLevel = skills['double_hook'] || 0;
      const doubleChance = doubleHookLevel * 0.1; // 10% per level
      const isDouble = Math.random() < doubleChance && currentFish.type !== ItemType.JUNK;
      
      const fishesToProcess = [currentFish];
      if (isDouble) fishesToProcess.push(currentFish);
      
      let itemsAdded = 0;

      fishesToProcess.forEach((fishToProcess, idx) => {
          if (bag.length + itemsAdded >= stats.bagLimit) return; // Stop if full
          itemsAdded++;
          
          if (fishToProcess.type !== ItemType.JUNK) {
             setCombo((prev: number) => prev + 1);
             if (idx === 0) setRodMastery((prev: Record<number, number>) => ({ ...prev, [stats.rodId]: (prev[stats.rodId] || 0) + 1 }));
          } else {
             setCombo(0);
          }
          
          let baseW = (Math.random() * 5 + 1) * (1 + skills['biology'] * 0.2) * (1 + stats.locId * 0.2);
          if (activeEvent?.id === 'giant_fish') baseW *= 1.5; // Giant Fish event

          const finalWeight = Number(baseW.toFixed(2));
          
          const isShiny = Math.random() < 0.005; 
          const isGolden = Math.random() < 0.01;

          let finalValue = fishToProcess.value;
          if (isGolden) finalValue *= 10;
          else if (isShiny) finalValue *= 5;
          if (perfect) finalValue = Math.floor(finalValue * 1.2);

          const visualData: FishVisual = fishToProcess.visual || { shape: 'round', bodyColor: '#888', finColor: '#666', pattern: 'none' };

          const caughtItem: CatchItem = { 
            ...fishToProcess, 
            weight: finalWeight, 
            id: Date.now().toString() + idx,
            shiny: isShiny,
            golden: isGolden,
            value: finalValue,
            visual: visualData,
            perfect
          };
          
          if (idx === 0) {
              setCatchVisual({ emoji: caughtItem.emoji, visual: visualData, rarity: caughtItem.rarity, id: Date.now(), shiny: isShiny, golden: isGolden });
          }

          setBag((prev: CatchItem[]) => [...prev, caughtItem]);
          
          // XP and Stats update for each fish
          let xpGain = Math.floor(fishToProcess.rarity * 12 * (1 + stats.locId * 0.1));
          setStats((prev: PlayerStats) => ({ ...prev, xp: prev.xp + xpGain, level: prev.level + (prev.xp + xpGain >= prev.level * 300 ? 1 : 0) })); // Simplified level up for loop
          
          setPedia((prev: Record<string, PediaEntry>) => ({
              ...prev,
              [fishToProcess.name]: {
                count: (prev[fishToProcess.name]?.count || 0) + 1,
                maxWeight: Math.max(prev[fishToProcess.name]?.maxWeight || 0, finalWeight),
                shinyCaught: (prev[fishToProcess.name]?.shinyCaught || false) || isShiny,
                goldenCaught: (prev[fishToProcess.name]?.goldenCaught || false) || isGolden,
                donated: prev[fishToProcess.name]?.donated || false
              }
          }));
      });

      if (isDouble && itemsAdded === 2) {
          spawnText("ÇİFT İĞNE! x2", "text-blue-400", 50, 80);
      }
      
      setGameState(GameState.IDLE);
      setCatchVisual(null); 

    } else {
      setGameState(GameState.IDLE);
      showToast("KAÇTI!", "text-slate-400");
      setCombo(0);
      playSound('fail');
    }
  };

  const startDiving = () => {
    const cost = 500;
    if (bag.length >= stats.bagLimit) { showToast("Çanta Dolu!", "text-orange-400"); return; }
    if (stats.money >= cost) {
       setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost }));
       setGameState(GameState.DIVING);
       playSound('splash');
    } else {
       showToast("Yetersiz Bakiye (500 TL)", "text-red-500");
       playSound('fail');
    }
  };

  const endDiving = (score: number) => {
      setGameState(GameState.IDLE);
      let pearlType = '';
      let value = 0;
      let visual: FishVisual = { shape: 'round', bodyColor: '#fff', finColor: '#ddd', pattern: 'shiny' };
      
      if (score >= 2000) { 
          pearlType = 'Altın İnci'; value = 5000; visual.bodyColor = '#fbbf24'; 
      } else if (score >= 1000) { 
          pearlType = 'Siyah İnci'; value = 2500; visual.bodyColor = '#000'; 
      } else if (score >= 500) { 
          pearlType = 'Beyaz İnci'; value = 1000; visual.bodyColor = '#fff'; 
      } else {
          showToast("İnci Bulunamadı", "text-slate-400");
          return;
      }

      const item: CatchItem = {
          id: Date.now().toString(),
          name: pearlType,
          type: ItemType.TREASURE,
          value,
          rarity: 4,
          weight: 0.1,
          emoji: '⚪',
          visual,
          shiny: true
      };
      
      setBag((prev: CatchItem[]) => [...prev, item]);
      showToast(`Buldun: ${pearlType}`, "text-cyan-400", `Skor: ${score}`);
      playSound('success');
      setStats((s: PlayerStats) => ({ ...s, xp: s.xp + Math.floor(score/10) }));
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
    const petMoneyBonus = getPetBonus('money');
    const prestigeMoneyBonus = getPrestigeBonus('money');
    const marketPriceMult = marketMultipliers[item.name] || 1; 
    const eventBonus = activeEvent?.id === 'gold_rush' ? 2 : 1; // Gold Rush Event

    let basePrice = Math.floor(item.value * (1 + skills['haggle'] * 0.1));
    if (petMoneyBonus > 0) basePrice = Math.floor(basePrice * (1 + petMoneyBonus));
    if (prestigeMoneyBonus > 0) basePrice = Math.floor(basePrice * (1 + prestigeMoneyBonus));
    
    basePrice = Math.floor(basePrice * marketPriceMult * eventBonus);

    const finalPrice = Math.floor(basePrice * comboMultiplier * trendBonus * ecoBonus);

    setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + finalPrice }));
    setLifetimeStats((prev: LifetimeStats) => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + finalPrice }));
    
    if (fromAqua) setAquarium((prev: CatchItem[]) => prev.filter(i => i.id !== id));
    else setBag((prev: CatchItem[]) => prev.filter(i => i.id !== id));

    spawnText(`+${finalPrice} TL`, "text-yellow-400", 50, 50);
    playSound('cash');
  };

  const sellAll = () => {
    playSound('click');
    if (bag.length === 0) return;
    let total = 0;
    const comboMultiplier = 1 + (combo * 0.1);
    const ecoBonus = ecologyScore >= 100 ? 1.2 : 1;
    const petMoneyBonus = getPetBonus('money');
    const prestigeMoneyBonus = getPrestigeBonus('money');
    const eventBonus = activeEvent?.id === 'gold_rush' ? 2 : 1; // Gold Rush Event
    
    const itemsToSell = settings.bulkSellSafe ? bag.filter(i => i.rarity < 3 && i.type !== ItemType.TREASURE) : bag;
    
    if (itemsToSell.length === 0) {
        showToast("Satılacak eşya yok (Güvenli Mod)", "text-orange-400");
        return;
    }

    itemsToSell.forEach(i => {
       if (i.type !== ItemType.JUNK) {
           const trendBonus = marketTrend && marketTrend.fishName === i.name ? marketTrend.multiplier : 1;
           const marketPriceMult = marketMultipliers[i.name] || 1;

           let val = i.value * (1 + skills['haggle'] * 0.1);
           if (petMoneyBonus > 0) val *= (1 + petMoneyBonus);
           if (prestigeMoneyBonus > 0) val *= (1 + prestigeMoneyBonus);
           val *= marketPriceMult;
           val *= eventBonus;

           total += Math.floor(val * comboMultiplier * trendBonus * ecoBonus);
       } else {
           total += 1;
       }
    });

    setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + total }));
    setLifetimeStats((prev: LifetimeStats) => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + total }));
    
    const soldIds = itemsToSell.map(i => i.id);
    setBag((prev: CatchItem[]) => prev.filter(i => !soldIds.includes(i.id)));
    
    showToast(`Satıldı: +${total} TL`, "text-yellow-400");
    playSound('cash');
  };

  const recycleJunk = () => { 
      playSound('click'); 
      const junks = bag.filter(i => i.type === ItemType.JUNK); 
      if (junks.length < 5) { showToast("Yetersiz Çöp (Min 5)", "text-red-400"); return; } 
      let removed = 0; 
      setBag((prev: CatchItem[]) => prev.filter(item => { if (item.type === ItemType.JUNK && removed < 5) { removed++; return false; } return true; })); 
      const bait = BAITS[Math.floor(Math.random() * 3)]; 
      setStats((prev: PlayerStats) => ({ ...prev, baitId: bait.id })); 
      setEcologyScore((prev: number) => Math.min(100, prev + 10));
      showToast(`Doğa Temizlendi! +10 Puan`, "text-green-400"); 
      playSound('success'); 
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

    let cost = activeDiscount && (type === 'rod' || type === 'bait') ? Math.floor(baseCost * 0.8) : baseCost;
    if (type === 'location') {
        const disc = getPetBonus('discount');
        if (disc > 0) cost = Math.floor(cost * (1 - disc));
    }
    const prestigeDiscount = getPrestigeBonus('discount');
    if (prestigeDiscount > 0) cost = Math.floor(cost * (1 - prestigeDiscount));

    if (stats.money >= cost) {
      setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost }));
      playSound('cash');
      
      if (type === 'rod') {
        setOwnedRods((prev: number[]) => [...prev, Number(id)]);
        setStats((prev: PlayerStats) => ({ ...prev, rodId: Number(id), rodHp: RODS.find(r => r.id === id)!.maxHp }));
        showToast("Yeni Olta Alındı!", "text-white");
      }
      if (type === 'bait') { setStats((prev: PlayerStats) => ({ ...prev, baitId: String(id) })); showToast("Yem Takıldı", "text-emerald-400"); }
      if (type === 'location') { setUnlockedLocs((prev: number[]) => [...prev, Number(id)]); travel(Number(id)); }
      if (type === 'upgrade') { setStats((prev: PlayerStats) => ({ ...prev, bagLimit: prev.bagLimit + 5 })); showToast("Çanta Genişletildi", "text-blue-400"); }
      if (type === 'bobber') { setOwnedBobbers((prev: string[]) => [...prev, String(id)]); setStats((prev: PlayerStats) => ({ ...prev, bobberId: String(id) })); showToast("Şamandıra Alındı!", "text-white"); }
      if (type === 'decor') { setOwnedDecor((prev: string[]) => [...prev, String(id)]); setActiveDecor((prev: string[]) => [...prev, String(id)]); showToast("Dekor Eklendi!", "text-white"); }
      if (type === 'buff' && id === 'energy') { setBuffs((prev: { xpBoostExpiry: number; goldenHook: boolean }) => ({...prev, xpBoostExpiry: Date.now() + 5*60000})); showToast("Enerji İçeceği İçildi!", "text-purple-400", "5dk 2x XP"); }
      if (type === 'buff' && id === 'golden') { setBuffs((prev: { xpBoostExpiry: number; goldenHook: boolean }) => ({...prev, goldenHook: true})); showToast("Altın İğne Takıldı!", "text-yellow-300", "Sıradaki Balık: Nadir+"); }
      if (type === 'charm') { setOwnedCharms((prev: string[]) => [...prev, String(id)]); showToast("Tılsım Alındı!", "text-purple-300"); }

    } else {
      showToast("Yetersiz Bakiye", "text-red-500");
      playSound('fail');
    }
  };

  const equipRod = (id: number) => { playSound('click'); setStats((prev: PlayerStats) => ({ ...prev, rodId: id, rodHp: RODS[id].maxHp })); showToast("Olta Kuşanıldı", "text-white"); };
  const equipBobber = (id: string) => { playSound('click'); setStats((prev: PlayerStats) => ({ ...prev, bobberId: id })); showToast("Şamandıra Seçildi", "text-white"); };
  const toggleDecor = (id: string) => { playSound('click'); if (activeDecor.includes(id)) { setActiveDecor((prev: string[]) => prev.filter(d => d !== id)); } else { setActiveDecor((prev: string[]) => [...prev, id]); } };
  const repairRod = () => { playSound('click'); if (stats.money >= 50) { setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - 50, rodHp: RODS[prev.rodId].maxHp })); showToast("Tamir Edildi", "text-blue-400"); playSound('success'); } };
  const travel = (id: number) => { 
      playSound('click'); 
      setStats((prev: PlayerStats) => ({ ...prev, locId: id })); 
      generateQuests(id); 
      showToast(`Konum: ${LOCATIONS[id].name}`, "text-white");
  };
  const claimQuest = (index: number) => { playSound('click'); const q = quests[index]; if (q.claimed) return; setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + q.reward })); setLifetimeStats((prev: LifetimeStats) => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + q.reward })); setQuests((prev: Quest[]) => { const copy = [...prev]; copy[index].claimed = true; return copy; }); spawnText(`+${q.reward} TL`, "text-yellow-400"); playSound('cash'); };
  const moveToAqua = (id: string) => { playSound('click'); if (aquarium.length >= stats.aquaLimit) { showToast("Akvaryum Dolu!", "text-red-500"); return; } const item = bag.find(i => i.id === id); if (item) { setBag((prev: CatchItem[]) => prev.filter(i => i.id !== id)); setAquarium((prev: CatchItem[]) => [...prev, item]); showToast("Akvaryuma Eklendi", "text-cyan-400"); } };
  const upgradeSkill = (id: string) => { playSound('click'); const lvl = skills[id] || 0; const cost = (lvl + 1) * 500; if (stats.money >= cost) { setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost })); setSkills((prev: Record<string, number>) => ({ ...prev, [id]: lvl + 1 })); showToast("Yetenek Geliştirildi", "text-purple-400"); playSound('lvl'); } };
  const resetGame = () => { localStorage.removeItem("balikciHasanSave_v6"); window.location.reload(); };
  const startNewGame = () => { playSound('click'); setStats(INITIAL_STATS); setLifetimeStats(INITIAL_LIFETIME); setBag([]); setAquarium([]); setGameState(GameState.IDLE); setActiveFish(null); setWeather(WeatherType.SUNNY); setSkills({ luck: 0, haggle: 0, repair: 0, biology: 0 }); setUnlockedLocs([0]); setOwnedRods([0]); setOwnedBobbers(['basic']); setOwnedDecor([]); setActiveDecor([]); setAchievements([]); setPedia({}); setTournament({ active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null }); setBounty({ active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0 }); setCombo(0); setFilterExpiry(0); setRodMastery({}); setEcologyScore(0); setBuffs({ xpBoostExpiry: 0, goldenHook: false }); setOwnedCharms([]); setAutoNetLevel(0); setMapParts(0); setOwnedPets([]); generateQuests(0); setPrestigeUpgrades({}); localStorage.removeItem("balikciHasanSave_v6"); showToast("Yeni Oyun Başlatıldı", "text-white"); };
  
  return (
    <GameContext.Provider value={{
      stats, bag, aquarium, gameState, activeFish, weather, quests, questCooldown, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, toast, floatingTexts, celebrationFish, catchVisual, isMuted, lifetimeStats, dailyFortune,
      combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium, marketTrend, marketMultipliers, supplyCrate, collectCrate, rodMastery, activeDiscount, mysteryMerchant,
      timeOfDay, ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
      autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, upgradeWormFarm, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
      ownedPets, buyPet, feedPet, prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
      donateFish, craftItem, buyMerchantItem,
      castRod, reelIn, sellItem, useItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, claimQuest, moveToAqua, upgradeSkill, resetGame, startNewGame, closeCelebration, playSound, toggleMute, getRank, generateQuests, startDiving, endDiving,
      radioStation, cycleRadio, hookFish, playSlotMachine, dailyRewardPopup, claimDailyReward,
      restaurant, activeCustomers, buyIngredient, serveCustomer, rejectCustomer, isRestaurantOpen, setIsRestaurantOpen, unlockRestaurant,
      activeEvent
    }}>
      {children}
    </GameContext.Provider>
  );
};
