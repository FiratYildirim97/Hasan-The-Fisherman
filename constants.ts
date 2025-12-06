
import { Rod, Location, Bait, Skill, FishBase, ItemType, Bobber, Decoration, Achievement, Charm, PetBase, PrestigeUpgrade, CraftingRecipe } from './types';

export const PETS: PetBase[] = [
  { id: 'cat', name: 'Tekir Kedi', price: 5000, icon: '🐱', desc: 'Satışlardan %10 fazla para kazandırır.', bonusType: 'money', bonusValue: 0.10 },
  { id: 'pelican', name: 'Pelikan', price: 12000, icon: '🦢', desc: 'Seyahat masraflarını %20 azaltır.', bonusType: 'discount', bonusValue: 0.20 },
  { id: 'seal', name: 'Fok Balığı', price: 25000, icon: '🦭', desc: 'Balık yakalarken +%20 XP kazandırır.', bonusType: 'xp', bonusValue: 0.20 },
  { id: 'penguin', name: 'Penguen', price: 40000, icon: '🐧', desc: 'Nadir balık yakalama şansını %15 artırır.', bonusType: 'catch_rate', bonusValue: 0.15 }
];

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  { id: 'perm_money', name: 'Tüccar Ruhu', desc: 'Kalıcı Gelir Artışı', cost: 1, maxLevel: 50, effectPerLevel: 0.1, icon: '💰', type: 'money' },
  { id: 'perm_xp', name: 'Bilge Balıkçı', desc: 'Kalıcı XP Bonusu', cost: 1, maxLevel: 50, effectPerLevel: 0.1, icon: '📜', type: 'xp' },
  { id: 'perm_power', name: 'Titan Gücü', desc: 'Olta Gücü Artışı', cost: 3, maxLevel: 20, effectPerLevel: 0.1, icon: '💪', type: 'power' },
  { id: 'perm_luck', name: 'Deniz Şansı', desc: 'Nadir Balık Şansı', cost: 2, maxLevel: 20, effectPerLevel: 0.05, icon: '🍀', type: 'luck' },
  { id: 'perm_auto', name: 'Pasif Gelir', desc: 'Otomatik Ağ Verimi', cost: 2, maxLevel: 20, effectPerLevel: 0.2, icon: '⚙️', type: 'auto' },
  { id: 'perm_discount', name: 'Pazarlıkçı', desc: 'Market İndirimi', cost: 5, maxLevel: 10, effectPerLevel: 0.02, icon: '🏷️', type: 'discount' }
];

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { 
    id: 'craft_spoon', 
    name: 'Metal Kaşık Yem', 
    desc: 'Parlak ve dayanıklı bir yem.', 
    inputs: [{ itemName: 'Teneke', count: 2 }], 
    output: { type: 'bait', id: 'lure_spoon', name: 'Kaşık (Spoon)', count: 1 } 
  },
  { 
    id: 'craft_energy', 
    name: 'Enerji İçeceği', 
    desc: 'Kırık şişelerden geri dönüştürülmüş enerji.', 
    inputs: [{ itemName: 'Kırık Şişe', count: 3 }], 
    output: { type: 'buff', id: 'energy', name: 'Enerji İçeceği', count: 1 } 
  },
  { 
    id: 'craft_spinner', 
    name: 'Spinner Yem', 
    desc: 'Mekanik bir balık avcısı.', 
    inputs: [{ itemName: 'Teneke', count: 1 }, { itemName: 'Lastik', count: 1 }], 
    output: { type: 'bait', id: 'lure_spinner', name: 'Döner Kaşık', count: 1 } 
  },
  {
    id: 'craft_luck_charm',
    name: 'Yonca Tılsımı',
    desc: 'Doğanın şansı seninle olsun.',
    inputs: [{ itemName: 'Yosun', count: 5 }],
    output: { type: 'charm', id: 'clover', name: 'Dört Yapraklı Yonca', count: 1 } 
  }
];

