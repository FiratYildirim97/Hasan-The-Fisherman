import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, BOBBERS, DECORATIONS, CHARMS, SKILLS, LOCATIONS, FISH_DB, ACHIEVEMENTS } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Crown, Target, TrendingUp, Sparkles, Droplets, Zap, Utensils, RefreshCw, Landmark, SlidersHorizontal, ArrowUpDown, Bell } from 'lucide-react';
import { Modal } from './Modal';
import { ItemType, CatchItem, FishVisual } from '../types';
import { FishRenderer } from './Scene';

interface PhysicsFish {
    id: string;
    item: CatchItem;
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    scale: number;
    speed: number;
    phase: number;
}

export const UIOverlay: React.FC = () => {
  const { 
    stats, bag, castRod, gameState, ownedRods, ownedBobbers, ownedDecor, activeDecor, unlockedLocs, skills, achievements, dailyFortune,
    sellItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, quests, claimQuest, aquarium, moveToAqua, upgradeSkill, pedia,
    isMuted, toggleMute, lifetimeStats, getRank,
    combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium,
    marketTrend, rodMastery, activeDiscount,
    ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
    autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal
  } = useGame();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bankAmount, setBankAmount] = useState('');

  const getBagPercent = () => (bag.length / stats.bagLimit) * 100;
  const getXpPercent = () => (stats.xp / (stats.level * 300)) * 100;

  const sortedBag = [...bag].sort((a, b) => {
      if (settings.sortMode === 'value') return b.value - a.value;
      if (settings.sortMode === 'weight') return b.weight - a.weight;
      return 0; 
  });

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

      <div className="absolute top-0 inset-x-0 z-30 flex flex-col pointer-events-none">
          <div className="w-full p-3 pt-safe-top bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start pointer-events-auto">
            <div className="flex flex-col gap-0.5 max-w-[50%] sm:max-w-xs">
                <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap shadow-lg">
                    <span className="text-blue-400">LVL {stats.level}</span>
                    <span className="text-slate-600">|</span>
                    <span className="truncate">{stats.xp}/{stats.level * 300} XP</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 relative shadow-inner">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${getXpPercent()}%` }} />
                    {Date.now() < buffs.xpBoostExpiry && <div className="absolute inset-0 bg-purple-500/50 animate-pulse" />}
                </div>
                
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 flex shadow-inner">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${ecologyScore}%` }} />
                </div>
                <div className="text-[9px] text-green-300 font-bold uppercase tracking-widest drop-shadow-md">{ecologyScore >= 100 ? 'DOĞA DOSTU!' : 'Ekoloji Puanı'}</div>

                {marketTrend && (
                    <div className="mt-1 text-[9px] text-green-300 font-medium bg-green-900/80 px-2 py-0.5 rounded-full inline-block border border-green-500/30 animate-pulse shadow-lg">
                        📈 Trend: {marketTrend.fishName} (x{marketTrend.multiplier})
                    </div>
                )}
                <div className="mt-1 flex items-center gap-1">
                    <div className="text-[9px] text-amber-300 font-medium bg-amber-900/80 px-2 py-0.5 rounded-full inline-block border border-amber-500/30 shadow-lg">
                        🔮 {dailyFortune}
                    </div>
                    <button onClick={rerollFortune} className="p-1 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-600" title="Falı Yenile (1000 TL)"><RefreshCw size={10} /></button>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5">
                    <div 
                        onClick={() => setActiveModal('bank')}
                        className="bg-slate-900/80 backdrop-blur border border-yellow-500/30 px-3 py-1.5 rounded-full font-mono font-bold text-yellow-400 text-xs sm:text-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer hover:bg-slate-800 transition transform active:scale-95"
                    >
                        {stats.money.toLocaleString()} TL
                    </div>
                    
                    <button onClick={() => setActiveModal('career')} className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-amber-500 active:scale-95 transition hover:bg-slate-800"><Trophy size={16} /></button>
                    <button onClick={toggleMute} className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-slate-400 active:scale-95 transition hover:bg-slate-800">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                </div>
                
                {Date.now() < buffs.xpBoostExpiry && (
                    <div className="bg-purple-900/90 border border-purple-500/50 px-2 py-0.5 rounded text-[10px] text-purple-200 font-bold animate-pulse flex items-center gap-1 shadow-lg">
                        <Zap size={12} /> 2x XP ({Math.ceil((buffs.xpBoostExpiry - Date.now())/60000)}dk)
                    </div>
                )}
                {buffs.goldenHook && (
                    <div className="bg-yellow-900/90 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] text-yellow-200 font-bold animate-pulse flex items-center gap-1 shadow-lg">
                        <Anchor size={12} /> Altın İğne
                    </div>
                )}
            </div>
          </div>

          <div className="w-full px-2 mt-2 flex justify-between items-start pointer-events-none">
             <div className="flex flex-col gap-2">
                 {tournament.active && (
                    <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] border-l-4 border-orange-500 w-36 animate-slide-in-left pointer-events-auto">
                        <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase tracking-widest mb-1"><Crown size={12} className="animate-bounce" /> Turnuva</div>
                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-1"><div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 linear" style={{ width: `${(tournament.timeLeft / 60) * 100}%` }} /></div>
                        <div className="flex justify-between items-end"><div className="text-lg font-mono font-bold text-white leading-none">{tournament.playerScore}</div><div className="text-[9px] text-slate-400 font-bold uppercase">PUAN</div></div>
                    </div>
                 )}
             </div>

             <div className="flex flex-col gap-2">
                {bounty.active && (
                    <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] border-r-4 border-red-500 w-36 text-right animate-slide-in-right pointer-events-auto">
                        <div className="flex items-center justify-end gap-2 text-red-400 font-black text-[10px] uppercase tracking-widest mb-1">ARANAN <Target size={12} className="animate-pulse" /></div>
                        <div className="flex justify-between items-center mb-1"><div className="text-2xl animate-bounce">{FISH_DB[bounty.locId].find(f => f.name === bounty.fishName)?.emoji}</div><div><div className="text-sm font-bold text-white leading-none">{bounty.fishName}</div><div className="text-xs text-slate-400 font-mono">Min {bounty.minWeight}kg</div></div></div>
                        <div className="text-[10px] text-yellow-400 font-bold bg-slate-800 rounded px-1 py-0.5 inline-block">Ödül: {bounty.reward} TL</div>
                    </div>
                )}
             </div>
          </div>
      </div>
      
      {combo > 1 && (
         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-scale-in">
            <div className="text-center"><div className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-400 to-purple-600 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">x{combo}</div><div className="text-xs font-bold text-fuchsia-200 bg-purple-900/80 px-3 py-1 rounded-full mt-1 border border-purple-500/50 shadow-lg">+{Math.floor(combo * 10)}% Fiyat</div></div>
         </div>
      )}

      <div className="absolute bottom-0 w-full pb-safe-bottom z-30 bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent pt-2 pointer-events-none">
        
        <div className="w-full overflow-hidden bg-slate-900/80 border-t border-white/10 backdrop-blur-sm h-6 flex items-center mb-2 pointer-events-auto shadow-lg">
            <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-[10px] font-mono text-cyan-300 px-4">
                📢 {newsTicker} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏦 Banka Faizi: %1/dk &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏆 Turnuva Yakında! &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 💡 İpucu: Çöpleri geri dönüştür!
            </div>
        </div>

        <div className="pointer-events-auto px-3 pb-3 max-w-2xl mx-auto w-full">
            <div className="flex justify-between px-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-700">
                <div className={`w-2 h-2 rounded-full ${stats.rodHp > 3 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                Can: <span className={stats.rodHp < 3 ? 'text-red-400' : 'text-slate-200'}>{Math.ceil(stats.rodHp)}/{RODS[stats.rodId].maxHp}</span>
                {rodMastery[stats.rodId] > 0 && <span className="text-purple-400 ml-1 flex items-center">★{Math.floor(rodMastery[stats.rodId]/50)}</span>}
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-700">
                Yem: <span className={stats.baitId ? 'text-emerald-300' : 'text-slate-500'}>{stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.name : 'YOK'}</span>
            </div>
            </div>

            <button onClick={castRod} disabled={gameState !== 'IDLE'} className={`w-full py-4 mb-3 rounded-2xl font-black text-xl tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${gameState === 'IDLE' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40 hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>{gameState === 'IDLE' ? 'OLTA AT' : 'BEKLENİYOR...'}</button>

            <div className="grid grid-cols-5 gap-2 mb-2">
            <MenuBtn icon={<Briefcase size={20} />} label="Çanta" onClick={() => setActiveModal('bag')} badge={getBagPercent() >= 100 ? '!' : bag.length > 0 ? bag.length.toString() : undefined} />
            <MenuBtn icon={<Fish size={20} />} label="Akvaryum" onClick={() => setActiveModal('aqua')} badge={aquarium.length > 0 ? `${aquarium.length}/${stats.aquaLimit}` : undefined} />
            <MenuBtn icon={<ScrollText size={20} />} label="Görevler" onClick={() => setActiveModal('quests')} badge={quests.some(q => !q.claimed && q.current >= q.target) ? '!' : undefined} />
            <MenuBtn icon={<BookOpen size={20} />} label="Rehber" onClick={() => setActiveModal('pedia')} />
            <MenuBtn icon={<ShoppingCart size={20} />} label="Market" onClick={() => setActiveModal('shop')} badge={activeDiscount ? '%' : undefined} />
            </div>

            <div className="grid grid-cols-2 gap-2">
            <MenuBtn icon={<Map size={18} />} label="Harita" onClick={() => setActiveModal('map')} horizontal />
            <MenuBtn icon={<Settings size={18} />} label="Yetenek" onClick={() => setActiveModal('skills')} horizontal />
            </div>
        </div>
      </div>

      <Modal isOpen={tournament.finished} onClose={closeTournamentResult} title="Turnuva Sonucu">
         <div className="flex flex-col items-center gap-4 text-center py-6">
             <div className="text-6xl animate-bounce">{tournament.rank === 1 ? '🏆' : tournament.rank === 2 ? '🥈' : tournament.rank === 3 ? '🥉' : '🎗️'}</div>
             <div><div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sıralama</div><div className={`text-4xl font-black ${tournament.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>#{tournament.rank}</div></div>
             <button onClick={closeTournamentResult} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white mt-2">TAMAM</button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'bag'} onClose={() => setActiveModal(null)} title={`Çanta (${bag.length}/${stats.bagLimit})`}>
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => toggleSetting('sortMode')} className="bg-slate-800 text-xs px-3 py-2 rounded text-slate-300 flex items-center gap-1"><ArrowUpDown size={12}/> {settings.sortMode === 'recent' ? 'Yeniler' : settings.sortMode === 'value' ? 'Pahalılar' : 'Ağırlar'}</button>
            <button onClick={() => toggleSetting('bulkSellSafe')} className={`text-xs px-3 py-2 rounded flex items-center gap-1 transition ${settings.bulkSellSafe ? 'bg-green-900/50 text-green-300 border border-green-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Güvenli Satış: {settings.bulkSellSafe ? 'AÇIK' : 'KAPALI'}</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={sellAll} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-yellow-900/20">Tümünü Sat</button>
          <button onClick={recycleJunk} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-900/20"><Recycle size={14} /> 5 Çöp Dönüştür</button>
        </div>
        {bag.length === 0 ? <div className="text-center text-slate-500 py-8">Çantanız boş</div> : (
          <div className="space-y-2">
            {sortedBag.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.golden ? 'bg-yellow-900/40 border-yellow-400' : item.shiny ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 flex-shrink-0"><FishRenderer visual={item.visual} /></div>
                   <div>
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-1">
                          {item.name}
                          {item.golden && <span className="text-[9px] bg-yellow-500 text-black px-1 rounded font-black">ALTIN</span>}
                          {item.shiny && !item.golden && <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">PARLAK</span>}
                          {item.perfect && <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-black">KUSURSUZ</span>}
                      </div>
                      <div className="text-xs text-slate-400">{item.type !== ItemType.JUNK ? (<span>{item.weight} kg • <span className={marketTrend?.fishName === item.name ? "text-green-400 font-bold" : "text-yellow-400"}> {item.value} TL</span>{marketTrend?.fishName === item.name && " (Trend)"}</span>) : 'Değersiz'}</div>
                   </div>
                </div>
                <div className="flex gap-1">
                   {item.type !== ItemType.JUNK && <button onClick={() => cookFish(item.id)} className="p-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-900" title="Balık Ekmek Yap (Ye)"><Utensils size={14}/></button>}
                   {item.type !== ItemType.JUNK && <button onClick={() => moveToAqua(item.id)} className="p-2 bg-cyan-900/50 text-cyan-400 rounded-lg hover:bg-cyan-900"><Fish size={14}/></button>}
                   <button onClick={() => sellItem(item.id)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-600/30">Sat</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={activeModal === 'aqua'} onClose={() => setActiveModal(null)} title="Akvaryum">
        <div className="text-center mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 relative">
            {visitorTip && visitorTip.active && (
                <button 
                    onClick={collectVisitorTip}
                    className="absolute -top-3 -right-3 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full animate-bounce shadow-lg z-50 border-2 border-white hover:scale-110 transition"
                >
                    💰 +{visitorTip.amount} TL Bahşiş!
                </button>
            )}
            
            <div className="relative z-10 flex justify-between items-center mb-2">
              <div className="text-left"><div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Pasif Gelir</div><div className="text-2xl font-mono font-bold text-green-400">{Date.now() < filterExpiry ? (aquarium.reduce((acc, f) => acc + (f.rarity > 1 ? f.rarity * 5 : 2), 0) * 2) : aquarium.reduce((acc, f) => acc + (f.rarity > 1 ? f.rarity * 5 : 2), 0)} TL/dk</div></div>
              <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full">Kapasite: {aquarium.length}/{stats.aquaLimit}</div>
            </div>
            <button onClick={cleanAquarium} disabled={Date.now() < filterExpiry} className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition relative overflow-hidden ${Date.now() < filterExpiry ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 animate-pulse'}`}>{Date.now() < filterExpiry ? (<>✨ Filtre Aktif ({Math.ceil((filterExpiry - Date.now())/60000)}dk)</>) : (<><Droplets size={14}/> Filtreyi Temizle (250 TL)</>)}</button>
        </div>
        <AdvancedAquarium fish={aquarium} activeDecor={activeDecor} isClean={Date.now() < filterExpiry} />
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">{aquarium.map((item) => (<div key={item.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-xl border border-slate-700"><div className="flex items-center gap-3"><div className="w-8 h-8"><FishRenderer visual={item.visual} /></div><div><div className="font-bold text-xs text-slate-200">{item.petName || item.name}</div><div className="text-[10px] text-slate-400">{item.weight} kg</div></div></div><button onClick={() => sellItem(item.id, true)} className="px-3 py-1 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/30">Sat</button></div>))}</div>
      </Modal>

      <Modal isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)} title="Banka">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-center mb-4">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">Hesap Bakiyesi</div>
              <div className="text-3xl font-mono font-black text-white">{stats.bankBalance.toLocaleString()} TL</div>
              <div className="text-green-400 text-xs mt-1">Faiz: %1 / Dakika (+{Math.floor(stats.bankBalance * 0.01)} TL)</div>
          </div>
          <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                  <input type="number" placeholder="Miktar" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500 transition" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { bankDeposit(Number(bankAmount)); setBankAmount(''); }} className="bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-white shadow-lg">YATIR</button>
                  <button onClick={() => { bankWithdraw(Number(bankAmount)); setBankAmount(''); }} className="bg-red-600 hover:bg-red-500 py-3 rounded-lg font-bold text-white shadow-lg">ÇEK</button>
              </div>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'shop'} onClose={() => setActiveModal(null)} title="Market">
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
           </div>

           <div className="p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 flex justify-between items-center">
               <div>
                   <div className="font-bold text-white">Şans Çarkı</div>
                   <div className="text-xs text-slate-400">{Date.now() < spinAvailable ? `Hazır: ${Math.ceil((spinAvailable - Date.now())/3600000)} saat sonra` : 'Her gün 1 ücretsiz çevirme!'}</div>
               </div>
               <button onClick={spinWheel} disabled={Date.now() < spinAvailable} className={`px-4 py-2 rounded-lg font-bold text-xs ${Date.now() < spinAvailable ? 'bg-slate-700 text-slate-500' : 'bg-purple-600 text-white animate-pulse'}`}>ÇEVİR</button>
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
      </Modal>

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
      <Modal isOpen={activeModal === 'quests'} onClose={() => setActiveModal(null)} title="Görevler">{quests.every(q => q.claimed) ? (<div className="text-center py-8 text-slate-500"><div className="text-4xl mb-2">🎉</div>Tüm görevler tamamlandı.<br/><span className="text-xs font-mono mt-2 inline-block bg-slate-800 px-2 py-1 rounded">Yenilenme: {10 - (useGame().questCooldown || 0)} tur</span></div>) : (<div className="space-y-2">{quests.map((q, i) => (<div key={q.id} className={`p-3 rounded-xl border relative overflow-hidden ${q.claimed ? 'bg-green-900/10 border-green-900/30 opacity-50' : 'bg-slate-800 border-slate-700'}`}><div className="flex justify-between items-center relative z-10"><div><div className="font-bold text-sm text-slate-200">{q.desc}</div><div className="text-xs text-slate-400 mt-1">Ödül: <span className="text-yellow-400">{q.reward} TL</span></div></div>{q.claimed ? (<span className="text-xs font-bold text-green-500">TAMAMLANDI</span>) : q.current >= q.target ? (<button onClick={() => claimQuest(i)} className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-xs shadow-[0_0_10px_rgba(234,179,8,0.4)] animate-pulse">ÖDÜLÜ AL</button>) : (<span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{q.current}/{q.target}</span>)}</div>{!q.claimed && (<div className="absolute bottom-0 left-0 h-1 bg-blue-500/50 transition-all duration-500" style={{ width: `${Math.min(100, (q.current/q.target)*100)}%` }} />)}</div>))}</div>)}</Modal>
      <Modal isOpen={activeModal === 'skills'} onClose={() => setActiveModal(null)} title="Yetenekler"><div className="space-y-2">{SKILLS.map(s => { const lvl = skills[s.id] || 0; const cost = (lvl + 1) * 500; const locked = stats.level < s.reqLvl; const maxed = lvl >= s.max; return (<div key={s.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center"><div><div className="font-bold text-sm text-slate-200 flex items-center gap-2">{s.name} <span className="text-xs text-blue-400 bg-blue-900/30 px-1.5 rounded">Lvl {lvl}</span></div><div className="text-xs text-slate-400 mt-0.5">{s.desc}</div></div>{maxed ? (<span className="text-xs font-bold text-green-500 px-3">MAX</span>) : locked ? (<span className="text-xs font-bold text-red-500 bg-red-900/10 px-2 py-1 rounded">Lvl {s.reqLvl} Gerekli</span>) : (<button onClick={() => upgradeSkill(s.id)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold">{cost} TL</button>)}</div>)})}</div></Modal>
      <Modal isOpen={activeModal === 'pedia'} onClose={() => setActiveModal(null)} title="Balık Rehberi"><div className="grid grid-cols-4 sm:grid-cols-5 gap-2">{Object.values(FISH_DB).flat().filter(f => f.type !== ItemType.JUNK).map((f, i) => { const entry = pedia[f.name]; return (<div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center border ${entry ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50'}`}>{entry ? (<div className="w-12 h-12"><FishRenderer visual={f.visual} /></div>) : (<div className="text-2xl grayscale brightness-0">?</div>)}{entry && <div className="text-[9px] font-bold text-slate-400 bg-slate-900 px-1 rounded mt-1">{entry.maxWeight}kg</div>}{entry?.shinyCaught && <span className="absolute top-1 right-1 text-[8px] text-cyan-400">✨</span>}{entry?.goldenCaught && <span className="absolute top-1 left-1 text-[8px] text-yellow-400">🏆</span>}</div>)})}</div></Modal>
    </>
  );
};

const AdvancedAquarium: React.FC<{ fish: CatchItem[], activeDecor: string[], isClean: boolean }> = ({ fish, activeDecor, isClean }) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const [entities, setEntities] = useState<PhysicsFish[]>([]);
   const [food, setFood] = useState<{ id: number, x: number, y: number }[]>([]);
   const [particles, setParticles] = useState<{ id: number, x: number, y: number, speed: number, scale: number }[]>([]);
   const [selectedFish, setSelectedFish] = useState<PhysicsFish | null>(null);
   const [parallax, setParallax] = useState({ x: 0, y: 0 });

   useEffect(() => {
       const newEntities = fish.map(f => {
           let speedBase = 0.5 + Math.random() * 0.5;
           let scaleBase = 1.0;
           if (f.visual.shape === 'shark' || f.visual.shape === 'swordfish') { speedBase = 1.5; scaleBase = 1.3; }
           if (f.visual.shape === 'blob' || f.visual.shape === 'crab') { speedBase = 0.3; }
           
           return {
               id: f.id,
               item: f,
               x: 20 + Math.random() * 60,
               y: 20 + Math.random() * 60,
               z: Math.random() * 200 - 100,
               vx: (Math.random() - 0.5) * speedBase,
               vy: (Math.random() - 0.5) * 0.2,
               vz: (Math.random() - 0.5) * 0.5,
               scale: scaleBase,
               speed: speedBase,
               phase: Math.random() * Math.PI * 2
           };
       });
       setEntities(newEntities);
   }, [fish]);

   useEffect(() => {
       const parts = Array.from({ length: 15 }).map((_, i) => ({
           id: i,
           x: Math.random() * 100,
           y: 100 + Math.random() * 20,
           speed: 0.2 + Math.random() * 0.5,
           scale: 0.5 + Math.random() * 0.5
       }));
       setParticles(parts);
   }, []);

   useEffect(() => {
       let animId: number;
       const update = () => {
           setEntities(prev => prev.map(e => {
               if (selectedFish && selectedFish.id === e.id) return e; 

               let ax = 0, ay = 0;
               if (food.length > 0) {
                   const target = food[0]; 
                   const dx = target.x - e.x;
                   const dy = target.y - e.y;
                   const dist = Math.sqrt(dx*dx + dy*dy);
                   if (dist > 1) {
                       ax = (dx / dist) * 0.05;
                       ay = (dy / dist) * 0.05;
                   }
               }

               e.vx += (Math.random() - 0.5) * 0.05 + ax;
               e.vy += (Math.random() - 0.5) * 0.02 + ay;
               e.vz += (Math.random() - 0.5) * 0.05;

               e.vx *= 0.98; e.vy *= 0.98; e.vz *= 0.98;
               const maxSpeed = e.speed * (food.length > 0 ? 2 : 1);
               e.vx = Math.max(-maxSpeed, Math.min(maxSpeed, e.vx));
               e.vy = Math.max(-maxSpeed/2, Math.min(maxSpeed/2, e.vy));

               e.x += e.vx;
               e.y += e.vy;
               e.z += e.vz;

               if (e.x < 5) e.vx += 0.05;
               if (e.x > 95) e.vx -= 0.05;
               if (e.y < 10) e.vy += 0.02;
               if (e.y > 90) e.vy -= 0.02;
               if (e.z < -100) e.vz += 0.1;
               if (e.z > 100) e.vz -= 0.1;

               return { ...e, phase: e.phase + 0.1 };
           }));

           setParticles(prev => prev.map(p => {
               let ny = p.y - p.speed;
               if (ny < -10) ny = 110; 
               return { ...p, y: ny, x: p.x + Math.sin(ny/10)*0.2 };
           }));

           animId = requestAnimationFrame(update);
       };
       animId = requestAnimationFrame(update);
       return () => cancelAnimationFrame(animId);
   }, [food, selectedFish]);

   const handleTap = (e: React.MouseEvent) => {
        if (selectedFish) {
            setSelectedFish(null); 
            return;
        }
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const id = Date.now();
        setFood(prev => [...prev, { id, x, y }]);
        setTimeout(() => setFood(prev => prev.filter(f => f.id !== id)), 3000); 
   };

   const handleMouseMove = (e: React.MouseEvent) => {
       const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
       const centerX = rect.width / 2;
       const centerY = rect.height / 2;
       const mouseX = e.clientX - rect.left;
       const mouseY = e.clientY - rect.top;
       setParallax({ x: (mouseX - centerX) / 30, y: (mouseY - centerY) / 30 });
   };

   return (
      <div className="w-full h-72 bg-slate-900 rounded-xl border-4 border-slate-700 relative overflow-hidden mb-4 shadow-2xl perspective-[1200px] group cursor-crosshair select-none" onClick={handleTap} onMouseMove={handleMouseMove} onMouseLeave={() => setParallax({x:0,y:0})}>
         <div className="w-full h-full relative preserve-3d transition-transform duration-200 ease-out" style={{ transform: `rotateY(${parallax.x}deg) rotateX(${-parallax.y}deg)` }}>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-80 brightness-50" />
             <div className={`absolute inset-0 bg-green-900/40 mix-blend-multiply transition-opacity duration-1000 ${isClean ? 'opacity-0' : 'opacity-100'}`} />
             {activeDecor.map((dId, i) => { const d = DECORATIONS.find(x => x.id === dId); return (<div key={i} className="absolute bottom-5 text-6xl drop-shadow-xl" style={{ left: `${20 + (i*25)%70}%`, transform: `translateZ(${-50 - i*20}px)` }}>{d?.emoji}</div>)})}
             {food.map(f => (<div key={f.id} className="absolute w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_5px_orange]" style={{ left: `${f.x}%`, top: `${f.y}%`, transform: 'translateZ(50px)' }} />))}
             {entities.map(e => (<div key={e.id} className="absolute w-16 h-16 preserve-3d transition-transform duration-[0ms]" onClick={(ev) => { ev.stopPropagation(); setSelectedFish(selectedFish?.id === e.id ? null : e); }} style={{ left: `${e.x}%`, top: `${e.y}%`, transform: `translate3d(-50%, -50%, ${e.z}px) rotateY(${e.vx > 0 ? 0 : 180}deg) scale(${e.scale})`, zIndex: Math.floor(e.z + 200), cursor: 'pointer' }}>{selectedFish?.id === e.id && (<div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-yellow-500/50 p-2 rounded-lg text-center w-32 animate-[pop_0.2s_ease-out]" style={{ transform: `rotateY(${e.vx > 0 ? 0 : 180}deg)` }}><div className="text-xs font-bold text-white mb-1">{e.item.petName || e.item.name}</div><div className="text-[10px] text-slate-300 font-mono">{e.item.weight}kg</div><div className="text-[10px] text-yellow-400 font-mono">{e.item.value} TL</div><div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-yellow-500/50 rotate-45" /></div>)}<div className="w-full h-full filter drop-shadow-lg animate-[wiggle_0.5s_ease-in-out_infinite]" style={{ animationDuration: `${1/e.speed}s` }}><FishRenderer visual={e.item.visual} /></div><div className="absolute top-[200%] left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 blur-md rounded-full rotate-x-90" style={{ transform: `translateY(${100 - e.y}px) scale(${1 - (e.y/150)})` }} /></div>))}
             {particles.map(p => (<div key={p.id} className="absolute w-2 h-2 bg-white/30 rounded-full backdrop-blur-sm border border-white/10" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `scale(${p.scale})` }} />))}
             <div className="absolute inset-0 border-[12px] border-slate-800/80 rounded-xl pointer-events-none z-50 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-40 rounded-xl mix-blend-overlay" />
             <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] text-slate-300 font-mono z-50 pointer-events-none">{isClean ? 'SU: TEMİZ' : 'SU: KİRLİ'}</div>
         </div>
      </div>
   );
};

const MenuBtn: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, badge?: string, horizontal?: boolean }> = ({ icon, label, onClick, badge, horizontal }) => (
  <button onClick={onClick} className={`relative group bg-slate-800/80 hover:bg-slate-700 backdrop-blur border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95 ${horizontal ? 'flex-row gap-2 py-3' : 'flex-col gap-1 py-2'}`}>
    <div className="text-slate-300 group-hover:text-white transition-colors">{icon}</div><span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">{label}</span>
    {badge && (<div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-slate-900 min-w-[18px] text-center animate-bounce">{badge}</div>)}
  </button>
);
const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (<div className="mb-4"><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{title}</h3><div className="space-y-2">{children}</div></div>);

const ShopItem: React.FC<{ title: string, desc: string, price: number, onBuy?: () => void, onEquip?: () => void, owned?: boolean, equipped?: boolean, active?: boolean, color?: string }> = ({ title, desc, price, onBuy, onEquip, owned, equipped, active, color }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${equipped || active ? 'bg-green-900/10 border-green-500/50' : 'bg-slate-800 border-slate-700'}`}>
    <div>
      <div className="font-bold text-sm text-slate-200 flex items-center gap-2" style={{ color: color }}>
        {title}
        {equipped && <span className="text-[9px] bg-green-900 text-green-400 px-1.5 py-0.5 rounded">KUŞANILDI</span>}
        {active && <span className="text-[9px] bg-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded">AKTİF</span>}
      </div>
      <div className="text-xs text-slate-400">{desc}</div>
    </div>
    <div>
      {owned ? (
        !equipped && onEquip ? (
          <button onClick={onEquip} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold">
            {equipped ? 'Seçili' : active ? 'Aktif' : 'Kuşan'}
          </button>
        ) : (
          null
        )
      ) : (
        active ? (
            <button className="px-3 py-1.5 bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold cursor-default">AKTİF</button>
        ) : (
            <button onClick={onBuy} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              {price} TL
            </button>
        )
      )}
    </div>
  </div>
);

const StatRow: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (<div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700/50"><div className="flex items-center gap-3 text-slate-400 text-sm font-bold"><div className="p-1.5 bg-slate-900 rounded-lg text-slate-300">{icon}</div>{label}</div><div className="font-mono font-bold text-white">{value}</div></div>);