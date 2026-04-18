import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card as CardUI } from "./Card";
import { useGameStore } from "../store/useGameStore";

export function StarterSelectOverlay() {
  const { 
    phase, 
    starterPicksRemaining, 
    draftOptions, 
    pickStarterCard, 
    setFocusedCard,
    player
  } = useGameStore();

  if (phase !== "STARTER_SELECT") return null;

  const relicBonus = player.relics.reduce((acc, r) => r.effect.type === 'GLOBAL_SUCCESS_CHANCE' ? acc + r.effect.value : acc, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center w-full max-w-6xl"
      >
        <div className="mb-12 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block p-4 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/40 mb-6"
          >
            <Sparkles size={48} className="text-indigo-400" />
          </motion.div>
          <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4 text-white">
            Assemble Your Deck
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-slate-800" />
            <p className="text-indigo-400 font-black uppercase tracking-widest text-sm">
              Select {starterPicksRemaining} More Cards
            </p>
            <div className="h-px w-24 bg-slate-800" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 px-4">
          <AnimatePresence mode="popLayout">
            {draftOptions.map((card) => (
              <motion.div
                key={card.instanceId}
                layout
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -50 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative"
              >
                <CardUI
                  card={card}
                  onClick={() => pickStarterCard(card)}
                  onInfoClick={() => setFocusedCard(card)}
                  modifiers={[]}
                  enemyDebuff={0}
                  playerStatBonus={player.stats.successRateBonus}
                  relicBonus={relicBonus}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-md text-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Your core deck already contains{" "}
            <span className="text-white">5 Safe Strikes</span> and{" "}
            <span className="text-white">2 Dodges</span>. Choose
            carefully—these cards define your early game survival.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