export const CHARMS: Charm[] = [
  { id: 'turtle_shell', name: 'Kaplumbağa Kabuğu', desc: 'Misina gerilimi %20 daha yavaş artar.', price: 5000, icon: '🐢', effect: 'tension' },
  { id: 'clover', name: 'Dört Yapraklı Yonca', desc: 'Şansınızı %10 artırır.', price: 7500, icon: '🍀', effect: 'luck' },
  { id: 'magnet', name: 'Hazine Mıknatısı', desc: 'Hazine bulma şansı artar.', price: 10000, icon: '🧲', effect: 'gold' },
  { id: 'expert_book', name: 'Usta Kitabı', desc: 'Daha fazla XP kazanırsınız.', price: 12000, icon: '📘', effect: 'xp' },
  { id: 'bait_box', name: 'Sihirli Yem Kutusu', desc: '%20 ihtimalle yem harcanmaz.', price: 15000, icon: '🪱', effect: 'bait' },
  { id: 'auto_gear', name: 'Otomatik Dişli', desc: 'Otomatik ağ geliri %20 artar.', price: 20000, icon: '⚙️', effect: 'autonet' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_catch', title: 'İlk Adım', desc: 'İlk balığını tut', icon: '🎣', condition: (s) => s.totalCaught >= 1 },
  { id: 'novice', title: 'Acemi', desc: '50 balık tut', icon: '🥉', condition: (s) => s.totalCaught >= 50 },
  { id: 'master', title: 'Usta', desc: '500 balık tut', icon: '🥇', condition: (s) => s.totalCaught >= 500 },
  { id: 'rich', title: 'Zengin', desc: '100.000 TL kazan', icon: '💰', condition: (s) => s.totalMoneyEarned >= 100000 },
  { id: 'legend', title: 'Efsane', desc: '10 Efsanevi balık tut', icon: '👑', condition: (s) => s.legendariesCaught >= 10 },
  { id: 'shiny_hunter', title: 'Işıltılı', desc: 'Parlak bir balık tut', icon: '✨', condition: (s) => s.shinyCaught >= 1 },
  { id: 'gold_rusher', title: 'Altın Avcısı', desc: 'Altın balık tut', icon: '🏆', condition: (s) => s.goldenCaught >= 1 },
  { id: 'banker', title: 'Bankacı', desc: 'Bankada 50.000 TL biriktir', icon: '🏦', condition: (s, save) => (save?.stats.bankBalance || 0) >= 50000 },
  { id: 'mapper', title: 'Kaşif', desc: 'Hazine haritasını tamamla', icon: '🗺️', condition: (s, save) => (save?.mapParts || 0) >= 4 },
  { id: 'reborn', title: 'Yeniden Doğuş', desc: 'Prestij Yap (Rebirth)', icon: '🌀', condition: (s, save) => (save?.stats.prestigeLevel || 0) >= 1 }
];

export const SKILLS: Skill[] = [
  { id: 'luck', name: 'Şans', desc: 'Nadir balık ihtimali artar', max: 5, reqLvl: 2 },
  { id: 'haggle', name: 'Pazarlık', desc: '%10 daha pahalı satış', max: 5, reqLvl: 3 },
  { id: 'repair', name: 'Bakım', desc: 'Olta hasarını azaltır', max: 5, reqLvl: 5 },
  { id: 'biology', name: 'Biyoloji', desc: 'Daha büyük balıklar', max: 5, reqLvl: 8 },
  { id: 'patience', name: 'Sabır', desc: 'Gerilim daha yavaş artar', max: 5, reqLvl: 10 },
  { id: 'strength', name: 'Güç', desc: 'Balığı daha hızlı çekersin', max: 5, reqLvl: 12 },
  { id: 'cooking', name: 'Aşçılık', desc: 'Balık yerken daha çok HP', max: 5, reqLvl: 15 },
  { id: 'meteorology', name: 'Meteoroloji', desc: 'Yağmurda daha çok balık', max: 5, reqLvl: 18 },
  { id: 'recycling', name: 'Geri Dönüşüm', desc: 'Çöpten daha iyi ödül', max: 5, reqLvl: 20 },
  { id: 'charisma', name: 'Karizma', desc: 'Daha sık bahşiş alırsın', max: 5, reqLvl: 22 },
  { id: 'traveler', name: 'Gezgin', desc: 'Seyahat ücreti ucuzlar', max: 5, reqLvl: 25 },
  { id: 'nightowl', name: 'Gece Kuşu', desc: 'Gece avı bonusu artar', max: 5, reqLvl: 30 },
  { id: 'double_hook', name: 'Çift İğne', desc: '2 Balık tutma şansı', max: 5, reqLvl: 35 }
];

export const RODS: Rod[] = [
  { id: 0, name: "Söğüt Dalı", price: 0, maxHp: 10, power: 1.0, color: "#8b4513" },
  { id: 1, name: "Bambu Kamış", price: 300, maxHp: 18, power: 1.1, color: "#d4a373" },
  { id: 2, name: "Fiberglass Başlangıç", price: 800, maxHp: 25, power: 1.2, color: "#cbd5e1" },
  { id: 3, name: "Kompozit Hafif", price: 1500, maxHp: 32, power: 1.3, color: "#94a3b8" },
  { id: 4, name: "Göl Kamışı", price: 2500, maxHp: 40, power: 1.4, color: "#475569" },
  { id: 5, name: "Karbon Spin", price: 5000, maxHp: 50, power: 1.6, color: "#1e293b" },
  { id: 6, name: "Grafit Denge", price: 8000, maxHp: 60, power: 1.8, color: "#334155" },
  { id: 7, name: "Nehir Avcısı", price: 12000, maxHp: 70, power: 2.0, color: "#0f766e" },
  { id: 8, name: "Surf Casting V1", price: 16000, maxHp: 80, power: 2.2, color: "#f59e0b" },
  { id: 9, name: "Teleskopik Pro", price: 20000, maxHp: 90, power: 2.4, color: "#b91c1c" },
  { id: 10, name: "Tekne Pro", price: 30000, maxHp: 100, power: 2.7, color: "#dc2626" },
  { id: 11, name: "Ağır İş (Heavy Duty)", price: 40000, maxHp: 115, power: 3.0, color: "#7f1d1d" },
  { id: 12, name: "Kıyı Ustası", price: 55000, maxHp: 130, power: 3.3, color: "#0ea5e9" },
  { id: 13, name: "Turnuva Serisi", price: 75000, maxHp: 145, power: 3.6, color: "#2563eb" },
  { id: 14, name: "Jigging Master", price: 100000, maxHp: 160, power: 4.0, color: "#4f46e5" },
  { id: 15, name: "Titanyum Alaşım", price: 150000, maxHp: 180, power: 4.5, color: "#a855f7" },
  { id: 16, name: "Kevlar Örgü", price: 200000, maxHp: 200, power: 5.0, color: "#d946ef" },
  { id: 17, name: "Derin Deniz (Deep Sea)", price: 275000, maxHp: 220, power: 5.5, color: "#0f172a" },
  { id: 18, name: "Okyanus Hakimi", price: 350000, maxHp: 240, power: 6.0, color: "#1e1b4b" },
  { id: 19, name: "Big Game Hunter", price: 500000, maxHp: 260, power: 6.5, color: "#881337" },
  { id: 20, name: "Karbon-X", price: 750000, maxHp: 280, power: 7.2, color: "#111827" },
  { id: 21, name: "Mavi Marlin Özel", price: 1000000, maxHp: 300, power: 8.0, color: "#3b82f6" },
  { id: 22, name: "Kutup Yıldızı", price: 1300000, maxHp: 320, power: 8.8, color: "#e0f2fe" },
  { id: 23, name: "Abis Araştırmacısı", price: 1700000, maxHp: 340, power: 9.6, color: "#312e81" },
  { id: 24, name: "Efsanevi Usta", price: 2200000, maxHp: 360, power: 10.5, color: "#10b981" },
  { id: 25, name: "Neptün'ün Mızrağı", price: 3000000, maxHp: 400, power: 11.5, color: "#facc15" },
  { id: 26, name: "Kraken Terbiyecisi", price: 4000000, maxHp: 450, power: 12.5, color: "#7f1d1d" },
  { id: 27, name: "Altın Çağ", price: 5500000, maxHp: 500, power: 13.5, color: "#fbbf24" },
  { id: 28, name: "Kozmik Olta", price: 7500000, maxHp: 600, power: 15.0, color: "#8b5cf6" },
  { id: 29, name: "Sonsuzluk", price: 10000000, maxHp: 999, power: 20.0, color: "#ffffff" }
];

export const LOCATIONS: Location[] = [
  { id: 0, name: "Köy Deresi", price: 0, icon: "🌲", bgGradient: "", image: "", biome: 'freshwater' },
  { id: 1, name: "Sazlık Göl", price: 500, icon: "🦆", bgGradient: "", image: "", biome: 'freshwater' },
  { id: 2, name: "Dağ Eteği Gölü", price: 1500, icon: "⛰️", bgGradient: "", image: "", biome: 'freshwater' },
  { id: 3, name: "Büyük Nehir", price: 4000, icon: "🏞️", bgGradient: "", image: "", biome: 'freshwater' },
  { id: 4, name: "Amazon Nehri", price: 8000, icon: "🌴", bgGradient: "", image: "", biome: 'tropical' },
  { id: 5, name: "Nil Deltası", price: 12000, icon: "🐊", bgGradient: "", image: "", biome: 'freshwater' },
  { id: 6, name: "Mangrov Bataklığı", price: 18000, icon: "🌿", bgGradient: "", image: "", biome: 'tropical' },
  { id: 7, name: "Kayalık Sahil", price: 25000, icon: "🦀", bgGradient: "", image: "", biome: 'coastal' },
  { id: 8, name: "Ege Kıyıları", price: 35000, icon: "🏛️", bgGradient: "", image: "", biome: 'coastal' },
  { id: 9, name: "Fırtına Burnu", price: 50000, icon: "⛈️", bgGradient: "", image: "", biome: 'coastal' },
  { id: 10, name: "Balıkçı İskelesi", price: 70000, icon: "⚓", bgGradient: "", image: "", biome: 'coastal' },
  { id: 11, name: "Mercan Resifi", price: 100000, icon: "🐠", bgGradient: "", image: "", biome: 'tropical' },
  { id: 12, name: "Turkuaz Lagün", price: 140000, icon: "🏝️", bgGradient: "", image: "", biome: 'tropical' },
  { id: 13, name: "Batık Gemi", price: 190000, icon: "🏴‍☠️", bgGradient: "", image: "", biome: 'ocean' },
  { id: 14, name: "Büyük Set Resifi", price: 250000, icon: "🐚", bgGradient: "", image: "", biome: 'tropical' },
  { id: 15, name: "Norveç Fiyort", price: 320000, icon: "🏔️", bgGradient: "", image: "", biome: 'ice' },
  { id: 16, name: "Bering Denizi", price: 400000, icon: "🌊", bgGradient: "", image: "", biome: 'ocean' },
  { id: 17, name: "Buzul Gölü", price: 500000, icon: "🧊", bgGradient: "", image: "", biome: 'ice' },
  { id: 18, name: "Antarktika", price: 650000, icon: "🐧", bgGradient: "", image: "", biome: 'ice' },
  { id: 19, name: "Açık Okyanus", price: 800000, icon: "🛳️", bgGradient: "", image: "", biome: 'ocean' },
  { id: 20, name: "Pasifik Açıkları", price: 1000000, icon: "🌅", bgGradient: "", image: "", biome: 'ocean' },
  { id: 21, name: "Kelp Ormanı", price: 1250000, icon: "🌱", bgGradient: "", image: "", biome: 'ocean' },
  { id: 22, name: "Volkanik Ada", price: 1500000, icon: "🌋", bgGradient: "", image: "", biome: 'coastal' },
  { id: 23, name: "Derin Çukur", price: 2000000, icon: "🌑", bgGradient: "", image: "", biome: 'ocean' },
  { id: 24, name: "Gece Yarısı Bölgesi", price: 2500000, icon: "🔦", bgGradient: "", image: "", biome: 'ocean' },
  { id: 25, name: "Mariana Çukuru", price: 3200000, icon: "📉", bgGradient: "", image: "", biome: 'ocean' },
  { id: 26, name: "Abisal Düzlük", price: 4000000, icon: "🦑", bgGradient: "", image: "", biome: 'ocean' },
  { id: 27, name: "Kayıp Atlantis", price: 5000000, icon: "🔱", bgGradient: "", image: "", biome: 'tropical' },
  { id: 28, name: "Bermuda Şeytan Üçgeni", price: 7500000, icon: "⚠️", bgGradient: "", image: "", biome: 'ocean' },
  { id: 29, name: "Dünyanın Sonu", price: 10000000, icon: "🌍", bgGradient: "", image: "", biome: 'ice' }
];

export const BAITS: Bait[] = [
  { id: 'bread', name: 'Ekmek İçi', price: 15, bonus: 1.0 },
  { id: 'dough', name: 'Hamur Topu', price: 30, bonus: 1.1 },
  { id: 'worm', name: 'Solucan', price: 60, bonus: 1.2 },
  { id: 'maggot', name: 'Beyaz Kurt', price: 90, bonus: 1.25 },
  { id: 'corn', name: 'Mısır', price: 120, bonus: 1.3 },
  { id: 'cricket', name: 'Çekirge', price: 200, bonus: 1.4 },
  { id: 'leech', name: 'Sülük', price: 300, bonus: 1.5 },
  { id: 'shrimp', name: 'Karides', price: 500, bonus: 1.6 },
  { id: 'minnow', name: 'Küçük Balık', price: 750, bonus: 1.7 },
  { id: 'frog', name: 'Kurbağa', price: 1000, bonus: 1.8 },
  { id: 'lure_spoon', name: 'Kaşık (Spoon)', price: 1500, bonus: 2.0 },
  { id: 'lure_spinner', name: 'Döner Kaşık (Spinner)', price: 2000, bonus: 2.2 },
  { id: 'squid', name: 'Kalamar Parçası', price: 3000, bonus: 2.5 },
  { id: 'cutbait', name: 'Kesilmiş Balık', price: 4000, bonus: 2.7 },
  { id: 'live', name: 'Canlı Yem', price: 6000, bonus: 3.0 },
  { id: 'rapala', name: 'Rapala', price: 8000, bonus: 3.2 },
  { id: 'jig', name: 'Derin Su Jig', price: 12000, bonus: 3.5 },
  { id: 'popper', name: 'Su Üstü Popper', price: 15000, bonus: 3.8 },
  { id: 'fly', name: 'Yapay Sinek', price: 20000, bonus: 4.0 },
  { id: 'legendary_bait', name: 'Efsanevi Karışım', price: 50000, bonus: 5.0 }
];

export const BOBBERS: Bobber[] = [
  { id: 'basic', name: 'Standart', price: 0, icon: '🔴' },
  { id: 'cork', name: 'Mantar', price: 1000, icon: '🟤' },
  { id: 'quill', name: 'Tüy Kalem', price: 2000, icon: '🪶' },
  { id: 'pencil', name: 'Kalem Şamandıra', price: 3500, icon: '✏️' },
  { id: 'duck', name: 'Ördek', price: 5000, icon: '🦆' },
  { id: 'bubble', name: 'Şeffaf Balon', price: 7500, icon: '⚪' },
  { id: 'light', name: 'Işıklı (Gece)', price: 10000, icon: '💡' },
  { id: 'star', name: 'Yıldız', price: 15000, icon: '⭐' },
  { id: 'skull', name: 'Kuru Kafa', price: 25000, icon: '💀' },
  { id: 'flower', name: 'Nilüfer', price: 35000, icon: '🌸' },
  { id: 'drone', name: 'Mini Drone', price: 50000, icon: '🛸' },
  { id: 'diamond', name: 'Elmas', price: 100000, icon: '💎' }
];

export const DECORATIONS: Decoration[] = [
  { id: 'weed', name: 'Yosun', price: 500, emoji: '🌿' },
  { id: 'rock', name: 'Kaya', price: 1000, emoji: '🪨' },
  { id: 'shell', name: 'Deniz Kabuğu', price: 1500, emoji: '🐚' },
  { id: 'wood', name: 'Batık Kütük', price: 2000, emoji: '🪵' },
  { id: 'anchor', name: 'Çapa', price: 2500, emoji: '⚓' },
  { id: 'pot', name: 'Antik Çömlek', price: 3500, emoji: '🏺' },
  { id: 'coral', name: 'Mercan Dalı', price: 4500, emoji: '🪸' },
  { id: 'chest', name: 'Hazine', price: 5000, emoji: '💎' },
  { id: 'helm', name: 'Dümen', price: 7500, emoji: '☸️' },
  { id: 'castle', name: 'Kale', price: 10000, emoji: '🏰' },
  { id: 'statue', name: 'Moai Heykeli', price: 15000, emoji: '🗿' },
  { id: 'volcano', name: 'Mini Yanardağ', price: 25000, emoji: '🌋' },
  { id: 'sub', name: 'Oyuncak Denizaltı', price: 40000, emoji: '🚤' },
  { id: 'diver', name: 'Dalgıç Başlığı', price: 60000, emoji: '🤿' },
  { id: 'ufo', name: 'Batık UFO', price: 100000, emoji: '🛸' }
];

export const FISH_DB: Record<number, FishBase[]> = {
  0: [
    { name: "Eski Çizme", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "👢", visual: { shape: 'boot', bodyColor: '#5c4033', finColor: '#3e2723', pattern: 'none' } },
    { name: "Kırık Dal", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🪵", visual: { shape: 'long', bodyColor: '#5c4033', finColor: '#3e2723', pattern: 'none' } },
    { name: "Teneke", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🥫", visual: { shape: 'can', bodyColor: '#9ca3af', finColor: '#ef4444', pattern: 'none' } },
    { name: "Dere Sazanı", type: ItemType.FISH, value: 15, rarity: 1, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#84cc16', finColor: '#65a30d', pattern: 'spots', detailColor: '#365314' } },
    { name: "Gümüş Balığı", type: ItemType.FISH, value: 10, rarity: 1, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#e2e8f0', finColor: '#cbd5e1', pattern: 'shiny' } },
    { name: "Kızılkanat", type: ItemType.FISH, value: 25, rarity: 2, emoji: "🐠", visual: { shape: 'carp', bodyColor: '#fca5a5', finColor: '#ef4444', pattern: 'stripes' } },
    { name: "Kefal", type: ItemType.FISH, value: 35, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#94a3b8', finColor: '#64748b', pattern: 'none' } },
    { name: "Dere Alası", type: ItemType.FISH, value: 60, rarity: 4, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#14b8a6', finColor: '#0f766e', pattern: 'spots', detailColor: '#042f2e' } },
    { name: "Altın Yüzük", type: ItemType.TREASURE, value: 250, rarity: 5, emoji: "💍", visual: { shape: 'ring', bodyColor: '#fbbf24', finColor: '#f59e0b', pattern: 'shiny' } }
  ],
  1: [
    { name: "Yosun", type: ItemType.JUNK, value: 5, rarity: 1, emoji: "🌿", visual: { shape: 'blob', bodyColor: '#15803d', finColor: '#166534', pattern: 'none' } },
    { name: "Lastik", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "⚫", visual: { shape: 'ring', bodyColor: '#1f2937', finColor: '#111827', pattern: 'none' } },
    { name: "Kırık Şişe", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🍾", visual: { shape: 'can', bodyColor: '#10b981', finColor: '#059669', pattern: 'none' } },
    { name: "Kerevit", type: ItemType.FISH, value: 40, rarity: 2, emoji: "🦞", visual: { shape: 'crab', bodyColor: '#b91c1c', finColor: '#7f1d1d', pattern: 'none' } },
    { name: "Turna", type: ItemType.FISH, value: 70, rarity: 2, emoji: "🦈", visual: { shape: 'long', bodyColor: '#4d7c0f', finColor: '#365314', pattern: 'stripes' } },
    { name: "Sudak", type: ItemType.FISH, value: 80, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#57534e', finColor: '#44403c', pattern: 'stripes' } },
    { name: "Kadife", type: ItemType.FISH, value: 90, rarity: 3, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#eab308', finColor: '#ca8a04', pattern: 'none' } },
    { name: "Yayın Balığı", type: ItemType.FISH, value: 180, rarity: 4, emoji: "🐋", visual: { shape: 'catfish', bodyColor: '#374151', finColor: '#1f2937', pattern: 'none' } },
    { name: "Göl Canavarı", type: ItemType.FISH, value: 1000, rarity: 5, emoji: "🐉", visual: { shape: 'long', bodyColor: '#064e3b', finColor: '#022c22', pattern: 'stripes', detailColor: '#10b981' }, isBoss: true },
    { name: "Kırmızı Balık", type: ItemType.FISH, value: 5000, rarity: 6, emoji: "🔴", visual: { shape: 'trout', bodyColor: '#dc2626', finColor: '#991b1b', pattern: 'shiny' } }
  ],
  2: [
    { name: "Plastik", type: ItemType.JUNK, value: 10, rarity: 1, emoji: "🥤", visual: { shape: 'can', bodyColor: '#ef4444', finColor: '#fff', pattern: 'none' } },
    { name: "Dağ Alası", type: ItemType.FISH, value: 80, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#a3e635', finColor: '#65a30d', pattern: 'spots' } },
    { name: "Kaya Balığı", type: ItemType.FISH, value: 60, rarity: 2, emoji: "🐟", visual: { shape: 'round', bodyColor: '#78350f', finColor: '#451a03', pattern: 'none' } },
    { name: "Gökkuşağı Alabalığı", type: ItemType.FISH, value: 150, rarity: 3, emoji: "🌈", visual: { shape: 'trout', bodyColor: '#818cf8', finColor: '#c084fc', pattern: 'stripes', detailColor: '#f472b6' } },
    { name: "Altın Alabalık", type: ItemType.FISH, value: 400, rarity: 4, emoji: "✨", visual: { shape: 'trout', bodyColor: '#facc15', finColor: '#eab308', pattern: 'shiny' } },
    { name: "Antik Sikke", type: ItemType.TREASURE, value: 900, rarity: 5, emoji: "🪙", visual: { shape: 'coin', bodyColor: '#d4af37', finColor: '#b45309', pattern: 'none' } }
  ],
  3: [
    { name: "Kayıp Gözlük", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🕶️", visual: { shape: 'ring', bodyColor: '#171717', finColor: '#000', pattern: 'none' } },
    { name: "Büyük Levrek", type: ItemType.FISH, value: 100, rarity: 2, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#84cc16', finColor: '#4d7c0f', pattern: 'stripes' } },
    { name: "Mavi Yengeç", type: ItemType.FISH, value: 120, rarity: 2, emoji: "🦀", visual: { shape: 'crab', bodyColor: '#60a5fa', finColor: '#2563eb', pattern: 'none' } },
    { name: "Somon", type: ItemType.FISH, value: 250, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#fda4af', finColor: '#e11d48', pattern: 'none' } },
    { name: "Mersin Balığı", type: ItemType.FISH, value: 450, rarity: 4, emoji: "🦈", visual: { shape: 'shark', bodyColor: '#57534e', finColor: '#44403c', pattern: 'none' } },
    { name: "Dev Nehir Turnası", type: ItemType.FISH, value: 700, rarity: 5, emoji: "🐊", visual: { shape: 'long', bodyColor: '#3f6212', finColor: '#1a2e05', pattern: 'stripes' } }
  ],
  4: [
    { name: "Çamur Topu", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🟤", visual: { shape: 'round', bodyColor: '#78350f', finColor: '#451a03', pattern: 'none' } },
    { name: "Pirana", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🦷", visual: { shape: 'round', bodyColor: '#7f1d1d', finColor: '#ef4444', pattern: 'spots' } },
    { name: "Diskus", type: ItemType.FISH, value: 400, rarity: 3, emoji: "🐠", visual: { shape: 'round', bodyColor: '#f97316', finColor: '#22d3ee', pattern: 'stripes' } },
    { name: "Tavuskuşu Levreği", type: ItemType.FISH, value: 500, rarity: 3, emoji: "🦚", visual: { shape: 'carp', bodyColor: '#16a34a', finColor: '#dc2626', pattern: 'stripes' } },
    { name: "Elektrikli Yılanbalığı", type: ItemType.FISH, value: 900, rarity: 4, emoji: "⚡", visual: { shape: 'eel', bodyColor: '#4b5563', finColor: '#eab308', pattern: 'shiny' } },
    { name: "Arowana", type: ItemType.FISH, value: 1500, rarity: 4, emoji: "🐉", visual: { shape: 'long', bodyColor: '#c2410c', finColor: '#7c2d12', pattern: 'shiny' } },
    { name: "Arapaima", type: ItemType.FISH, value: 3500, rarity: 5, emoji: "🐊", visual: { shape: 'long', bodyColor: '#713f12', finColor: '#a16207', pattern: 'stripes' } }
  ],
  5: [
    { name: "Papirüs", type: ItemType.JUNK, value: 10, rarity: 1, emoji: "📜", visual: { shape: 'can', bodyColor: '#fef08a', finColor: '#eab308', pattern: 'none' } },
    { name: "Nil Levreği", type: ItemType.FISH, value: 600, rarity: 3, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#a8a29e', finColor: '#57534e', pattern: 'none' } },
    { name: "Kaplan Balığı", type: ItemType.FISH, value: 800, rarity: 4, emoji: "🐯", visual: { shape: 'trout', bodyColor: '#ea580c', finColor: '#000', pattern: 'stripes' } },
    { name: "Vatoz", type: ItemType.FISH, value: 400, rarity: 3, emoji: "🪁", visual: { shape: 'round', bodyColor: '#78716c', finColor: '#44403c', pattern: 'spots' } },
    { name: "Firavun'un Kolyesi", type: ItemType.TREASURE, value: 5000, rarity: 5, emoji: "📿", visual: { shape: 'ring', bodyColor: '#fbbf24', finColor: '#0ea5e9', pattern: 'none' } }
  ],
  6: [
    { name: "Kök Parçası", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🪵", visual: { shape: 'long', bodyColor: '#3f2c22', finColor: '#281d16', pattern: 'none' } },
    { name: "Çamur Zıpzıpı", type: ItemType.FISH, value: 200, rarity: 2, emoji: "🐸", visual: { shape: 'catfish', bodyColor: '#57534e', finColor: '#292524', pattern: 'spots' } },
    { name: "Okçu Balığı", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🏹", visual: { shape: 'trout', bodyColor: '#e5e5e5', finColor: '#171717', pattern: 'stripes' } },
    { name: "Barramundi", type: ItemType.FISH, value: 700, rarity: 4, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#d4d4d8', finColor: '#a1a1aa', pattern: 'none' } },
    { name: "Bataklık Canavarı", type: ItemType.FISH, value: 2000, rarity: 5, emoji: "🧟", visual: { shape: 'catfish', bodyColor: '#14532d', finColor: '#052e16', pattern: 'spots' }, isBoss: true }
  ],
  7: [
    { name: "Balık Ağı", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🕸️", visual: { shape: 'blob', bodyColor: '#475569', finColor: '#334155', pattern: 'none' } },
    { name: "İstavrit", type: ItemType.FISH, value: 35, rarity: 1, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#bae6fd', finColor: '#38bdf8', pattern: 'none' } },
    { name: "Mezgit", type: ItemType.FISH, value: 50, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#cbd5e1', finColor: '#94a3b8', pattern: 'spots' } },
    { name: "Levrek", type: ItemType.FISH, value: 120, rarity: 3, emoji: "🐠", visual: { shape: 'carp', bodyColor: '#94a3b8', finColor: '#475569', pattern: 'stripes' } },
    { name: "Çipura", type: ItemType.FISH, value: 150, rarity: 3, emoji: "🐟", visual: { shape: 'round', bodyColor: '#e2e8f0', finColor: '#64748b', pattern: 'shiny' } },
    { name: "Ahtapot", type: ItemType.FISH, value: 400, rarity: 4, emoji: "🐙", visual: { shape: 'squid', bodyColor: '#be123c', finColor: '#881337', pattern: 'spots' } }
  ],
  8: [
    { name: "Kırık Amfora", type: ItemType.JUNK, value: 50, rarity: 2, emoji: "🏺", visual: { shape: 'can', bodyColor: '#c2410c', finColor: '#7c2d12', pattern: 'none' } },
    { name: "Sardalya", type: ItemType.FISH, value: 30, rarity: 1, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#93c5fd', finColor: '#3b82f6', pattern: 'none' } },
    { name: "Barbunya", type: ItemType.FISH, value: 100, rarity: 2, emoji: "🐠", visual: { shape: 'carp', bodyColor: '#f87171', finColor: '#ef4444', pattern: 'spots' } },
    { name: "Kalamar", type: ItemType.FISH, value: 250, rarity: 3, emoji: "🦑", visual: { shape: 'squid', bodyColor: '#fca5a5', finColor: '#e11d48', pattern: 'none' } },
    { name: "Orfoz", type: ItemType.FISH, value: 600, rarity: 4, emoji: "🐟", visual: { shape: 'round', bodyColor: '#57534e', finColor: '#292524', pattern: 'spots' } },
    { name: "Akdeniz Foku", type: ItemType.FISH, value: 5000, rarity: 6, emoji: "🦭", visual: { shape: 'blob', bodyColor: '#4b5563', finColor: '#1f2937', pattern: 'none' } } 
  ],
  9: [
    { name: "Eski Halat", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🪢", visual: { shape: 'long', bodyColor: '#a16207', finColor: '#713f12', pattern: 'stripes' } },
    { name: "Uskumru", type: ItemType.FISH, value: 50, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#2563eb', finColor: '#1e3a8a', pattern: 'stripes' } },
    { name: "Lüfer", type: ItemType.FISH, value: 200, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#60a5fa', finColor: '#1d4ed8', pattern: 'none' } },
    { name: "Kofana", type: ItemType.FISH, value: 500, rarity: 4, emoji: "🦈", visual: { shape: 'trout', bodyColor: '#1e40af', finColor: '#172554', pattern: 'none' } },
    { name: "Yelken Balığı", type: ItemType.FISH, value: 1500, rarity: 5, emoji: "🗡️", visual: { shape: 'swordfish', bodyColor: '#312e81', finColor: '#4338ca', pattern: 'stripes' } }
  ],
  10: [
    { name: "Boş Kutu", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "📦", visual: { shape: 'can', bodyColor: '#d1d5db', finColor: '#9ca3af', pattern: 'none' } },
    { name: "Kefal", type: ItemType.FISH, value: 35, rarity: 1, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#94a3b8', finColor: '#64748b', pattern: 'none' } },
    { name: "Zargana", type: ItemType.FISH, value: 150, rarity: 2, emoji: "🥢", visual: { shape: 'eel', bodyColor: '#bae6fd', finColor: '#0ea5e9', pattern: 'none' } },
    { name: "Palamut", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#64748b', finColor: '#334155', pattern: 'stripes' } },
    { name: "Torik", type: ItemType.FISH, value: 600, rarity: 4, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#475569', finColor: '#1e293b', pattern: 'none' } }
  ],
  11: [
    { name: "Ölü Mercan", type: ItemType.JUNK, value: 10, rarity: 1, emoji: "🪸", visual: { shape: 'blob', bodyColor: '#fca5a5', finColor: '#fee2e2', pattern: 'none' } },
    { name: "Palyaço Balığı", type: ItemType.FISH, value: 200, rarity: 2, emoji: "🐠", visual: { shape: 'round', bodyColor: '#f97316', finColor: '#fff', pattern: 'stripes', detailColor: '#000' } },
    { name: "Mavi Cerrah", type: ItemType.FISH, value: 220, rarity: 2, emoji: "🐟", visual: { shape: 'round', bodyColor: '#2563eb', finColor: '#fbbf24', pattern: 'none' } },
    { name: "Melek Balığı", type: ItemType.FISH, value: 300, rarity: 3, emoji: "👼", visual: { shape: 'round', bodyColor: '#facc15', finColor: '#3b82f6', pattern: 'stripes' } },
    { name: "Papağan Balığı", type: ItemType.FISH, value: 350, rarity: 3, emoji: "🦜", visual: { shape: 'carp', bodyColor: '#ec4899', finColor: '#06b6d4', pattern: 'spots' } },
    { name: "Müren", type: ItemType.FISH, value: 450, rarity: 4, emoji: "🐍", visual: { shape: 'eel', bodyColor: '#a3e635', finColor: '#3f6212', pattern: 'spots' } },
    { name: "İnci", type: ItemType.TREASURE, value: 2000, rarity: 5, emoji: "⚪", visual: { shape: 'round', bodyColor: '#f8fafc', finColor: '#f1f5f9', pattern: 'shiny' } }
  ],
  12: [
    { name: "Hindistan Cevizi", type: ItemType.JUNK, value: 5, rarity: 1, emoji: "🥥", visual: { shape: 'round', bodyColor: '#78350f', finColor: '#fff', pattern: 'none' } },
    { name: "Kelebek Balığı", type: ItemType.FISH, value: 250, rarity: 2, emoji: "🦋", visual: { shape: 'round', bodyColor: '#fde047', finColor: '#000', pattern: 'stripes' } },
    { name: "Denizatı", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🐎", visual: { shape: 'long', bodyColor: '#fcd34d', finColor: '#f59e0b', pattern: 'spots' } },
    { name: "Aslan Balığı", type: ItemType.FISH, value: 400, rarity: 3, emoji: "🦁", visual: { shape: 'round', bodyColor: '#7f1d1d', finColor: '#fecaca', pattern: 'stripes' } },
    { name: "Barakuda", type: ItemType.FISH, value: 800, rarity: 4, emoji: "🦷", visual: { shape: 'long', bodyColor: '#94a3b8', finColor: '#cbd5e1', pattern: 'spots' } },
    { name: "Dev Vatoz", type: ItemType.FISH, value: 1200, rarity: 5, emoji: "🛸", visual: { shape: 'round', bodyColor: '#374151', finColor: '#1f2937', pattern: 'none' } }
  ],
  13: [
    { name: "Paslı Çivi", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🔩", visual: { shape: 'long', bodyColor: '#7f1d1d', finColor: '#450a0a', pattern: 'none' } },
    { name: "Grup Balığı", type: ItemType.FISH, value: 500, rarity: 3, emoji: "🐟", visual: { shape: 'round', bodyColor: '#57534e', finColor: '#292524', pattern: 'spots' } },
    { name: "İskorpit", type: ItemType.FISH, value: 400, rarity: 3, emoji: "🦂", visual: { shape: 'round', bodyColor: '#b91c1c', finColor: '#991b1b', pattern: 'none' } },
    { name: "Mığrı", type: ItemType.FISH, value: 1000, rarity: 4, emoji: "🐍", visual: { shape: 'eel', bodyColor: '#71717a', finColor: '#3f3f46', pattern: 'none' } },
    { name: "Köpekbalığı", type: ItemType.FISH, value: 1500, rarity: 5, emoji: "🦈", visual: { shape: 'shark', bodyColor: '#64748b', finColor: '#475569', pattern: 'none' } },
    { name: "Kaptan'ın Kancası", type: ItemType.TREASURE, value: 3000, rarity: 5, emoji: "🪝", visual: { shape: 'long', bodyColor: '#d4d4d4', finColor: '#737373', pattern: 'shiny' } }
  ],
  14: [
    { name: "Kırık Gözlük", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🥽", visual: { shape: 'round', bodyColor: '#000', finColor: '#22d3ee', pattern: 'none' } },
    { name: "Mandalina Balığı", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🐠", visual: { shape: 'carp', bodyColor: '#3b82f6', finColor: '#f97316', pattern: 'stripes' } },
    { name: "Napolyon Balığı", type: ItemType.FISH, value: 1000, rarity: 4, emoji: "🤴", visual: { shape: 'round', bodyColor: '#06b6d4', finColor: '#164e63', pattern: 'spots' } },
    { name: "Çekiçbaşlı Köpekbalığı", type: ItemType.FISH, value: 2500, rarity: 5, emoji: "🔨", visual: { shape: 'shark', bodyColor: '#94a3b8', finColor: '#64748b', pattern: 'none' } }
  ],
  15: [
    { name: "Viking Miğferi", type: ItemType.TREASURE, value: 5000, rarity: 5, emoji: "🪖", visual: { shape: 'blob', bodyColor: '#94a3b8', finColor: '#f59e0b', pattern: 'none' } },
    { name: "Ringa", type: ItemType.FISH, value: 100, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#cbd5e1', finColor: '#94a3b8', pattern: 'shiny' } },
    { name: "Uskumru", type: ItemType.FISH, value: 150, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#3b82f6', finColor: '#1d4ed8', pattern: 'stripes' } },
    { name: "Morina", type: ItemType.FISH, value: 500, rarity: 3, emoji: "🐟", visual: { shape: 'catfish', bodyColor: '#57534e', finColor: '#44403c', pattern: 'spots' } },
    { name: "Kalkan", type: ItemType.FISH, value: 600, rarity: 3, emoji: "🐡", visual: { shape: 'round', bodyColor: '#57534e', finColor: '#44403c', pattern: 'spots' } },
    { name: "Atlantik Somonu", type: ItemType.FISH, value: 900, rarity: 4, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#e11d48', finColor: '#881337', pattern: 'none' } }
  ],
  16: [
    { name: "Eski Tuzak", type: ItemType.JUNK, value: 20, rarity: 1, emoji: "🪤", visual: { shape: 'can', bodyColor: '#78350f', finColor: '#451a03', pattern: 'stripes' } },
    { name: "Alaska Mezgit", type: ItemType.FISH, value: 400, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#9ca3af', finColor: '#4b5563', pattern: 'none' } },
    { name: "Kral Yengeç", type: ItemType.FISH, value: 1800, rarity: 5, emoji: "🦀", visual: { shape: 'crab', bodyColor: '#b91c1c', finColor: '#7f1d1d', pattern: 'spots' } },
    { name: "Kar Yengeci", type: ItemType.FISH, value: 1200, rarity: 4, emoji: "🦀", visual: { shape: 'crab', bodyColor: '#fdba74', finColor: '#ea580c', pattern: 'none' } },
    { name: "Halibut", type: ItemType.FISH, value: 2500, rarity: 5, emoji: "🥘", visual: { shape: 'round', bodyColor: '#4b5563', finColor: '#1f2937', pattern: 'none' } }
  ],
  17: [
    { name: "Buz Parçası", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🧊", visual: { shape: 'blob', bodyColor: '#e0f2fe', finColor: '#fff', pattern: 'none' } },
    { name: "Kutup Alabalığı", type: ItemType.FISH, value: 300, rarity: 3, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#bae6fd', finColor: '#0ea5e9', pattern: 'spots' } },
    { name: "Beyaz Balık", type: ItemType.FISH, value: 200, rarity: 2, emoji: "🐟", visual: { shape: 'trout', bodyColor: '#f1f5f9', finColor: '#cbd5e1', pattern: 'none' } },
    { name: "Donmuş Hazine", type: ItemType.TREASURE, value: 4000, rarity: 5, emoji: "💎", visual: { shape: 'ring', bodyColor: '#60a5fa', finColor: '#2563eb', pattern: 'shiny' } }
  ],
  18: [
    { name: "Penguen Oyuncağı", type: ItemType.JUNK, value: 20, rarity: 1, emoji: "🐧", visual: { shape: 'boot', bodyColor: '#111827', finColor: '#f3f4f6', pattern: 'none' } },
    { name: "Krill Sürüsü", type: ItemType.FISH, value: 150, rarity: 2, emoji: "🦐", visual: { shape: 'trout', bodyColor: '#fca5a5', finColor: '#f87171', pattern: 'none' } },
    { name: "Buzul Balığı (Icefish)", type: ItemType.FISH, value: 1200, rarity: 3, emoji: "❄️", visual: { shape: 'trout', bodyColor: '#e0f2fe', finColor: '#bae6fd', pattern: 'shiny' } },
    { name: "Dişbalığı", type: ItemType.FISH, value: 2000, rarity: 4, emoji: "🐟", visual: { shape: 'catfish', bodyColor: '#334155', finColor: '#1e293b', pattern: 'none' } },
    { name: "Dev Balina", type: ItemType.FISH, value: 10000, rarity: 5, emoji: "🐳", visual: { shape: 'whale', bodyColor: '#1e40af', finColor: '#1e3a8a', pattern: 'none' } },
    { name: "Antik Kalıntı", type: ItemType.TREASURE, value: 30000, rarity: 5, emoji: "🏺", visual: { shape: 'can', bodyColor: '#78350f', finColor: '#92400e', pattern: 'none' } }
  ],
  19: [
    { name: "Plastik Poşet", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🛍️", visual: { shape: 'blob', bodyColor: '#f1f5f9', finColor: '#cbd5e1', pattern: 'none' } },
    { name: "Uçan Balık", type: ItemType.FISH, value: 600, rarity: 3, emoji: "🐦", visual: { shape: 'trout', bodyColor: '#7dd3fc', finColor: '#0ea5e9', pattern: 'none' } },
    { name: "Mahi Mahi", type: ItemType.FISH, value: 900, rarity: 4, emoji: "🐠", visual: { shape: 'carp', bodyColor: '#facc15', finColor: '#16a34a', pattern: 'none' } },
    { name: "Orkinos", type: ItemType.FISH, value: 1200, rarity: 4, emoji: "🐟", visual: { shape: 'shark', bodyColor: '#1e3a8a', finColor: '#172554', pattern: 'none' } },
    { name: "Kılıç Balığı", type: ItemType.FISH, value: 2000, rarity: 5, emoji: "🗡️", visual: { shape: 'swordfish', bodyColor: '#64748b', finColor: '#334155', pattern: 'shiny' } }
  ],
  20: [
    { name: "Şamandıra Parçası", type: ItemType.JUNK, value: 50, rarity: 1, emoji: "⭕", visual: { shape: 'ring', bodyColor: '#ef4444', finColor: '#fff', pattern: 'stripes' } },
    { name: "Sarı Yüzgeçli Orkinos", type: ItemType.FISH, value: 1500, rarity: 4, emoji: "🐟", visual: { shape: 'shark', bodyColor: '#1e3a8a', finColor: '#facc15', pattern: 'none' } },
    { name: "Wahoo", type: ItemType.FISH, value: 1800, rarity: 4, emoji: "🐟", visual: { shape: 'swordfish', bodyColor: '#3b82f6', finColor: '#1d4ed8', pattern: 'stripes' } },
    { name: "Marlin", type: ItemType.FISH, value: 3500, rarity: 5, emoji: "🦈", visual: { shape: 'swordfish', bodyColor: '#1e3a8a', finColor: '#60a5fa', pattern: 'stripes' } },
    { name: "Büyük Beyaz Köpekbalığı", type: ItemType.FISH, value: 5000, rarity: 6, emoji: "🦈", visual: { shape: 'shark', bodyColor: '#94a3b8', finColor: '#cbd5e1', pattern: 'none' }, isBoss: true }
  ],
  21: [
    { name: "Dev Yosun", type: ItemType.JUNK, value: 20, rarity: 1, emoji: "🌿", visual: { shape: 'long', bodyColor: '#3f6212', finColor: '#1a2e05', pattern: 'none' } },
    { name: "Deniz Samuru (Gözlem)", type: ItemType.FISH, value: 0, rarity: 2, emoji: "🦦", visual: { shape: 'blob', bodyColor: '#78350f', finColor: '#451a03', pattern: 'none' } }, 
    { name: "Garibaldi", type: ItemType.FISH, value: 400, rarity: 3, emoji: "🟧", visual: { shape: 'round', bodyColor: '#f97316', finColor: '#ea580c', pattern: 'none' } },
    { name: "Leopar Köpekbalığı", type: ItemType.FISH, value: 1200, rarity: 4, emoji: "🦈", visual: { shape: 'shark', bodyColor: '#a8a29e', finColor: '#292524', pattern: 'spots' } },
    { name: "Deniz Kulağı (Abalone)", type: ItemType.TREASURE, value: 1500, rarity: 4, emoji: "🐚", visual: { shape: 'round', bodyColor: '#1e293b', finColor: '#3b82f6', pattern: 'shiny' } }
  ],
  22: [
    { name: "Ponza Taşı", type: ItemType.JUNK, value: 10, rarity: 1, emoji: "🪨", visual: { shape: 'round', bodyColor: '#57534e', finColor: '#292524', pattern: 'spots' } },
    { name: "Siyah Cerrah", type: ItemType.FISH, value: 500, rarity: 3, emoji: "🐟", visual: { shape: 'round', bodyColor: '#171717', finColor: '#dc2626', pattern: 'none' } },
    { name: "Lav Balığı", type: ItemType.FISH, value: 1500, rarity: 4, emoji: "🔥", visual: { shape: 'trout', bodyColor: '#ef4444', finColor: '#7f1d1d', pattern: 'shiny' } },
    { name: "Dev Trevally", type: ItemType.FISH, value: 2500, rarity: 5, emoji: "🐟", visual: { shape: 'carp', bodyColor: '#94a3b8', finColor: '#64748b', pattern: 'none' } },
    { name: "Obsidyen Hançer", type: ItemType.TREASURE, value: 8000, rarity: 5, emoji: "🗡️", visual: { shape: 'long', bodyColor: '#000', finColor: '#333', pattern: 'shiny' } }
  ],
  23: [
    { name: "Paslı Metal", type: ItemType.JUNK, value: 50, rarity: 1, emoji: "🔩", visual: { shape: 'can', bodyColor: '#78350f', finColor: '#451a03', pattern: 'none' } },
    { name: "Blobfish", type: ItemType.FISH, value: 800, rarity: 3, emoji: "🥴", visual: { shape: 'blob', bodyColor: '#fbcfe8', finColor: '#f472b6', pattern: 'none' } },
    { name: "Engerek Balığı", type: ItemType.FISH, value: 900, rarity: 4, emoji: "🐍", visual: { shape: 'long', bodyColor: '#171717', finColor: '#dc2626', pattern: 'spots' } },
    { name: "Fener Balığı", type: ItemType.FISH, value: 2500, rarity: 4, emoji: "🔦", visual: { shape: 'angler', bodyColor: '#451a03', finColor: '#78350f', pattern: 'shiny' } },
    { name: "Hazine Sandığı", type: ItemType.TREASURE, value: 15000, rarity: 5, emoji: "💎", visual: { shape: 'coin', bodyColor: '#0ea5e9', finColor: '#0284c7', pattern: 'shiny' } }
  ],
  24: [
    { name: "Hayalet Balık", type: ItemType.FISH, value: 3000, rarity: 5, emoji: "👻", visual: { shape: 'blob', bodyColor: '#cbd5e1', finColor: '#94a3b8', pattern: 'none' } },
    { name: "Pelikan Yılanbalığı", type: ItemType.FISH, value: 4000, rarity: 5, emoji: "🐍", visual: { shape: 'eel', bodyColor: '#000', finColor: '#333', pattern: 'none' } },
    { name: "Vampir Kalamar", type: ItemType.FISH, value: 5000, rarity: 5, emoji: "🧛", visual: { shape: 'squid', bodyColor: '#7f1d1d', finColor: '#fff', pattern: 'spots' } },
    { name: "Biyolüminesans Denizanası", type: ItemType.FISH, value: 6000, rarity: 6, emoji: "🎐", visual: { shape: 'blob', bodyColor: '#06b6d4', finColor: '#a855f7', pattern: 'shiny' } }
  ],
  25: [
    { name: "Radyoaktif Varil", type: ItemType.JUNK, value: 50, rarity: 2, emoji: "🛢️", visual: { shape: 'can', bodyColor: '#fbbf24', finColor: '#000000', pattern: 'none' } },
    { name: "Dumbo Ahtapot", type: ItemType.FISH, value: 4500, rarity: 5, emoji: "🐙", visual: { shape: 'squid', bodyColor: '#fef08a', finColor: '#facc15', pattern: 'none' } },
    { name: "Goblin Köpekbalığı", type: ItemType.FISH, value: 8000, rarity: 6, emoji: "👺", visual: { shape: 'shark', bodyColor: '#fca5a5', finColor: '#f87171', pattern: 'none' } },
    { name: "Megalodon Dişi", type: ItemType.TREASURE, value: 25000, rarity: 6, emoji: "🦷", visual: { shape: 'round', bodyColor: '#1c1917', finColor: '#000', pattern: 'shiny' } }
  ],
  26: [
    { name: "Deniz Hıyarı", type: ItemType.FISH, value: 2000, rarity: 4, emoji: "🥒", visual: { shape: 'long', bodyColor: '#a3e635', finColor: '#3f6212', pattern: 'spots' } },
    { name: "Tripod Balığı", type: ItemType.FISH, value: 3500, rarity: 5, emoji: "🔭", visual: { shape: 'long', bodyColor: '#9ca3af', finColor: '#4b5563', pattern: 'none' } },
    { name: "Dev Kalamar", type: ItemType.FISH, value: 10000, rarity: 6, emoji: "🦑", visual: { shape: 'squid', bodyColor: '#7f1d1d', finColor: '#450a0a', pattern: 'spots' } },
    { name: "Siyah İnci", type: ItemType.TREASURE, value: 50000, rarity: 6, emoji: "⚫", visual: { shape: 'round', bodyColor: '#000', finColor: '#333', pattern: 'shiny' } },
    { name: "Kraken", type: ItemType.FISH, value: 100000, rarity: 7, emoji: "🦑", visual: { shape: 'squid', bodyColor: '#4c1d95', finColor: '#be185d', pattern: 'shiny' }, isBoss: true }
  ],
  27: [
    { name: "Antik Tablet", type: ItemType.JUNK, value: 500, rarity: 3, emoji: "🗿", visual: { shape: 'can', bodyColor: '#78716c', finColor: '#44403c', pattern: 'none' } },
    { name: "Altın Balık", type: ItemType.FISH, value: 5000, rarity: 5, emoji: "👑", visual: { shape: 'carp', bodyColor: '#facc15', finColor: '#eab308', pattern: 'shiny' } },
    { name: "Mistik Yılanbalığı", type: ItemType.FISH, value: 8000, rarity: 6, emoji: "🐉", visual: { shape: 'eel', bodyColor: '#a855f7', finColor: '#6b21a8', pattern: 'shiny' } },
    { name: "Poseidon'un Mızrağı", type: ItemType.TREASURE, value: 100000, rarity: 6, emoji: "🔱", visual: { shape: 'swordfish', bodyColor: '#fbbf24', finColor: '#b45309', pattern: 'shiny' } }
  ],
  28: [
    { name: "Uçak Parçası", type: ItemType.JUNK, value: 100, rarity: 2, emoji: "✈️", visual: { shape: 'long', bodyColor: '#e5e5e5', finColor: '#a3a3a3', pattern: 'none' } },
    { name: "Hayalet Yengeç", type: ItemType.FISH, value: 4000, rarity: 5, emoji: "🦀", visual: { shape: 'crab', bodyColor: '#f3f4f6', finColor: '#d1d5db', pattern: 'none' } },
    { name: "Girdap Balığı", type: ItemType.FISH, value: 7500, rarity: 6, emoji: "🌀", visual: { shape: 'round', bodyColor: '#2563eb', finColor: '#1d4ed8', pattern: 'stripes' } },
    { name: "Zaman Kapsülü", type: ItemType.TREASURE, value: 50000, rarity: 6, emoji: "💊", visual: { shape: 'can', bodyColor: '#10b981', finColor: '#059669', pattern: 'shiny' } }
  ],
  29: [
    { name: "Donmuş Mamut Tüyü", type: ItemType.JUNK, value: 1000, rarity: 4, emoji: "🦣", visual: { shape: 'long', bodyColor: '#57534e', finColor: '#292524', pattern: 'none' } },
    { name: "Kadim Balina", type: ItemType.FISH, value: 25000, rarity: 6, emoji: "🐋", visual: { shape: 'whale', bodyColor: '#fff', finColor: '#e2e8f0', pattern: 'none' } },
    { name: "Leviathan Yavrusu", type: ItemType.FISH, value: 50000, rarity: 6, emoji: "🐲", visual: { shape: 'eel', bodyColor: '#0f172a', finColor: '#ef4444', pattern: 'stripes' } },
    { name: "Kozmik Kristal", type: ItemType.TREASURE, value: 250000, rarity: 6, emoji: "🌌", visual: { shape: 'round', bodyColor: '#8b5cf6', finColor: '#c084fc', pattern: 'shiny' } }
  ]
};
