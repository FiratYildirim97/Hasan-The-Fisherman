export enum ItemType {
  JUNK = 'junk',
  FISH = 'fish',
  TREASURE = 'treasure'
}

export enum WeatherType {
  SUNNY = 'Sunny',
  RAIN = 'Rain',
  STORM = 'Storm'
}

export enum GameState {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  WAITING = 'WAITING',
  BITE = 'BITE',
  MINIGAME = 'MINIGAME',
  CAUGHT = 'CAUGHT',
  BROKEN = 'BROKEN'
}

export interface Rod {
  id: number;
  name: string;
  price: number;
  maxHp: number;
  power: number;
  color: string;
}

export interface Location {
  id: number;
  name: string;
  price: number;
  icon: string;
  bgGradient: string;
  image: string;
  biome: 'freshwater' | 'coastal' | 'ocean' | 'ice' | 'tropical';
}

export interface Bait {
  id: string;
  name: string;
  price: number;
  bonus: number;
}

export interface Bobber {
  id: string;
  name: string;
  price: number;
  icon: string; 
}

export interface Decoration {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export interface Charm {
  id: string;
  name: string;
  desc: string;
  price: number;
  icon: string;
  effect: 'tension' | 'luck' | 'xp' | 'gold' | 'bait' | 'autonet';
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  condition: (stats: LifetimeStats, save?: SavedGame) => boolean;
}

export interface FishVisual {
  shape: 'carp' | 'trout' | 'round' | 'shark' | 'long' | 'blob' | 'boot' | 'can' | 'ring' | 'coin' | 'crab' | 'catfish' | 'eel' | 'swordfish' | 'angler' | 'squid' | 'whale';
  bodyColor: string;
  finColor: string;
  pattern: 'none' | 'stripes' | 'spots' | 'shiny';
  detailColor?: string;
}

export interface FishBase {
  name: string;
  type: ItemType;
  value: number;
  rarity: number; 
  emoji: string; 
  visual?: FishVisual; 
}

export interface CatchItem extends FishBase {
  weight: number;
  id: string; 
  shiny?: boolean;
  visual: FishVisual;
  perfect?: boolean;
  golden?: boolean; // Feature 4: Golden Variant
  masteryLevel?: number; // Feature 3: Mastery Star (0-3)
  petName?: string; // Feature 17: Fish Naming
}

export interface Skill {
  id: 'luck' | 'haggle' | 'repair' | 'biology' | 'patience' | 'strength' | 'cooking' | 'meteorology' | 'recycling' | 'charisma' | 'traveler' | 'nightowl';
  name: string;
  desc: string;
  max: number;
  reqLvl: number;
}

export interface Quest {
  id: number;
  desc: string;
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
  type: 'count' | 'money' | 'rare';
}

export interface LifetimeStats {
  totalCaught: number;
  totalMoneyEarned: number;
  heaviestFish: number;
  legendariesCaught: number;
  playTimeMinutes: number;
  shinyCaught: number;
  goldenCaught: number; 
  offlineEarnings: number; // Feature 20
}

export interface PlayerStats {
  money: number;
  xp: number;
  level: number;
  rodId: number;
  rodHp: number;
  locId: number;
  bagLimit: number;
  aquaLimit: number;
  baitId: string | null;
  bobberId: string; 
  bankBalance: number; // Feature 1: Bank
}

export interface PediaEntry {
  count: number;
  maxWeight: number;
  shinyCaught: boolean;
  goldenCaught: boolean; 
}

export interface SavedGame {
  stats: PlayerStats;
  bag: CatchItem[];
  aquarium: CatchItem[];
  unlockedLocs: number[];
  ownedRods: number[];
  ownedBobbers: string[];
  ownedDecor: string[];
  activeDecor: string[];
  achievements: string[];
  skills: Record<string, number>;
  pedia: Record<string, PediaEntry>;
  quests: Quest[];
  questCooldown: number;
  lastLogin: number;
  lifetimeStats: LifetimeStats;
  filterExpiry: number;
  rodMastery: Record<number, number>;
  ecologyScore: number;
  buffs: { xpBoostExpiry: number; goldenHook: boolean };
  // NEW FEATURES SAVE DATA
  autoNetLevel: number; // Feature 2 (0 = locked)
  ownedCharms: string[]; // Feature 7
  mapParts: number; // Feature 5
  spinAvailable: number; // Feature 6 (Timestamp)
  settings: {
      sortMode: 'recent' | 'value' | 'weight'; // Feature 18
      bulkSellSafe: boolean; // Feature 12
  }
}

export interface FloatingText {
  id: number;
  text: string;
  x: number; 
  y: number; 
  color: string;
}

export interface CatchVisual {
  emoji: string;
  visual: FishVisual;
  rarity: number;
  id: number;
  shiny?: boolean;
  golden?: boolean; 
}

export interface TournamentState {
  active: boolean;
  timeLeft: number; 
  playerScore: number;
  aiScores: { name: string; score: number }[];
  finished: boolean;
  rank: number | null;
}

export interface Bounty {
  active: boolean;
  fishName: string;
  minWeight: number;
  locId: number;
  reward: number;
  timeLeft: number; 
}

export interface MarketTrend {
  fishName: string;
  multiplier: number;
}