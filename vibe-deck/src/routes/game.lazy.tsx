import { useGameStore } from '../store/useGameStore';
import { Card as CardUI } from '../components/Card';
import { Enemy as EnemyUI } from '../components/Enemy';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { Heart, Zap, ScrollText, Trophy, Skull } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Game() {
  const { 
    player, enemy, phase, floor, log, playCard, endTurn, 
    startGame, draftCard, lastResult, bannerText, draftOptions,
    selectedCard, selectCard
  } = useGameStore();
  const playerControls = useAnimation();
  const prevHp = useRef(player.hp);

  // Player hit animation effect
  useEffect(() => {
    if (player.hp < prevHp.current) {
      playerControls.start({
        x: [0, -10, 10, -10, 10, 0],
        backgroundColor: ["rgba(15, 23, 42, 0.5)", "rgba(239, 68, 68, 0.4)", "rgba(15, 23, 42, 0.5)"],
        transition: { duration: 0.4 }
      });
    }
    prevHp.current = player.hp;
  }, [player.hp, playerControls]);

  // Reset/Start game if we somehow land here without a phase
  useEffect(() => {
    if (phase === 'MAP') {
      startGame();
    }
  }, [phase, startGame]);

  if (phase === 'BATTLE_END' && player.hp <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Skull size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-5xl font-black text-red-500 uppercase mb-4 italic tracking-tighter">Bad Beat</h1>
        <p className="text-slate-400 mb-8 max-w-sm">The house always wins. You were eliminated on Floor {floor}.</p>
        <button
          onClick={() => (window.location.href = '/')}
          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold uppercase tracking-widest border border-slate-700"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4 lg:p-6 bg-slate-950 relative">
      {/* TURN BANNER */}
      <AnimatePresence>
        {bannerText && (
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="w-full bg-indigo-600/90 backdrop-blur-md py-8 flex justify-center border-y-4 border-indigo-400/50 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
               <span className="text-7xl lg:text-9xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                 {bannerText}
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESOLUTION POPUP */}
      <AnimatePresence>
        {lastResult && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0, y: -100 }}
            className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
          >
             <div className={cn(
               "px-12 py-6 rounded-3xl border-8 transform skew-x-[-12deg] shadow-2xl",
               lastResult === 'SUCCESS' 
                 ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/40" 
                 : "bg-red-600 border-red-400 text-white shadow-red-500/40"
             )}>
               <span className="text-6xl font-black uppercase italic tracking-tighter drop-shadow-lg">
                 {lastResult}
               </span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Info */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Status</span>
            <motion.div 
              animate={playerControls}
              className="flex items-center gap-3 bg-slate-900/50 p-2 px-3 rounded-lg border border-slate-800"
            >
              <div className="flex items-center gap-1.5">
                <Heart className="text-red-500 fill-red-500" size={16} />
                <span className="font-bold text-lg">{player.hp}/{player.maxHp}</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="font-bold text-lg">{player.energy}/{player.maxEnergy}</span>
              </div>
            </motion.div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Position</span>
            <div className="p-2 px-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="font-bold text-lg">FLOOR {floor}/10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Currency</span>
             <span className="font-bold text-xl text-yellow-500 italic uppercase">♦ {player.chips} CHIPS</span>
           </div>
        </div>
      </header>

      {/* Main Battle Stage */}
      <main className="flex-1 flex flex-col justify-center items-center relative gap-12">
        {enemy && (
           <EnemyUI enemy={enemy} />
        )}

        {/* Action History / Log */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 hidden xl:block pointer-events-none">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ScrollText size={12} /> Battle Log
            </h3>
            <div className="space-y-2 h-48 overflow-hidden text-xs text-slate-400 font-medium">
              {log.map((m, i) => (
                <p key={i} className={i === 0 ? 'text-indigo-300' : ''}>{m}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Hand / Deck Controls */}
      <footer className="mt-auto pt-6 flex flex-col items-center gap-6">
        <div className="flex items-end justify-center gap-2 lg:gap-4 h-64 relative w-full overflow-visible">
          <AnimatePresence>
            {player.hand.map((card, idx) => (
              <CardUI
                key={`${card.id}-${idx}`}
                card={card}
                onClick={() => {
                  if (phase !== 'PLAYER_TURN') return;
                  if (selectedCard === card) {
                    selectCard(null);
                  } else {
                    selectCard(card);
                  }
                }}
                disabled={phase !== 'PLAYER_TURN' || player.energy < card.cost}
                modifiers={player.oddsModifiers}
                enemyDebuff={enemy?.debuffOdds || 0}
                isSelected={selectedCard === card}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-8 w-full max-w-4xl justify-between border-t border-slate-900 pt-6">
           <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <div className="px-3 py-1 bg-slate-900 rounded-full">DECK: {player.deck.length}</div>
              <div className="px-3 py-1 bg-slate-900 rounded-full">DISCARD: {player.discard.length}</div>
           </div>

           <div className="flex gap-4">
             <AnimatePresence>
               {selectedCard && (
                 <motion.button
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0, opacity: 0 }}
                   onClick={() => playCard(selectedCard)}
                   disabled={player.energy < selectedCard.cost}
                   className="px-12 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-tighter italic transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center gap-2 border-2 border-emerald-400/50"
                 >
                   Play Card
                 </motion.button>
               )}
             </AnimatePresence>

             <button
               onClick={endTurn}
               disabled={phase !== 'PLAYER_TURN'}
               className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-tighter italic transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
             >
               End Turn
             </button>
           </div>
        </div>
      </footer>

      {/* Draft Overlay */}
      {phase === 'DRAFT' && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8">
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="flex flex-col items-center"
           >
             <Trophy size={60} className="text-yellow-500 mb-4" />
             <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-white">Victory!</h2>
             <p className="text-slate-400 mb-12">Choose a card to add to your deck</p>
             
             <div className="flex gap-6">
                {draftOptions.map((card, i) => (
                  <CardUI
                    key={i}
                    card={card}
                    onClick={() => draftCard(card)}
                    modifiers={[]}
                    enemyDebuff={0}
                  />
                ))}
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
