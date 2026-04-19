import { motion, AnimatePresence } from "framer-motion";
import { Card as CardUI } from "./Card";
import { useGameStore } from "../store/useGameStore";
import { useState, useMemo } from "react";
import { Swords, Shield, Sparkles, Box, LayoutGrid } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GameCard } from "../types/game";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeckViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'HAND' | 'DECK' | 'DISCARD';

export function DeckViewModal({ isOpen, onClose }: DeckViewModalProps) {
  const { player, setFocusedCard } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('HAND');

  // Grouping logic for the grid
  const groupCards = (cards: GameCard[]) => {
    const groups: Record<string, { card: GameCard; count: number }> = {};
    cards.forEach(c => {
      if (!groups[c.id]) {
        groups[c.id] = { card: c, count: 0 };
      }
      groups[c.id].count++;
    });
    return Object.values(groups);
  };

  // Stats for the dashboard
  const stats = useMemo(() => {
    const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.tempDiscard];
    return {
      total: allCards.length,
      attack: allCards.filter(c => c.type === 'ATTACK').length,
      defense: allCards.filter(c => c.type === 'DEFENSE').length,
      gamble: allCards.filter(c => c.type === 'GAMBLE').length,
      other: allCards.filter(c => !['ATTACK', 'DEFENSE', 'GAMBLE'].includes(c.type)).length
    };
  }, [player]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 lg:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header with Stats */}
            <div className="p-8 border-b border-slate-800 bg-slate-900/80">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Deck Manifest</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Personnel Gear & Tactics</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black uppercase italic tracking-tighter hover:bg-indigo-400 transition-all active:scale-95 shadow-xl"
                >
                  Close Manifest
                </button>
              </div>

              {/* Stat Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                  <Box className="text-slate-500 mb-1" size={16} />
                  <span className="text-[10px] font-black uppercase text-slate-500">Total</span>
                  <span className="text-2xl font-black italic text-white">{stats.total}</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center">
                  <Swords className="text-red-500 mb-1" size={16} />
                  <span className="text-[10px] font-black uppercase text-red-500/70">Attacks</span>
                  <span className="text-2xl font-black italic text-white">{stats.attack}</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center">
                  <Shield className="text-blue-500 mb-1" size={16} />
                  <span className="text-[10px] font-black uppercase text-blue-500/70">Defenses</span>
                  <span className="text-2xl font-black italic text-white">{stats.defense}</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-purple-500/20 flex flex-col items-center justify-center">
                  <LayoutGrid className="text-purple-500 mb-1" size={16} />
                  <span className="text-[10px] font-black uppercase text-purple-500/70">Gambles</span>
                  <span className="text-2xl font-black italic text-white">{stats.gamble}</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                  <Sparkles className="text-slate-500 mb-1" size={16} />
                  <span className="text-[10px] font-black uppercase text-slate-500">Other</span>
                  <span className="text-2xl font-black italic text-white">{stats.other}</span>
                </div>
              </div>
            </div>

            {/* Tab Controls */}
            <div className="flex bg-slate-900 border-b border-slate-800 p-2">
               {(['HAND', 'DECK', 'DISCARD'] as TabType[]).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                     activeTab === tab 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                   )}
                 >
                   {tab} {tab === 'HAND' ? `(${player.hand.length})` : tab === 'DECK' ? `(${player.deck.length})` : `(${player.discard.length})`}
                 </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 justify-items-center"
                >
                  {/* Render based on Tab */}
                  {activeTab === 'HAND' && player.hand.map((card: GameCard) => (
                    <div key={card.instanceId} className="scale-95 hover:scale-105 transition-transform duration-300">
                      <CardUI 
                        card={card} 
                        onClick={() => setFocusedCard(card)}
                        onInfoClick={() => setFocusedCard(card)}
                        modifiers={[]}
                        enemyDebuff={0}
                      />
                    </div>
                  ))}

                  {activeTab === 'DECK' && groupCards(player.deck).map(({ card, count }) => (
                    <div key={card.id} className="relative scale-95 hover:scale-105 transition-transform duration-300 group">
                      <CardUI 
                        card={card} 
                        onClick={() => setFocusedCard(card)}
                        onInfoClick={() => setFocusedCard(card)}
                        modifiers={[]}
                        enemyDebuff={0}
                      />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-600 rounded-full border-4 border-slate-900 flex items-center justify-center font-black italic text-sm shadow-xl text-white z-50">
                        x{count}
                      </div>
                    </div>
                  ))}

                  {activeTab === 'DISCARD' && groupCards(player.discard).map(({ card, count }) => (
                    <div key={card.id} className="relative scale-95 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 group">
                      <CardUI 
                        card={card} 
                        disabled={true}
                        onClick={() => setFocusedCard(card)}
                        onInfoClick={() => setFocusedCard(card)}
                        modifiers={[]}
                        enemyDebuff={0}
                      />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-rose-600 rounded-full border-4 border-slate-900 flex items-center justify-center font-black italic text-sm shadow-xl text-white z-50">
                        x{count}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              {/* Empty State */}
              {((activeTab === 'HAND' && player.hand.length === 0) ||
                (activeTab === 'DECK' && player.deck.length === 0) ||
                (activeTab === 'DISCARD' && player.discard.length === 0)) && (
                <div className="h-64 flex items-center justify-center w-full col-span-full">
                  <p className="text-slate-600 font-black uppercase italic tracking-widest text-xl opacity-30">Pile Empty</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
