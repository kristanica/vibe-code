import { useGameStore } from "../store/useGameStore";
import { Card as CardUI } from "../components/Card";
import { Enemy as EnemyUI } from "../components/Enemy";
import { BattleLog } from "../components/BattleLog";
import { DeckViewModal } from "../components/DeckViewModal";
import { FocusedCardModal } from "../components/FocusedCardModal";
import { MapOverlay } from "../components/MapOverlay";
import { ShopOverlay } from "../components/ShopOverlay";
import { EventOverlay } from "../components/EventOverlay";
import { VictoryOverlay } from "../components/VictoryOverlay";
import { StarterSelectOverlay } from "../components/StarterSelectOverlay";
import { DraftOverlay } from "../components/DraftOverlay";
import { LevelUpOverlay } from "../components/LevelUpOverlay";
import { TreasureOverlay } from "../components/TreasureOverlay";
import { StatusHeader } from "../components/StatusHeader";
import { ResolutionVisual } from "../components/ResolutionVisual";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, ScrollText, Skull, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { calculateProbabilityBreakdown } from "../utils/gameEngine";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { ProbabilityMatrixWidget } from "../components/ProbabilityMatrixWidget";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Game() {
  const {
    player,
    enemy,
    phase,
    floor,
    log,
    playCard,
    endTurn,
    startGame,
    selectedCards,
    toggleSelectCard,
    setFocusedCard,
    shuffleHand,
    discardSelected,
    combo,
    isGodMode,
    isTutorialOpen,
    openTutorial,
  } = useGameStore();

  const [isDeckViewOpen, setIsDeckViewOpen] = useState(false);

  useEffect(() => {
    if (phase === "INITIALIZING") {
      startGame();
    }
  }, [phase, startGame]);

  if (phase === "BATTLE_END" && player.hp <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Skull size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-5xl font-black text-red-500 uppercase mb-4 italic tracking-tighter">
          Bad Beat
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          The house always wins. You were eliminated on Floor {floor}.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold uppercase tracking-widest border border-slate-700"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4 lg:p-6 bg-slate-950 relative">
      {isTutorialOpen && <TutorialOverlay />}
      <ResolutionVisual />
      
      {/* Probability Matrix Widget - Bottom Left */}
      <div className="absolute bottom-32 left-6 z-50">
        <ProbabilityMatrixWidget />
      </div>

      <FocusedCardModal />
      <DeckViewModal
        isOpen={isDeckViewOpen}
        onClose={() => setIsDeckViewOpen(false)}
      />
      <MapOverlay />
      <ShopOverlay />
      <EventOverlay />
      <VictoryOverlay />
      <TreasureOverlay />
      <StarterSelectOverlay />
      <DraftOverlay />
      <LevelUpOverlay />

      <div className="flex flex-col h-full w-full max-w-7xl mx-auto">
        {/* Top Section - Fixed Height */}
        <div className="h-32 shrink-0">
          <StatusHeader />
        </div>

        {/* Middle Section - Dynamic but bounded */}
        <main className="flex-1 flex flex-col justify-center items-center relative gap-8 min-h-0">
          <div className="h-[200px] flex items-center justify-center">
            {enemy ? (
              <EnemyUI enemy={enemy} />
            ) : (
              <div className="text-slate-800 font-black text-6xl uppercase italic opacity-20 select-none">
                Probability Deck
              </div>
            )}
          </div>
          <div className="w-full max-w-2xl h-40 shrink-0">
            <BattleLog log={log} />
          </div>
        </main>

        {/* Bottom Section - Fixed Height Footer */}
        <footer className="h-[400px] shrink-0 mt-auto pt-6 flex flex-col items-center gap-6">
          <div className="flex-1 flex items-end justify-center gap-2 lg:gap-4 relative w-full overflow-visible pb-4">
            <AnimatePresence>
              {player.hand.map((card) => {
               const isSelected = selectedCards.some(c => c.instanceId === card.instanceId);

               const breakdown = calculateProbabilityBreakdown(
                 card,
                 player,
                 enemy,
                 combo,
                 isGodMode
               );

               return (
                <CardUI
                  key={card.instanceId}
                  card={card}
                  onClick={() => {
                    if (phase !== "PLAYER_TURN") return;
                    toggleSelectCard(card);
                  }}
                  onInfoClick={() => setFocusedCard(card)}
                  disabled={phase !== "PLAYER_TURN" || player.energy < card.cost}
                  breakdown={breakdown}
                  isSelected={isSelected}
                />
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-8 w-full max-w-4xl justify-between border-t border-slate-900 pt-6">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <button
              onClick={openTutorial}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-yellow-500 hover:text-yellow-400 transition-all flex items-center gap-2"
            >
              <BookOpen size={14} />
              HOW TO PLAY
            </button>
            <button
              onClick={() => setIsDeckViewOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2"
            >
              <ScrollText size={14} />
              VIEW FULL DECK
            </button>
            <div className="w-px h-4 bg-slate-800 mx-2" />
            <div className="px-3 py-1 bg-slate-900/50 rounded-full">
              DECK: {player.deck.length}
            </div>
            <div className="px-3 py-1 bg-slate-900/50 rounded-full">
              DISCARD: {player.discard.length}
            </div>
          </div>

          <div className="flex gap-4">
            {/* DISCARD / SHUFFLE TOOLS */}
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mr-4">
              <button
                onClick={shuffleHand}
                disabled={
                  player.shufflesRemaining <= 0 || phase !== "PLAYER_TURN"
                }
                className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 group"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw
                    size={16}
                    className="text-indigo-400 group-hover:rotate-180 transition-transform duration-500"
                  />
                  <span className="font-black text-[10px] text-white">
                    SHUFFLE
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-1 rounded-full",
                        i < player.shufflesRemaining
                          ? "bg-indigo-500"
                          : "bg-slate-800",
                      )}
                    />
                  ))}
                </div>
              </button>

              <div className="w-px h-8 bg-slate-800 self-center" />

              <button
                onClick={discardSelected}
                disabled={
                  selectedCards.length === 0 ||
                  player.discardsRemaining <= 0 ||
                  phase !== "PLAYER_TURN"
                }
                className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 group"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight
                    size={16}
                    className="text-rose-400 group-hover:translate-x-1 transition-transform"
                  />
                  <span className="font-black text-[10px] text-white">
                    DISCARD
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-1 rounded-full",
                        i < player.discardsRemaining
                          ? "bg-rose-500"
                          : "bg-slate-800",
                      )}
                    />
                  ))}
                </div>
              </button>
            </div>

            <button
              onClick={() => selectedCards.length === 1 && playCard(selectedCards[0])}
              disabled={
                selectedCards.length !== 1 ||
                player.energy < selectedCards[0].cost ||
                phase !== "PLAYER_TURN"
              }
              className="px-12 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-tighter italic transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center gap-2 border-2 border-emerald-400/50"
            >
              Play Card
            </button>

            <button
              onClick={endTurn}
              disabled={phase !== "PLAYER_TURN"}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-tighter italic transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
            >
              End Turn
            </button>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}
