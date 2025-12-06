
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, BOBBERS, DECORATIONS, CHARMS, SKILLS, LOCATIONS, FISH_DB, ACHIEVEMENTS, PETS, PRESTIGE_UPGRADES, CRAFTING_RECIPES } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Crown, Target, TrendingUp, Sparkles, Droplets, Zap, Utensils, RefreshCw, Landmark, SlidersHorizontal, ArrowUpDown, Bell, Waves, PawPrint, Star, Hammer, Gem, Radio, Music, Dices, CalendarCheck, Menu, ChefHat, ShoppingBag } from 'lucide-react';
import { Modal } from './Modal';
import { ItemType, CatchItem, FishVisual } from '../types';
import { FishRenderer } from './Scene';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2 mb-4">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 border-b border-slate-800 pb-1 mb-2">{title}</h3>
    {children}
  </div>
);

const ShopItem: React.FC<{ 
  title: string, desc: string, price: number, 
  onBuy?: () => void, owned?: boolean, equipped?: boolean, active?: boolean, 
  onEquip?: () => void, color?: string 
}> = ({ title, desc, price, onBuy, owned, equipped, active, onEquip, color }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? 'bg-green-900/20 border-green-500/50' : equipped ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}>
    <div className="flex items-center gap-3">
      {color && <div className="w-8 h-8 rounded-full border-2 border-slate-600 shadow-sm" style={{ backgroundColor: color }} />}
      <div>
        <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
          {title}
          {equipped && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">KUŞANDIN</span>}
          {active && <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">AKTİF</span>}
        </div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
    </div>
    <div>
      {owned ? (
        onEquip ? (
          !equipped && <button onClick={onEquip} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold">KUŞAN</button>
        ) : (
          <span className="text-xs font-bold text-slate-500 px-3">SAHİPSİN</span>
        )
      ) : (
        onBuy && <button onClick={onBuy} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold">{price} TL</button>
      )}
    </div>
  </div>
);

const StatRow: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-2 border-b border-slate-800 last:border-0">
    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
      {icon} {label}
    </div>
    <div className="font-mono font-bold text-slate-200">{value}</div>
  </div>
);

