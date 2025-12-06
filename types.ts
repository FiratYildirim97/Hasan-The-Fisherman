
export enum ItemType {
  JUNK = 'junk',
  FISH = 'fish',
  TREASURE = 'treasure',
  BAIT = 'bait',
  BUFF = 'buff',
  CHARM = 'charm'
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
  BROKEN = 'BROKEN',
  DIVING = 'DIVING'
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
  isBoss?: boolean; 
}

export interface CatchItem extends FishBase {
  weight: number;
  id: string; 
  shiny?: boolean;
  visual: FishVisual;
  perfect?: boolean;
  golden?: boolean; 
  masteryLevel?: number; 
  petName?: string; 
}

export interface Skill {
  id: 'luck' | 'haggle' | 'repair' | 'biology' | 'patience' | 'strength' | 'cooking' | 'meteorology' | 'recycling' | 'charisma' | 'traveler' | 'nightowl' | 'double_hook';
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
  offlineEarnings: number; 
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
  bankBalance: number; 
  pearls: number; 
  prestigeLevel: number; 
  wormFarmLevel: number;
  dailyStreak: number;
  lastRewardTime: number;
}

export interface PediaEntry {
  count: number;
  maxWeight: number;
  shinyCaught: boolean;
  goldenCaught: boolean; 
  donated?: boolean; 
}

export interface PetBase {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
  bonusType: 'money' | 'xp' | 'catch_rate' | 'discount';
  bonusValue: number; 
}

export interface OwnedPet {
  id: string; 
  hunger: number; 
  level: number; 
  xp: number;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  maxLevel: number;
  effectPerLevel: number; 
  icon: string;
  type: 'money' | 'xp' | 'luck' | 'power' | 'auto' | 'discount';
}

export interface CraftingRecipe {
  id: string;
  name: string;
  desc: string;
  inputs: { itemName: string; count: number }[];
  output: { type: 'bait' | 'charm' | 'buff'; id: string; name: string; count: number };
}

export interface MysteryMerchant {
  active: boolean;
  expiry: number;
  items: { type: 'bait' | 'buff' | 'rod'; id: string | number; price: number; name: string }[];
}

export type RadioStation = 'off' | 'nature' | 'lofi';

export interface RestaurantState {
  ingredients: {
    vegetables: number; // Sebze
    meze: number; // Meze tabağı
    raki: number; // Rakı
    oil: number; // Yağ
  };
  reputation: number;
}

export interface Customer {
  id: number;
  name: string;
  order: 'grilled' | 'sandwich' | 'raki_table'; // Izgara, Ekmek Arası, Rakı Sofrası
  fishReq: { rarity: number; minWeight: number }; // Minimum requirements for fish
  patience: number;
  maxPatience: number;
  reward: number;
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
  autoNetLevel: number; 
  ownedCharms: string[]; 
  mapParts: number; 
  spinAvailable: number; 
  settings: {
      sortMode: 'recent' | 'value' | 'weight'; 
      bulkSellSafe: boolean; 
  };
  ownedPets: OwnedPet[]; 
  prestigeUpgrades: Record<string, number>; 
  radioStation?: RadioStation;
  restaurant?: RestaurantState;
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
