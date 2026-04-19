import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Swords, Shield, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { calculateProbabilityBreakdown } from "../utils/gameEngine";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function FocusedCardModal() {
  const { focusedCard, setFocusedCard, player, enemy, combo, isGodMode } = useGameStore();
  const [isFlipped, setIsFlipped] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ATTACK":
        return <Swords size={16} />;
      case "DEFENSE":
        return <Shield size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const getProbabilityColor = (odds: number) => {
    if (odds >= 75) return "text-emerald-400";
    if (odds >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  // Calculate accurate odds using new engine
  const breakdown = focusedCard 
    ? calculateProbabilityBreakdown(focusedCard, player, enemy, combo, isGodMode)
    : null;
  const finalOdds = breakdown ? breakdown.finalOdds : 0;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [focusedCard]);

  return (
    <AnimatePresence>
      {focusedCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFocusedCard(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.5, rotateY: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1, rotateY: isFlipped ? 180 : 0, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, rotateY: 0, opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full max-w-sm h-[550px] perspective-2000"
          >
            {/* FRONT SIDE (Intel & Effects) */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 bg-slate-900 border-4 border-indigo-500/50 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] flex flex-col overflow-hidden"
            >
              <div className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400">
                    {getTypeIcon(focusedCard.type)}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Card Intel
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                  >
                    Flip Card
                  </button>
                  <button
                    onClick={() => setFocusedCard(null)}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar select-text z-10">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2 leading-none">
                  {focusedCard.name}
                </h2>
                <p className="text-slate-400 font-bold italic mb-8 text-sm leading-relaxed border-l-2 border-indigo-500/30 pl-4">
                  "{focusedCard.description}"
                </p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                      Success Outcome
                    </h3>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                      {focusedCard.successEffect.damage && (
                        <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                          <span className="text-emerald-200/60 font-bold text-xs uppercase">
                            Deal Damage
                          </span>
                          <span className="text-emerald-400 font-black text-2xl italic tracking-tighter">
                            {focusedCard.successEffect.damage}
                          </span>
                        </div>
                      )}
                      {focusedCard.successEffect.block && (
                        <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                          <span className="text-emerald-200/60 font-bold text-xs uppercase">
                            Gain Block
                          </span>
                          <span className="text-emerald-400 font-black text-2xl italic tracking-tighter">
                            {focusedCard.successEffect.block}
                          </span>
                        </div>
                      )}
                      {focusedCard.successEffect.energy && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-300/60 font-bold text-xs uppercase">
                            Gain Energy
                          </span>
                          <span className="text-yellow-400 font-black text-2xl italic tracking-tighter">
                            +{focusedCard.successEffect.energy}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black uppercase text-rose-400 tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />{" "}
                      Failure Outcome
                    </h3>
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                      {focusedCard.failEffect &&
                      !focusedCard.failEffect.nothing ? (
                        <>
                          {focusedCard.failEffect.damage && (
                            <div className="flex justify-between items-center border-b border-rose-500/10 pb-3">
                              <span className="text-rose-200/60 font-bold text-xs uppercase">
                                Still Deal
                              </span>
                              <span className="text-rose-400 font-black text-2xl italic tracking-tighter">
                                {focusedCard.failEffect.damage}
                              </span>
                            </div>
                          )}
                          {focusedCard.failEffect.takeDamage && (
                            <div className="flex justify-between items-center">
                              <span className="text-rose-200/60 font-bold text-xs uppercase">
                                Self Damage
                              </span>
                              <span className="text-rose-500 font-black text-2xl italic tracking-tighter">
                                -{focusedCard.failEffect.takeDamage} HP
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-500 font-bold italic text-xs py-2">
                          Nothing happens. You whiff.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="bg-slate-950 p-4 border-t border-slate-800 z-20 flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Probability Matrix
                  </span>
                  
                  {breakdown && (
                    <div className="space-y-1 mb-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Base Odds</span>
                        <span>{breakdown.baseOdds}%</span>
                      </div>
                      {breakdown.layers.map((layer, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                          <span className={layer.value >= 0 ? "text-indigo-300" : "text-rose-400"}>{layer.name}</span>
                          <span className={layer.value >= 0 ? "text-indigo-400" : "text-rose-500"}>
                            {layer.value > 0 ? "+" : ""}{layer.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-3xl font-black italic tracking-tighter leading-none",
                          getProbabilityColor(finalOdds),
                        )}
                      >
                        {finalOdds}%
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {focusedCard.rarity}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK SIDE (Original Card Face) */}
            <div
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              className="absolute inset-0 bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 gap-6 shadow-2xl"
            >
              <button
                onClick={() => setIsFlipped(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              
              <div className="p-6 rounded-full bg-slate-800 text-indigo-400">
                {getTypeIcon(focusedCard.type)}
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white text-center">
                {focusedCard.name}
              </h3>
              <div className="w-16 h-1.5 bg-indigo-500/50 rounded-full" />
              <p className="text-slate-400 font-bold uppercase text-center tracking-widest text-xs">
                Class: {focusedCard.rarity}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
