import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Card as CardUI } from "./Card";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ShopOverlay() {
  const { phase, player, shopOptions, shopRelicOptions, buyCard, buyRelic, leaveShop, setFocusedCard, setShopSelectionMode, shopSelectionMode, removalPrice, upgradePrice, buyDiscard, buyShuffle } = useGameStore();

  if (phase !== "SHOP") return null;

  const relicBonus = player.relics.reduce((acc, r) => r.effect.type === 'GLOBAL_SUCCESS_CHANCE' ? acc + r.effect.value : acc, 0);

  return (
    <div className="fixed inset-0 bg-slate-950 z-[130] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-6xl flex flex-col h-full"
      >
        {/* Overlay for selection */}
        {shopSelectionMode !== "NONE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-12 text-center"
          >
            <h3 className="text-4xl font-black uppercase italic text-white mb-4">
              {shopSelectionMode === "REMOVE" ? "Select a card to remove" : "Select a card to upgrade"}
            </h3>
            <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest">
              {shopSelectionMode === "REMOVE" ? `Costs ♦${removalPrice}` : `Costs ♦${upgradePrice}`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full overflow-y-auto max-h-[60vh] custom-scrollbar p-4">
              {player.deck.map((card) => (
                <button
                  key={card.instanceId}
                  onClick={() => {
                    if (shopSelectionMode === "REMOVE") {
                       // Logic handled in toggleSelectCard in store, but we can trigger it here too if needed
                       // Actually toggleSelectCard handles it in the store logic, but we need to trigger the action
                       // Wait, current logic in store uses toggleSelectCard to *trigger* the remove/upgrade action when in shop
                       // Let's call the specific store actions.
                    }
                  }}
                  className="group relative"
                >
                    <CardUI
                      card={card}
                      onClick={() => {
                          if (shopSelectionMode === "REMOVE") useGameStore.getState().removeCard(card.instanceId!);
                          if (shopSelectionMode === "UPGRADE") useGameStore.getState().upgradeCard(card.instanceId!);
                      }}
                      onInfoClick={() => setFocusedCard(card)}
                      modifiers={[]}
                      enemyDebuff={0}
                      playerStatBonus={player.stats.successRateBonus}
                      relicBonus={relicBonus}
                    />
                </button>
              ))}
            </div>
            <button
                onClick={() => setShopSelectionMode("NONE")}
                className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-xl font-black uppercase italic hover:bg-slate-700"
            >
                Cancel
            </button>
          </motion.div>
        )}

        {/* Shop Header */}
        <header className="flex justify-between items-end mb-12 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                <ShoppingCart size={24} />
              </div>
              <span className="text-yellow-500 font-black tracking-[0.4em] uppercase text-xs">
                Premium Exchange
              </span>
            </div>
            <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white">
              The High Roller Shop
            </h2>
          </div>

          <div className="flex flex-col items-end gap-4">
             <div className="flex flex-col gap-2 items-end">
               <div className="flex gap-2">
                  <button
                    onClick={() => setShopSelectionMode(shopSelectionMode === "REMOVE" ? "NONE" : "REMOVE")}
                    className={cn(
                      "px-4 py-2 rounded-lg font-black uppercase italic text-xs transition-all border-2",
                      shopSelectionMode === "REMOVE" 
                        ? "bg-red-900/50 border-red-500 text-red-200"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-red-500/50 hover:text-red-200"
                    )}
                  >
                    Remove Card (♦{removalPrice})
                  </button>
                  <button
                    onClick={() => setShopSelectionMode(shopSelectionMode === "UPGRADE" ? "NONE" : "UPGRADE")}
                    className={cn(
                      "px-4 py-2 rounded-lg font-black uppercase italic text-xs transition-all border-2",
                      shopSelectionMode === "UPGRADE"
                        ? "bg-blue-900/50 border-blue-500 text-blue-200"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-blue-500/50 hover:text-blue-200"
                    )}
                  >
                    Upgrade Card (♦{upgradePrice})
                  </button>
               </div>
               <div className="flex gap-2">
                  <button
                    onClick={buyDiscard}
                    disabled={player.chips < 50 || player.discardsRemaining >= 3}
                    className={cn(
                      "px-4 py-2 rounded-lg font-black uppercase italic text-xs transition-all border-2",
                      player.chips >= 50 && player.discardsRemaining < 3
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-green-500/50 hover:text-green-200"
                        : "bg-slate-950 border-slate-900 text-slate-700 opacity-50 cursor-not-allowed"
                    )}
                  >
                    +1 Pitch (♦50)
                  </button>
                  <button
                    onClick={buyShuffle}
                    disabled={player.chips < 50 || player.shufflesRemaining >= 3}
                    className={cn(
                      "px-4 py-2 rounded-lg font-black uppercase italic text-xs transition-all border-2",
                      player.chips >= 50 && player.shufflesRemaining < 3
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-purple-500/50 hover:text-purple-200"
                        : "bg-slate-950 border-slate-900 text-slate-700 opacity-50 cursor-not-allowed"
                    )}
                  >
                    +1 Mulligan (♦50)
                  </button>
               </div>
             </div>
             <div className="bg-slate-900 border-2 border-yellow-500/50 p-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <span className="text-[10px] font-black uppercase text-yellow-500/70 block mb-1">Available Funds</span>
                <span className="text-3xl font-black text-white italic tracking-tighter">♦ {player.chips} CHIPS</span>
             </div>
             
             <button
               onClick={leaveShop}
               className="group flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-xl font-black uppercase italic tracking-tighter hover:bg-yellow-400 transition-all active:scale-95"
             >
               Leave Shop
               <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {/* Relics Section */}
          <div className="mb-16">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <div className="h-px w-8 bg-slate-800" /> Rare Relics <div className="h-px w-8 bg-slate-800" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopRelicOptions.map((relic) => (
                <button
                  key={relic.id}
                  onClick={() => buyRelic(relic)}
                  disabled={player.chips < (relic.price || 0)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                    player.chips >= (relic.price || 0)
                      ? "bg-slate-900 border-slate-800 hover:border-yellow-500/50 group"
                      : "bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="text-4xl p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                    {relic.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black uppercase italic tracking-tight">{relic.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">{relic.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-500 font-black italic">♦ {relic.price}</span>
                  </div>
                </button>
              ))}
              {shopRelicOptions.length === 0 && (
                <p className="col-span-full text-slate-700 font-bold uppercase text-[10px] tracking-widest text-center py-4">Relic inventory exhausted</p>
              )}
            </div>
          </div>

          {/* Card Grid */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <div className="h-px w-8 bg-slate-800" /> Exclusive Cards <div className="h-px w-8 bg-slate-800" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-12 justify-items-center py-4">
              <AnimatePresence mode="popLayout">
                {shopOptions.map((card) => (
                  <motion.div
                    key={card.instanceId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <CardUI
                      card={card}
                      onClick={() => setFocusedCard(card)}
                      onInfoClick={() => setFocusedCard(card)}
                      modifiers={[]}
                      enemyDebuff={0}
                      playerStatBonus={player.stats.successRateBonus}
                      relicBonus={relicBonus}
                    />

                    <button
                      onClick={() => buyCard(card)}
                      disabled={player.chips < (card.price || 0)}
                      className={cn(
                        "w-full py-3 rounded-xl font-black uppercase italic tracking-tighter border-2 transition-all flex flex-col items-center group/btn",
                        player.chips >= (card.price || 0)
                          ? "bg-slate-900 border-yellow-500/50 text-white hover:border-yellow-400 hover:bg-slate-800"
                          : "bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed"
                      )}
                    >
                      <span className="text-[10px] opacity-60 mb-0.5 group-hover/btn:opacity-100 transition-opacity">Buy for</span>
                      <span className="text-lg">♦ {card.price}</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <footer className="mt-8 py-6 border-t border-slate-900 flex justify-center">
           <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
             New Inventory arrivals every 5 floors
           </p>
        </footer>
      </motion.div>
    </div>
  );
}