export const UIOverlay: React.FC = () => {
  const { 
    stats, bag, castRod, gameState, ownedRods, ownedBobbers, ownedDecor, activeDecor, unlockedLocs, skills, achievements, dailyFortune,
    sellItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, quests, claimQuest, aquarium, moveToAqua, upgradeSkill, pedia,
    isMuted, toggleMute, lifetimeStats, getRank,
    combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium,
    marketTrend, marketMultipliers, rodMastery, activeDiscount,
    ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
    autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
    startDiving, ownedPets, buyPet, feedPet,
    prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
    donateFish, craftItem, useItem, upgradeWormFarm,
    mysteryMerchant, buyMerchantItem,
    radioStation, cycleRadio, hookFish, playSlotMachine,
    dailyRewardPopup, claimDailyReward,
    restaurant, activeCustomers = [], buyIngredient, serveCustomer, rejectCustomer, isRestaurantOpen, setIsRestaurantOpen
  } = useGame();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showMarketList, setShowMarketList] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurantTab, setRestaurantTab] = useState<'kitchen' | 'market' | 'inventory'>('kitchen');
  
  const [museumLoc, setMuseumLoc] = useState<number>(stats.locId);

  // Slot Machine States
  const [slotBet, setSlotBet] = useState(100);
  const [slotReels, setSlotReels] = useState(['🎰', '🎰', '🎰']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number, type: string } | null>(null);

  useEffect(() => {
      if (setIsRestaurantOpen) setIsRestaurantOpen(activeModal === 'restaurant');
  }, [activeModal, setIsRestaurantOpen]);

  const getBagPercent = () => (bag.length / stats.bagLimit) * 100;
  const getXpPercent = () => (stats.xp / (stats.level * 300)) * 100;

  const sortedBag = [...bag].sort((a, b) => {
      if (settings.sortMode === 'value') return b.value - a.value;
      if (settings.sortMode === 'weight') return b.weight - a.weight;
      return 0; // recent
  });

  const canDive = stats.locId >= 7; 
  const canPrestige = stats.level >= 50;
  const showPrestige = stats.level >= 50 || stats.prestigeLevel > 0;

  const handleSlotSpin = () => {
      if (stats.money < slotBet) return;
      setIsSpinning(true);
      setLastWin(null);
      setSlotReels(['❓', '❓', '❓']);

      setTimeout(() => {
          const { result, reward, winType } = playSlotMachine(slotBet);
          setSlotReels(result);
          setIsSpinning(false);
          if (reward > 0) {
              setLastWin({ amount: reward, type: winType });
          }
      }, 1000);
  };

  const renderBagItem = (item: CatchItem) => {
      const mult = marketMultipliers[item.name] || 1;
      const dynamicValue = Math.floor(item.value * mult);
      const isCrafted = item.type === ItemType.BAIT || item.type === ItemType.BUFF || item.type === ItemType.CHARM;

      return (
          <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.golden ? 'bg-yellow-900/40 border-yellow-400' : item.shiny ? 'bg-cyan-900/30 border-cyan-500' : isCrafted ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
                      {item.name.includes('İnci') || isCrafted ? <span className="text-2xl">{item.emoji}</span> : <div className="w-9 h-9"><FishRenderer visual={item.visual} /></div>}
                  </div>
                  <div>
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-1">
                          {item.name}
                          {item.golden && <span className="text-[9px] bg-yellow-500 text-black px-1 rounded font-black">ALTIN</span>}
                          {item.shiny && !item.golden && <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">PARLAK</span>}
                          {item.perfect && <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-black">KUSURSUZ</span>}
                      </div>
                      <div className="text-xs text-slate-400">
                          {item.type !== ItemType.JUNK ? (
                              <span className="flex items-center gap-1">
                                  {isCrafted ? 'Özel Eşya' : `${item.weight} kg`} • 
                                  <span className={marketTrend?.fishName === item.name ? "text-green-400 font-bold" : "text-yellow-400"}> {dynamicValue} TL</span>
                                  {mult > 1 && <span className="text-[10px] text-green-400 flex items-center">▲ %{Math.round((mult-1)*100)}</span>}
                                  {mult < 1 && <span className="text-[10px] text-red-400 flex items-center">▼ %{Math.round((1-mult)*100)}</span>}
                                  {marketTrend?.fishName === item.name && " (Trend)"}
                              </span>
                          ) : 'Değersiz'}
                      </div>
                  </div>
              </div>
              <div className="flex gap-1">
                  {isCrafted && (
                      <button onClick={() => useItem(item.id)} className="px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">Kullan</button>
                  )}
                  {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => cookFish(item.id)} className="p-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-900" title="Balık Ekmek Yap (Ye)"><Utensils size={14}/></button>}
                  {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => moveToAqua(item.id)} className="p-2 bg-cyan-900/50 text-cyan-400 rounded-lg hover:bg-cyan-900"><Fish size={14}/></button>}
                  <button onClick={() => sellItem(item.id)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-600/30">Sat</button>
              </div>
          </div>
      );
  };

  const SidebarBtn = ({ icon, label, onClick, badge }: any) => (
      <button onClick={() => { onClick(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group mb-2 active:scale-95">
          <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>
          <div className="font-bold text-slate-200 text-sm flex-1 text-left">{label}</div>
          {badge && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</div>}
      </button>
  );

  return (
    <>
      <Modal isOpen={!!offlineEarningsModal} onClose={collectOfflineEarnings} title="Hoşgeldin!">
          <div className="text-center py-6">
              <div className="text-4xl mb-2">💤💰</div>
              <div className="text-slate-300">Sen yokken Otomatik Ağ çalıştı!</div>
              <div className="text-3xl font-bold text-yellow-400 my-4">+{offlineEarningsModal} TL</div>
              <button onClick={collectOfflineEarnings} className="w-full py-3 bg-green-600 rounded-xl font-bold text-white">TOPLA</button>
          </div>
      </Modal>

      <Modal isOpen={!!dailyRewardPopup?.active} onClose={claimDailyReward} title="Günlük Giriş Ödülü">
          <div className="text-center py-6">
              <div className="text-5xl mb-2 animate-bounce">📅</div>
              <div className="text-slate-300 text-sm">Geri döndüğün için teşekkürler!</div>
              
              <div className="my-6 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">GİRİŞ SERİSİ</div>
                  <div className="text-4xl font-black text-cyan-400 mb-2">{dailyRewardPopup?.streak} GÜN</div>
                  <div className="flex gap-1 justify-center">
                      {[1,2,3,4,5,6,7].map(d => (
                          <div key={d} className={`w-2 h-2 rounded-full ${dailyRewardPopup && d <= dailyRewardPopup.streak ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                      ))}
                  </div>
              </div>

              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">BUGÜNKÜ ÖDÜLÜN</div>
              <div className="text-3xl font-bold text-yellow-400 mb-6">+{dailyRewardPopup?.reward} TL</div>
              
              <button onClick={claimDailyReward} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/50">
                  ÖDÜLÜ AL
              </button>
          </div>
      </Modal>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Menu */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-72 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pointer-events-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
              <span className="font-black text-xl text-white tracking-wider flex items-center gap-2"><Anchor size={20} className="text-cyan-400"/> MENÜ</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white active:scale-95"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <Section title="Temel">
                  <SidebarBtn icon={<Briefcase size={20} />} label="Çanta" onClick={() => setActiveModal('bag')} badge={getBagPercent() >= 100 ? 'DOLU' : bag.length > 0 ? bag.length.toString() : undefined} />
                  <SidebarBtn icon={<Fish size={20} />} label="Akvaryum" onClick={() => setActiveModal('aqua')} badge={aquarium.length >= stats.aquaLimit ? 'DOLU' : undefined} />
                  <SidebarBtn icon={<ShoppingCart size={20} />} label="Market" onClick={() => setActiveModal('shop')} badge={activeDiscount ? '%' : undefined} />
                  <SidebarBtn icon={<ScrollText size={20} />} label="Görevler" onClick={() => setActiveModal('quests')} badge={quests.some(q => !q.claimed && q.current >= q.target) ? '!' : undefined} />
                  <SidebarBtn icon={<PawPrint size={20} />} label="Yoldaşlar" onClick={() => setActiveModal('pets')} />
              </Section>
              
              <Section title="Gelişim & Eğlence">
                  <SidebarBtn icon={<ChefHat size={20} />} label="Restoran" onClick={() => setActiveModal('restaurant')} />
                  <SidebarBtn icon={<Settings size={20} />} label="Yetenekler" onClick={() => setActiveModal('skills')} />
                  <SidebarBtn icon={<Hammer size={20} />} label="Zanaat" onClick={() => setActiveModal('crafting')} />
                  <SidebarBtn icon={<Map size={20} />} label="Harita" onClick={() => setActiveModal('map')} />
                  <SidebarBtn icon={<BookOpen size={20} />} label="Ansiklopedi" onClick={() => setActiveModal('pedia')} />
                  <SidebarBtn icon={<Dices size={20} />} label="Slot Makinesi" onClick={() => setActiveModal('slots')} />
              </Section>

              <Section title="Profil">
                  <SidebarBtn icon={<Trophy size={20} />} label="Kariyer & İstatistik" onClick={() => setActiveModal('career')} />
                  {showPrestige && <SidebarBtn icon={<Star size={20} />} label="Prestij (Rebirth)" onClick={() => setActiveModal('prestige')} badge={canPrestige ? 'HAZIR' : undefined} />}
              </Section>
          </div>
      </div>

      {/* RESTAURANT MODAL */}
      <Modal isOpen={activeModal === 'restaurant'} onClose={() => setActiveModal(null)} title="Balık Restoranı">
          <div className="flex gap-2 mb-4">
              <button onClick={() => setRestaurantTab('kitchen')} className={`flex-1 py-2 rounded text-xs font-bold ${restaurantTab === 'kitchen' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Mutfak & Servis</button>
              <button onClick={() => setRestaurantTab('market')} className={`flex-1 py-2 rounded text-xs font-bold ${restaurantTab === 'market' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Hal (Pazar)</button>
              <button onClick={() => setRestaurantTab('inventory')} className={`flex-1 py-2 rounded text-xs font-bold ${restaurantTab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Kiler</button>
          </div>

          {restaurantTab === 'inventory' && restaurant && (
              <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="text-2xl">🥗</span> <span className="text-sm text-slate-300">Sebze</span></div>
                      <span className="font-mono font-bold text-white">{restaurant.ingredients.vegetables}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="text-2xl">🍶</span> <span className="text-sm text-slate-300">Yağ</span></div>
                      <span className="font-mono font-bold text-white">{restaurant.ingredients.oil}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="text-2xl">🧀</span> <span className="text-sm text-slate-300">Meze</span></div>
                      <span className="font-mono font-bold text-white">{restaurant.ingredients.meze}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="text-2xl">🍼</span> <span className="text-sm text-slate-300">Rakı</span></div>
                      <span className="font-mono font-bold text-white">{restaurant.ingredients.raki}</span>
                  </div>
                  <div className="col-span-2 p-3 bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                      Restoran İtibarı: <span className="text-yellow-400 font-bold">{restaurant.reputation}</span>
                  </div>
              </div>
          )}

          {restaurantTab === 'market' && (
              <div className="space-y-3">
                  <div className="text-center text-xs text-slate-400 mb-2">Malzemeleri buradan temin edebilirsin.</div>
                  <ShopItem title="Taze Sebzeler" desc="Domates, Biber, Soğan (5 Adet)" price={250} onBuy={() => buyIngredient('vegetables', 5, 250)} />
                  <ShopItem title="Ayçiçek Yağı" desc="Kızartma için (5 Adet)" price={150} onBuy={() => buyIngredient('oil', 5, 150)} />
                  <ShopItem title="Meze Tabağı" desc="Peynir, Kavun, Haydari (2 Adet)" price={400} onBuy={() => buyIngredient('meze', 2, 400)} />
                  <ShopItem title="Yeni Rakı" desc="Aslan Sütü (1 Adet)" price={500} onBuy={() => buyIngredient('raki', 1, 500)} />
              </div>
          )}

          {restaurantTab === 'kitchen' && (
              <div className="space-y-4">
                  {activeCustomers.length === 0 ? (
                      <div className="text-center py-10 opacity-50">
                          <div className="text-4xl mb-2">🍽️</div>
                          <div>Müşteri Bekleniyor...</div>
                      </div>
                  ) : (
                      activeCustomers.map(customer => {
                          const hasIngredients = restaurant && (
                              (customer.order === 'sandwich' && restaurant.ingredients.vegetables >= 1) ||
                              (customer.order === 'grilled' && restaurant.ingredients.vegetables >= 1 && restaurant.ingredients.oil >= 1) ||
                              (customer.order === 'raki_table' && restaurant.ingredients.vegetables >= 2 && restaurant.ingredients.meze >= 2 && restaurant.ingredients.raki >= 1 && restaurant.ingredients.oil >= 1)
                          );
                          
                          const matchingFish = bag.find(f => 
                              f.type === ItemType.FISH && 
                              f.rarity >= customer.fishReq.rarity && 
                              f.weight >= customer.fishReq.minWeight
                          );

                          return (
                              <div key={customer.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 animate-slide-up">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <div className="font-bold text-white flex items-center gap-2">
                                              {customer.name}
                                              <span className="text-[10px] bg-slate-700 px-1.5 rounded text-slate-300">
                                                  {customer.order === 'sandwich' ? '🥪 Balık Ekmek' : customer.order === 'grilled' ? '🔥 Izgara' : '🍼 Rakı Sofrası'}
                                              </span>
                                          </div>
                                          <div className="text-xs text-slate-400 mt-1">
                                              İstek: {customer.fishReq.rarity > 1 ? 'Nadir' : 'Sıradan'} Balık ({Math.floor(customer.fishReq.minWeight)}kg+)
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className={`text-xs font-bold ${customer.patience < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>{customer.patience}% Sabır</div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mt-3">
                                      {hasIngredients ? (
                                          matchingFish ? (
                                              <button onClick={() => serveCustomer(customer.id, matchingFish.id)} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-white text-xs font-bold">
                                                  SERVİS ET ({matchingFish.name})
                                              </button>
                                          ) : (
                                              <div className="flex-1 py-2 bg-slate-700 text-slate-500 rounded text-xs font-bold text-center border border-slate-600">
                                                  UYGUN BALIK YOK
                                              </div>
                                          )
                                      ) : (
                                          <div className="flex-1 py-2 bg-red-900/30 text-red-400 rounded text-xs font-bold text-center border border-red-500/30">
                                              MALZEME EKSİK
                                          </div>
                                      )}
                                      <button onClick={() => rejectCustomer(customer.id)} className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-200 rounded text-xs font-bold">X</button>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          )}
      </Modal>

      <div className="absolute bottom-36 w-full overflow-hidden bg-slate-900/80 border-y border-white/5 backdrop-blur-sm z-20 h-6 flex items-center pointer-events-none">
          <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] text-[10px] font-mono text-cyan-300 px-4">
              📢 {newsTicker} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏦 Banka Faizi: %1/dk &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏆 Turnuva Yakında!
          </div>
      </div>

      <div className="absolute top-0 w-full p-3 flex justify-between items-start z-30 pt-safe-top bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex flex-col gap-0.5 pointer-events-auto max-w-[45%]">
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap">
            <span className="text-blue-400">LVL {stats.level}</span>
            <span className="text-slate-500">|</span>
            <span className="truncate">{stats.xp}/{stats.level * 300} XP</span>
            {stats.prestigeLevel > 0 && <span className="ml-1 text-fuchsia-400">★{stats.prestigeLevel}</span>}
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 relative">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${getXpPercent()}%` }} />
            {Date.now() < buffs.xpBoostExpiry && <div className="absolute inset-0 bg-purple-500/50 animate-pulse" />}
          </div>
          
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 flex">
             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${ecologyScore}%` }} />
          </div>
          <div className="text-[8px] text-green-300 font-bold uppercase tracking-widest">{ecologyScore >= 100 ? 'DOĞA DOSTU (BONUS AKTİF)' : 'Ekoloji Puanı'}</div>

          {marketTrend && (
             <div className="mt-1 text-[9px] text-green-300 font-medium bg-green-900/30 px-2 py-0.5 rounded-full inline-block border border-green-500/20 animate-pulse">
                📈 Trend: {marketTrend.fishName} (x{marketTrend.multiplier})
             </div>
          )}
          <div className="mt-1 flex items-center gap-1">
              <div className="text-[9px] text-amber-300 font-medium bg-amber-900/30 px-2 py-0.5 rounded-full inline-block border border-amber-500/20">
                🔮 {dailyFortune}
              </div>
              <button onClick={rerollFortune} className="p-0.5 bg-slate-800 rounded-full text-slate-400 hover:text-white" title="Falı Yenile (1000 TL)"><RefreshCw size={10} /></button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <div className="flex items-center gap-1.5">
                <div 
                    onClick={() => setActiveModal('bank')}
                    className="bg-slate-900/60 backdrop-blur border border-yellow-500/30 px-3 py-1.5 rounded-full font-mono font-bold text-yellow-400 text-xs sm:text-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer hover:bg-slate-800 transition"
                >
                    {stats.money.toLocaleString()} TL
                </div>
                
                <button onClick={cycleRadio} className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-blue-300 active:scale-95 transition">
                    {radioStation === 'off' ? <Radio size={16} /> : radioStation === 'nature' ? <Waves size={16} /> : <Music size={16} />}
                </button>
                <button onClick={toggleMute} className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-slate-400 active:scale-95 transition">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-blue-600 border border-blue-400 rounded-full text-white active:scale-95 transition shadow-lg shadow-blue-900/50 animate-[pulse_3s_infinite]">
                    <Menu size={16} />
                </button>
            </div>
            
            {Date.now() < buffs.xpBoostExpiry && (
                <div className="bg-purple-900/80 border border-purple-500/50 px-2 py-0.5 rounded text-[9px] text-purple-200 font-bold animate-pulse flex items-center gap-1">
                    <Zap size={10} /> 2x XP ({Math.ceil((buffs.xpBoostExpiry - Date.now())/60000)}dk)
                </div>
            )}
            {buffs.goldenHook && (
                <div className="bg-yellow-900/80 border border-yellow-500/50 px-2 py-0.5 rounded text-[9px] text-yellow-200 font-bold animate-pulse flex items-center gap-1">
                    <Anchor size={10} /> Altın İğne
                </div>
            )}
        </div>
      </div>

      {tournament.active && (
        <div className="absolute top-24 left-2 z-20 pointer-events-none animate-slide-in-left origin-top-left scale-90 sm:scale-100">
           <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] border-l-4 border-orange-500 w-36">
              <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase tracking-widest mb-1"><Crown size={12} className="animate-bounce" /> Turnuva</div>
              <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-1"><div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 linear" style={{ width: `${(tournament.timeLeft / 60) * 100}%` }} /></div>
              <div className="flex justify-between items-end"><div className="text-lg font-mono font-bold text-white leading-none">{tournament.playerScore}</div><div className="text-[9px] text-slate-400 font-bold uppercase">PUAN</div></div>
           </div>
        </div>
      )}

      {bounty.active && (
        <div className="absolute top-24 right-2 z-20 pointer-events-none animate-slide-in-right origin-top-right scale-90 sm:scale-100">
           <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] border-r-4 border-red-500 w-36 text-right">
              <div className="flex items-center justify-end gap-2 text-red-400 font-black text-[10px] uppercase tracking-widest mb-1">ARANAN <Target size={12} className="animate-pulse" /></div>
              <div className="flex justify-between items-center mb-1"><div className="text-2xl animate-bounce">{FISH_DB[bounty.locId].find(f => f.name === bounty.fishName)?.emoji}</div><div><div className="text-sm font-bold text-white leading-none">{bounty.fishName}</div><div className="text-xs text-slate-400 font-mono">Min {bounty.minWeight}kg</div></div></div>
              <div className="text-[10px] text-yellow-400 font-bold bg-slate-800 rounded px-1 py-0.5 inline-block">Ödül: {bounty.reward} TL</div>
           </div>
        </div>
      )}

      {mysteryMerchant && mysteryMerchant.active && (
          <div className="absolute top-36 right-4 z-40 animate-bounce pointer-events-auto">
              <button 
                  onClick={() => setActiveModal('merchant')}
                  className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] border-2 border-purple-300"
              >
                  <Gem size={24} />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">!</span>
              </button>
              <div className="mt-1 text-center bg-black/60 rounded px-1 text-[9px] text-white font-mono">
                  {Math.ceil((mysteryMerchant.expiry - Date.now())/1000)}s
              </div>
          </div>
      )}
      
      {combo > 1 && (
         <div className="absolute top-44 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-scale-in">
            <div className="text-center"><div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-400 to-purple-600 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">x{combo}</div><div className="text-[10px] font-bold text-fuchsia-200 bg-purple-900/60 px-2 py-0.5 rounded-full mt-1 border border-purple-500/30">+{Math.floor(combo * 10)}% Fiyat</div></div>
         </div>
      )}

      <div className="absolute bottom-0 w-full p-3 pb-safe-bottom z-30 flex flex-col gap-3 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
        <div className="flex justify-between px-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
           <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${stats.rodHp > 3 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              Can: <span className={stats.rodHp < 3 ? 'text-red-400' : 'text-slate-200'}>{Math.ceil(stats.rodHp)}/{RODS[stats.rodId].maxHp}</span>
              {rodMastery[stats.rodId] > 0 && <span className="text-purple-400 ml-1">★{Math.floor(rodMastery[stats.rodId]/50)}</span>}
           </div>
           <div className="flex items-center gap-1">Yem: <span className="text-slate-200">{stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.name : 'YOK'}</span></div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={gameState === 'BITE' ? hookFish : castRod} 
                disabled={gameState !== 'IDLE' && gameState !== 'BITE'} 
                className={`flex-1 py-4 rounded-2xl font-black text-xl tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${gameState === 'BITE' ? 'bg-red-600 animate-pulse text-white shadow-red-900/50' : gameState === 'IDLE' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40 hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            >
                {gameState === 'IDLE' ? 'OLTA AT' : gameState === 'BITE' ? 'YAKALA!' : 'BEKLENİYOR...'}
            </button>
            
            {canDive && gameState === 'IDLE' && (
                <button 
                    onClick={startDiving} 
                    className="w-20 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg shadow-cyan-900/40 active:scale-95"
                    title="Dalış Yap (500 TL)"
                >
                    <Waves size={24} />
                    <span className="text-[9px] mt-1">DALIŞ</span>
                </button>
            )}
        </div>
      </div>

      <Modal isOpen={activeModal === 'aqua'} onClose={() => setActiveModal(null)} title={`Akvaryum (${aquarium.length}/${stats.aquaLimit})`}>
          <div className="flex justify-between mb-4">
              <div className="text-xs text-slate-400">Temizlik: {filterExpiry > Date.now() ? 'İyi' : 'Kötü (Gelir Azalır)'}</div>
              <button onClick={cleanAquarium} className="px-3 py-1 bg-cyan-700 rounded text-white text-xs font-bold hover:bg-cyan-600">Temizle (250 TL)</button>
          </div>
          {aquarium.length === 0 ? <div className="text-center text-slate-500 py-8">Akvaryum boş.</div> : (
              <div className="grid grid-cols-3 gap-2">
                  {aquarium.map(item => (
                      <div key={item.id} className="relative p-2 bg-blue-900/30 border border-blue-500/30 rounded-xl flex flex-col items-center">
                          <div className="text-3xl mb-1 animate-[float_4s_ease-in-out_infinite]"><FishRenderer visual={item.visual} /></div>
                          <div className="font-bold text-[10px] text-blue-200 text-center truncate w-full">{item.name}</div>
                          <button onClick={() => sellItem(item.id, true)} className="mt-1 bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-[9px] text-white w-full">Sat</button>
                      </div>
                  ))}
              </div>
          )}
      </Modal>

      <Modal isOpen={activeModal === 'slots'} onClose={() => setActiveModal(null)} title="Slot Makinesi">
          <div className="flex flex-col items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-center text-xs text-slate-400 mb-2">Şansını dene, servetini katla!</div>
              
              {/* Reels */}
              <div className="flex gap-2 p-4 bg-black rounded-lg border-4 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  {slotReels.map((symbol, idx) => (
                      <div key={idx} className={`w-16 h-20 bg-white rounded flex items-center justify-center text-4xl ${isSpinning ? 'animate-pulse blur-sm' : ''}`}>
                          {isSpinning ? '❓' : symbol}
                      </div>
                  ))}
              </div>

              {/* Status */}
              {lastWin ? (
                  <div className="text-center animate-bounce">
                      <div className="text-2xl font-black text-yellow-400">{lastWin.amount} TL KAZANDIN!</div>
                      <div className="text-xs text-yellow-200 uppercase tracking-widest">{lastWin.type === 'jackpot' ? 'JACKPOT!!!' : lastWin.type === 'big' ? 'BÜYÜK ÖDÜL!' : 'KAZANÇ'}</div>
                  </div>
              ) : (
                  <div className="h-10 flex items-center justify-center text-slate-500 text-sm">
                      {isSpinning ? 'Dönüyor...' : 'BAHİS YAP VE ÇEVİR'}
                  </div>
              )}

              {/* Controls */}
              <div className="w-full space-y-2">
                  <div className="flex justify-center gap-2">
                      {[100, 500, 1000, 5000].map(amt => (
                          <button 
                              key={amt} 
                              onClick={() => setSlotBet(amt)} 
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${slotBet === amt ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                          >
                              {amt}
                          </button>
                      ))}
                  </div>
                  <button 
                      onClick={handleSlotSpin} 
                      disabled={isSpinning || stats.money < slotBet}
                      className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-all active:scale-95 ${isSpinning || stats.money < slotBet ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:brightness-110 shadow-orange-900/50'}`}
                  >
                      {isSpinning ? '...' : 'ÇEVİR'}
                  </button>
                  {stats.money < slotBet && <div className="text-center text-xs text-red-400">Yetersiz Bakiye</div>}
              </div>

              {/* Payout Table */}
              <div className="w-full bg-slate-900/50 p-2 rounded text-[10px] text-slate-400 mt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex justify-between"><span>3x 7️⃣</span> <span className="text-yellow-400">50x</span></div>
                      <div className="flex justify-between"><span>3x 💎</span> <span className="text-cyan-400">20x</span></div>
                      <div className="flex justify-between"><span>3x 🍇</span> <span className="text-purple-400">10x</span></div>
                      <div className="flex justify-between"><span>3x 🍋</span> <span className="text-green-400">5x</span></div>
                      <div className="flex justify-between"><span>3x 🍒</span> <span className="text-red-400">3x</span></div>
                      <div className="flex justify-between"><span>Herhangi 2x</span> <span className="text-white">1.5x</span></div>
                  </div>
              </div>
          </div>
      </Modal>

      <Modal isOpen={tournament.finished} onClose={closeTournamentResult} title="Turnuva Sonucu">
         <div className="flex flex-col items-center gap-4 text-center py-6">
             <div className="text-6xl animate-bounce">{tournament.rank === 1 ? '🏆' : tournament.rank === 2 ? '🥈' : tournament.rank === 3 ? '🥉' : '🎗️'}</div>
             <div><div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sıralama</div><div className={`text-4xl font-black ${tournament.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>#{tournament.rank}</div></div>
             <button onClick={closeTournamentResult} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white mt-2">TAMAM</button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'merchant'} onClose={() => setActiveModal(null)} title="Gizemli Tüccar">
          <div className="text-center mb-4">
              <div className="text-6xl mb-2 animate-bounce">🔮</div>
              <p className="text-slate-300 italic text-sm">"Çok uzaklardan geldim, çok nadir eşyalarım var... Ama acelem var!"</p>
              {mysteryMerchant && (
                  <div className="text-xs font-mono text-red-400 mt-2 font-bold animate-pulse">
                      Kalan Süre: {Math.ceil((mysteryMerchant.expiry - Date.now()) / 1000)} saniye
                  </div>
              )}
          </div>
          <div className="space-y-3">
              {mysteryMerchant?.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-purple-500/50 flex justify-between items-center shadow-lg shadow-purple-900/20">
                      <div>
                          <div className="font-bold text-purple-200">{item.name}</div>
                          <div className="text-xs text-slate-400 uppercase tracking-widest">{item.type === 'bait' ? 'Yem' : item.type === 'rod' ? 'Olta' : 'Güçlendirme'}</div>
                      </div>
                      <button onClick={() => buyMerchantItem(idx)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm shadow-md">
                          {item.price.toLocaleString()} TL
                      </button>
                  </div>
              ))}
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'museum'} onClose={() => setActiveModal(null)} title="Şehir Müzesi">
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <button onClick={() => setMuseumLoc(prev => Math.max(0, prev - 1))} disabled={museumLoc === 0} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">&lt;</button>
                <div className="text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-widest font-bold">BÖLGE</div>
                    <div className="text-lg font-bold text-white">{LOCATIONS[museumLoc].name}</div>
                    {!unlockedLocs.includes(museumLoc) && <div className="text-xs text-red-400">(Kilitli)</div>}
                </div>
                <button onClick={() => setMuseumLoc(prev => Math.min(LOCATIONS.length - 1, prev + 1))} disabled={museumLoc === LOCATIONS.length - 1} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">&gt;</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {FISH_DB[museumLoc].filter(f => f.type !== ItemType.JUNK).map((f, i) => {
                    const entry = pedia[f.name];
                    const isCaught = entry && entry.count > 0;
                    const isDonated = entry && entry.donated;
                    const inBag = bag.find(b => b.name === f.name);
                    return (
                        <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center border relative group overflow-hidden ${isDonated ? 'bg-indigo-900/40 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.3)]' : isCaught ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                            {isCaught ? (<div className="w-12 h-12"><FishRenderer visual={f.visual} /></div>) : (<div className="text-2xl grayscale brightness-0 opacity-30">?</div>)}
                            {isDonated && <div className="absolute inset-0 border-2 border-indigo-400 rounded-xl flex items-center justify-center bg-black/20"><div className="bg-indigo-500 rounded-full p-1"><Landmark size={12} className="text-white"/></div></div>}
                            {!isDonated && isCaught && inBag && (<button onClick={() => donateFish(inBag.id)} className="absolute inset-x-0 bottom-0 py-1 bg-green-600 text-[9px] font-bold text-white hover:bg-green-500 uppercase tracking-wider">BAĞIŞLA</button>)}
                        </div>
                    );
                })}
            </div>
            <div className="text-[10px] text-center text-slate-500">Tamamlanan her koleksiyon için özel ödüller kazanabilirsin.<br/>Bağış ödülü: <span className="text-fuchsia-400">1 İnci</span> + <span className="text-yellow-400">Para</span></div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'crafting'} onClose={() => setActiveModal(null)} title="Zanaat Masası">
        <div className="space-y-4">
            <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/30 flex items-center gap-4">
                <div className="text-4xl">🛠️</div>
                <div>
                    <h3 className="text-amber-200 font-bold">Çöp Dönüşümü</h3>
                    <p className="text-xs text-amber-100/70">Çantandaki gereksiz eşyaları kullanarak faydalı ekipmanlar üret.</p>
                </div>
            </div>

            <div className="grid gap-3">
                {CRAFTING_RECIPES.map(recipe => {
                    const ingredientsStatus = recipe.inputs.map(input => {
                        const countInBag = bag.filter(item => item.name === input.itemName).length;
                        return { ...input, has: countInBag, ready: countInBag >= input.count };
                    });
                    const canCraft = ingredientsStatus.every(i => i.ready);

                    return (
                        <div key={recipe.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row gap-3 items-center">
                            <div className="flex-1">
                                <div className="font-bold text-white flex items-center gap-2">{recipe.name}</div>
                                <div className="text-xs text-slate-400 mb-2">{recipe.desc}</div>
                                <div className="flex gap-2 flex-wrap">
                                    {ingredientsStatus.map((ing, idx) => (
                                        <span key={idx} className={`text-[10px] px-2 py-1 rounded font-mono ${ing.ready ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                            {ing.itemName}: {ing.has}/{ing.count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 min-w-[80px]">
                                <div className="text-xs font-bold text-amber-400">➜ {recipe.output.count}x {recipe.output.name}</div>
                                <button 
                                    onClick={() => craftItem(recipe.id)} 
                                    disabled={!canCraft}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold w-full transition-all ${canCraft ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                >
                                    ÜRET
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'prestige'} onClose={() => setActiveModal(null)} title="Prestij Mağazası">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/30 p-4 rounded-2xl flex flex-col items-center text-center">
                <div className="text-4xl mb-2 animate-pulse">🔮</div>
                <div className="text-2xl font-bold text-fuchsia-200">{stats.pearls} İnci</div>
                <div className="text-xs text-fuchsia-300/70">Prestij Seviyesi: {stats.prestigeLevel}</div>
            </div>

            {canPrestige ? (
                 <div className="p-4 bg-slate-800 rounded-2xl border border-fuchsia-500/50 shadow-[0_0_20px_rgba(192,38,211,0.1)]">
                     <div className="flex items-center gap-3 mb-3">
                         <div className="text-3xl">🌀</div>
                         <div>
                             <div className="font-bold text-white text-lg">Yeniden Doğuş (Rebirth)</div>
                             <div className="text-xs text-slate-400">Her şeyi sıfırla, İnci kazan.</div>
                         </div>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg text-xs text-slate-300 space-y-1 mb-4 font-mono">
                         <div className="flex justify-between"><span>Seviye Bonusu:</span> <span className="text-green-400">+{1 + Math.floor((stats.level - 50) / 10)} İnci</span></div>
                         <div className="flex justify-between"><span>Nakit Bonusu:</span> <span className="text-green-400">+{Math.floor(stats.money / 100000)} İnci</span></div>
                         <div className="flex justify-between"><span>Banka Bonusu:</span> <span className="text-green-400">+{Math.floor(stats.bankBalance / 100000)} İnci</span></div>
                         <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between font-bold text-sm text-white"><span>TOPLAM:</span> <span className="text-fuchsia-400">{calculatePrestigePearls()} İnci</span></div>
                     </div>
                     <button onClick={() => { if(window.confirm("Bütün ilerlemen sıfırlanacak. Emin misin?")) doPrestige(); }} className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/50 active:scale-95 transition-all">YENİDEN DOĞ</button>
                 </div>
            ) : (
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-center opacity-70">
                    <div className="text-slate-400 text-sm font-bold mb-1">Yeniden Doğuş Kilitli</div>
                    <div className="text-xs text-slate-500">Seviye 50'ye ulaşman gerekiyor.</div>
                    <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-fuchsia-500" style={{ width: `${Math.min(100, (stats.level / 50) * 100)}%` }} />
                    </div>
                    <div className="text-[9px] mt-1 text-right text-fuchsia-400">{stats.level}/50</div>
                </div>
            )}

            <Section title="Kalıcı Güçlendirmeler">
                <div className="space-y-2">
                    {PRESTIGE_UPGRADES.map(u => {
                        const level = prestigeUpgrades[u.id] || 0;
                        const isMax = level >= u.maxLevel;
                        return (
                            <div key={u.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xl">{u.icon}</div>
                                    <div>
                                        <div className="font-bold text-sm text-white">{u.name} <span className="text-[10px] bg-fuchsia-900/30 text-fuchsia-300 px-1.5 py-0.5 rounded ml-1">Lvl {level}/{u.maxLevel}</span></div>
                                        <div className="text-xs text-slate-400">{u.desc} (+{Math.floor(u.effectPerLevel*100)}%)</div>
                                    </div>
                                </div>
                                {isMax ? (
                                    <div className="text-xs font-bold text-green-500 px-3">MAX</div>
                                ) : (
                                    <button onClick={() => buyPrestigeUpgrade(u.id)} className="px-3 py-1.5 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-lg text-xs font-bold whitespace-nowrap">{u.cost} İnci</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'bag'} onClose={() => setActiveModal(null)} title={`Çanta (${bag.length}/${stats.bagLimit})`}>
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => toggleSetting('sortMode')} className="bg-slate-800 text-xs px-3 py-2 rounded text-slate-300 flex items-center gap-1"><ArrowUpDown size={12}/> {settings.sortMode === 'recent' ? 'Yeniler' : settings.sortMode === 'value' ? 'Pahalılar' : 'Ağırlar'}</button>
            <button onClick={() => toggleSetting('bulkSellSafe')} className={`text-xs px-3 py-2 rounded flex items-center gap-1 ${settings.bulkSellSafe ? 'bg-green-900/50 text-green-300 border border-green-500/50' : 'bg-slate-800 text-slate-400'}`}>Güvenli Satış: {settings.bulkSellSafe ? 'AÇIK' : 'KAPALI'}</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={sellAll} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm transition">Tümünü Sat</button>
          <button onClick={recycleJunk} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-1"><Recycle size={14} /> 5 Çöp Dönüştür</button>
        </div>
        {bag.length === 0 ? <div className="text-center text-slate-500 py-8">Çantanız boş</div> : (
          <div className="space-y-2">
            {sortedBag.map((item) => renderBagItem(item))}
          </div>
        )}
      </Modal>

      <Modal isOpen={activeModal === 'pets'} onClose={() => setActiveModal(null)} title="Yoldaşlar">
        <div className="space-y-6">
            <Section title="Yoldaşlarım">
                {ownedPets.length === 0 ? (
                    <div className="text-center text-slate-500 py-4">Henüz bir yoldaşın yok.</div>
                ) : (
                    <div className="space-y-3">
                        {ownedPets.map(op => {
                            const def = PETS.find(p => p.id === op.id);
                            if (!def) return null;
                            return (
                                <div key={op.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-3xl bg-slate-900 rounded-lg w-12 h-12 flex items-center justify-center">{def.icon}</div>
                                        <div>
                                            <div className="font-bold text-white">{def.name} <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded ml-1">Lvl {op.level}</span></div>
                                            <div className="text-xs text-slate-400">{def.desc} (Bonus x{1 + (op.level - 1)*0.1})</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                                                <span>Açlık</span>
                                                <span className={op.hunger < 20 ? 'text-red-400' : 'text-green-400'}>{op.hunger}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-300 ${op.hunger < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${op.hunger}%` }} />
                                            </div>
                                        </div>
                                        <button onClick={() => feedPet(op.id)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold whitespace-nowrap">Besle (Balık)</button>
                                    </div>
                                    <div className="mt-1 text-[9px] text-slate-500">Beslemek için çantanda balık veya çöp olması gerekir.</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Section>

            <Section title="Yoldaş Mağazası">
                <div className="space-y-2">
                    {PETS.map(pet => {
                        const isOwned = ownedPets.some(p => p.id === pet.id);
                        return (
                            <div key={pet.id} className={`flex items-center justify-between p-3 rounded-xl border ${isOwned ? 'bg-slate-800/50 border-slate-700 opacity-70' : 'bg-slate-800 border-slate-700'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{pet.icon}</div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-200">{pet.name}</div>
                                        <div className="text-xs text-slate-400">{pet.desc}</div>
                                    </div>
                                </div>
                                {isOwned ? (
                                    <span className="text-xs font-bold text-green-500 bg-green-900/20 px-2 py-1 rounded">SAHİPSİN</span>
                                ) : (
                                    <button onClick={() => buyPet(pet.id)} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold">{pet.price} TL</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'shop'} onClose={() => { setActiveModal(null); setShowMarketList(false); }} title={showMarketList ? "Borsa Durumu" : "Market"}>
        {!showMarketList ? (
            <div className="space-y-6">
            {activeDiscount && (<div className="bg-red-500/20 border border-red-500 p-2 rounded text-center text-red-300 text-xs font-bold animate-pulse">🔥 FLAŞ İNDİRİM: Oltalar ve Yemler %20 İndirimli!</div>)}
            
            <div className="p-3 bg-slate-800 rounded-xl border border-blue-500/30 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <div className="font-bold text-white flex items-center gap-2">Otomatik Ağ <span className="text-xs bg-blue-900 px-2 py-0.5 rounded text-blue-200">Lvl {autoNetLevel}</span></div>
                        <div className="text-xs text-slate-400">Dakikada {autoNetLevel * 10} TL kazandırır (Çevrimdışı çalışır)</div>
                    </div>
                    <button onClick={upgradeAutoNet} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">{(autoNetLevel + 1) * 2000} TL</button>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                    <div>
                        <div className="font-bold text-white flex items-center gap-2">Solucan Çiftliği <span className="text-xs bg-amber-900 px-2 py-0.5 rounded text-amber-200">Lvl {stats.wormFarmLevel}</span></div>
                        <div className="text-xs text-slate-400">Pasif Yem Üretimi (Dakikada {stats.wormFarmLevel})</div>
                    </div>
                    <button onClick={upgradeWormFarm} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold">{(stats.wormFarmLevel + 1) * 2500} TL</button>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-white">Şans Çarkı</div>
                        <div className="text-xs text-slate-400">{Date.now() < spinAvailable ? `Hazır: ${Math.ceil((spinAvailable - Date.now())/3600000)} saat sonra` : 'Her gün 1 ücretsiz çevirme!'}</div>
                    </div>
                    <button onClick={spinWheel} disabled={Date.now() < spinAvailable} className={`px-4 py-2 rounded-lg font-bold text-xs ${Date.now() < spinAvailable ? 'bg-slate-700 text-slate-500' : 'bg-purple-600 text-white animate-pulse'}`}>ÇEVİR</button>
                </div>
                <button onClick={() => setShowMarketList(true)} className="px-4 bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-300 hover:bg-slate-700">
                    <TrendingUp size={16} className="mb-1" />
                    Borsa
                </button>
            </div>

            <Section title="Tılsımlar (Pasif Güçler)">
                {CHARMS.map(c => (
                    <ShopItem key={c.id} title={`${c.icon} ${c.name}`} desc={c.desc} price={c.price} onBuy={() => buyItem('charm', c.id)} owned={ownedCharms.includes(c.id)} active={ownedCharms.includes(c.id)} />
                ))}
            </Section>

            <Section title="Özel Eşyalar">
                <ShopItem title="Enerji İçeceği" desc="5dk boyunca 2x XP" price={250} onBuy={() => buyItem('buff', 'energy')} active={Date.now() < buffs.xpBoostExpiry} />
                <ShopItem title="Altın İğne" desc="Sıradaki balık Nadir+" price={1000} onBuy={() => buyItem('buff', 'golden')} active={buffs.goldenHook} />
            </Section>
            <Section title="Yemler">{BAITS.map(b => (<ShopItem key={b.id} title={b.name} desc={`Şans x${b.bonus}`} price={activeDiscount ? Math.floor(b.price*0.8) : b.price} onBuy={() => buyItem('bait', b.id)} active={stats.baitId === b.id} />))}</Section>
            <Section title="Oltalar">{RODS.map(r => (<ShopItem key={r.id} title={r.name} desc={`HP: ${r.maxHp}`} price={activeDiscount ? Math.floor(r.price*0.8) : r.price} owned={ownedRods.includes(r.id)} equipped={stats.rodId === r.id} color={r.color} onBuy={() => buyItem('rod', r.id)} onEquip={() => equipRod(r.id)} />))}</Section>
            <Section title="Şamandıralar">{BOBBERS.map(b => (<ShopItem key={b.id} title={`${b.icon} ${b.name}`} desc="Görünüm" price={b.price} owned={ownedBobbers.includes(b.id)} equipped={stats.bobberId === b.id} onBuy={() => buyItem('bobber', b.id)} onEquip={() => equipBobber(b.id)} />))}</Section>
            <Section title="Akvaryum Dekoru">{DECORATIONS.map(d => (<ShopItem key={d.id} title={`${d.emoji} ${d.name}`} desc="Süs" price={d.price} owned={ownedDecor.includes(d.id)} equipped={activeDecor.includes(d.id)} onBuy={() => buyItem('decor', d.id)} onEquip={() => toggleDecor(d.id)} />))}</Section>
            <Section title="Geliştirmeler"><ShopItem title="Tamir Kiti" desc="Oltayı tamamen onarır" price={50} onBuy={repairRod} /><ShopItem title="Çanta Genişletme" desc="+5 Kapasite" price={500} onBuy={() => buyItem('upgrade', 'bag')} /></Section>
            </div>
        ) : (
            <div className="space-y-2">
                <button onClick={() => setShowMarketList(false)} className="w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-lg mb-2 text-xs">← Geri Dön</button>
                <div className="text-center text-xs text-slate-500 mb-2">Fiyatlar her 60 saniyede bir güncellenir.</div>
                {(Object.entries(marketMultipliers) as [string, number][])
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, mult]) => (
                        <div key={name} className="flex justify-between items-center p-2 bg-slate-800 rounded border border-slate-700">
                            <span className="text-sm text-slate-300 font-bold">{name}</span>
                            <span className={`text-sm font-mono font-bold ${mult > 1 ? 'text-green-400' : mult < 1 ? 'text-red-400' : 'text-slate-400'}`}>
                                {mult > 1 ? '▲' : mult < 1 ? '▼' : '-'} %{Math.round(Math.abs(1 - mult) * 100)}
                            </span>
                        </div>
                    ))}
            </div>
        )}
      </Modal>

      {/* Career, Map, Skills, Pedia modals - Keep existing implementations */}
      <Modal isOpen={activeModal === 'career'} onClose={() => setActiveModal(null)} title="Kariyer">
         <div className="flex flex-col items-center py-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-4"><div className="text-5xl mb-2">🏆</div><div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Mevcut Rütbe</div><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{getRank()}</div></div>
         <Section title="İstatistikler"><div className="space-y-2 mb-4">
             <StatRow label="Toplam Yakalanan" value={lifetimeStats.totalCaught} icon={<Fish size={14}/>} />
             <StatRow label="Toplam Kazanç" value={`${lifetimeStats.totalMoneyEarned.toLocaleString()} TL`} icon={<TrendingUp size={14}/>} />
             <StatRow label="En Ağır Balık" value={`${lifetimeStats.heaviestFish} kg`} icon={<Anchor size={14}/>} />
             <StatRow label="Efsanevi" value={lifetimeStats.legendariesCaught} icon={<Crown size={14} className="text-yellow-500"/>} />
             <StatRow label="Parlak (Shiny)" value={lifetimeStats.shinyCaught} icon={<Sparkles size={14} className="text-cyan-400"/>} />
             <StatRow label="Altın (Golden)" value={lifetimeStats.goldenCaught} icon={<Target size={14} className="text-yellow-400"/>} />
             <StatRow label="Çevrimdışı Gelir" value={`${lifetimeStats.offlineEarnings.toLocaleString()} TL`} icon={<Briefcase size={14}/>} />
         </div></Section>
         <Section title="Başarımlar"><div className="grid grid-cols-3 gap-2">{ACHIEVEMENTS.map(ach => { const unlocked = achievements.includes(ach.id); return (<div key={ach.id} className={`p-2 rounded-lg border flex flex-col items-center text-center ${unlocked ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}><div className="text-2xl mb-1">{ach.icon}</div><div className={`text-[10px] font-bold ${unlocked ? 'text-yellow-200' : 'text-slate-500'}`}>{ach.title}</div></div>) })}</div></Section>
      </Modal>

      <Modal isOpen={activeModal === 'map'} onClose={() => setActiveModal(null)} title="Harita">
          {mapParts < 4 && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl flex items-center gap-4">
                  <div className="text-2xl">🗺️</div>
                  <div>
                      <div className="text-amber-200 font-bold text-sm">Hazine Haritası</div>
                      <div className="text-xs text-amber-400/70">Parçalar: {mapParts}/4 (Çöplerden bulabilirsin)</div>
                  </div>
              </div>
          )}
          <div className="space-y-2">{LOCATIONS.map(l => { const unlocked = unlockedLocs.includes(l.id); const current = stats.locId === l.id; return (<div key={l.id} className={`flex items-center justify-between p-3 rounded-xl border ${current ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700 opacity-90'}`}><div className="flex items-center gap-3"><span className="text-2xl grayscale-[50%]">{l.icon}</span><span className={`font-bold text-sm ${current ? 'text-blue-300' : 'text-slate-300'}`}>{l.name}</span></div>{unlocked ? (current ? <span className="text-xs font-bold text-blue-400 px-3">BURADASIN</span> : <button onClick={() => {travel(l.id); setActiveModal(null)}} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white">GİT</button>) : (<button onClick={() => buyItem('location', l.id)} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs font-bold text-white flex gap-1 items-center">{l.price} TL</button>)}</div>)})}</div></Modal>
      
      <Modal isOpen={activeModal === 'skills'} onClose={() => setActiveModal(null)} title="Yetenekler"><div className="space-y-2">{SKILLS.map(s => { const lvl = skills[s.id] || 0; const cost = (lvl + 1) * 500; const locked = stats.level < s.reqLvl; const maxed = lvl >= s.max; return (<div key={s.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center"><div><div className="font-bold text-sm text-slate-200 flex items-center gap-2">{s.name} <span className="text-xs text-blue-400 bg-blue-900/30 px-1.5 rounded">Lvl {lvl}</span></div><div className="text-xs text-slate-400 mt-0.5">{s.desc}</div></div>{maxed ? (<span className="text-xs font-bold text-green-500 px-3">MAX</span>) : locked ? (<span className="text-xs font-bold text-red-500 bg-red-900/10 px-2 py-1 rounded">Lvl {s.reqLvl} Gerekli</span>) : (<button onClick={() => upgradeSkill(s.id)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold">{cost} TL</button>)}</div>)})}</div></Modal>
      
      <Modal isOpen={activeModal === 'pedia'} onClose={() => setActiveModal(null)} title="Balık Rehberi"><div className="grid grid-cols-4 sm:grid-cols-5 gap-2">{Object.values(FISH_DB).flat().filter(f => f.type !== ItemType.JUNK).map((f, i) => { const entry = pedia[f.name]; return (<div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center border ${entry ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50'}`}>{entry ? (<div className="w-12 h-12"><FishRenderer visual={f.visual} /></div>) : (<div className="text-2xl grayscale brightness-0">?</div>)}{entry && <div className="text-[9px] font-bold text-slate-400 bg-slate-900 px-1 rounded mt-1">{entry.maxWeight}kg</div>}{entry?.shinyCaught && <span className="absolute top-1 right-1 text-[8px] text-cyan-400">✨</span>}{entry?.goldenCaught && <span className="absolute top-1 left-1 text-[8px] text-yellow-400">🏆</span>}</div>)})}</div></Modal>
    </>
  );
};
