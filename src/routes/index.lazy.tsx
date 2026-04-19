import { Link } from "@tanstack/react-router";
import { useGameStore } from "../store/useGameStore";
import {
  Play,
  Info,
  X,
  HelpCircle,
  Zap,
  Swords,
  Shield,
  Dice5,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Index() {
  const startGame = useGameStore((state) => state.startGame);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950 text-slate-50 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 uppercase italic leading-none"
        >
          Probability Deck
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 max-w-md mx-auto font-medium"
        >
          Manipulate the odds, build your deck, and escape the collapsing
          casino.
        </motion.p>
      </div>

      <div className="grid gap-4 w-full max-w-xs relative z-10">
        <Link
          to="/game"
          onClick={() => startGame()}
          className="group flex items-center justify-between p-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
        >
          <span className="font-black text-xl uppercase italic tracking-tighter">
            Start Run
          </span>
          <Play className="fill-white group-hover:translate-x-1 transition-transform" />
        </Link>

        <button
          onClick={() => setShowTutorial(true)}
          className="group flex items-center justify-between p-5 bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all border border-slate-800 hover:border-slate-700 shadow-lg"
        >
          <span className="font-black uppercase italic tracking-tighter text-slate-300 group-hover:text-white">
            How to Play
          </span>
          <HelpCircle className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>

        <button className="group flex items-center justify-between p-5 bg-slate-900/50 opacity-50 cursor-not-allowed rounded-2xl border border-slate-800">
          <span className="font-black uppercase italic tracking-tighter text-slate-500">
            Collection
          </span>
          <Info size={20} className="text-slate-600" />
        </button>
      </div>

      <footer className="mt-24 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
        v0.1.0-mvp • 🎰 Good luck, Gambler.
      </footer>

      {/* HOW TO PLAY MODAL */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTutorial(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-indigo-400">
                  Rules of the House
                </h2>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <section className="flex gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl h-fit">
                    <Zap className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs text-indigo-300 mb-1 tracking-widest">
                      Energy & Flow
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      You have 10 energy per floor. Unused plays stack across
                      turns, allowing for massive combos!
                    </p>
                  </div>
                </section>

                <section className="flex gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl h-fit">
                    <Dice5 className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs text-emerald-300 mb-1 tracking-widest">
                      Transparent Odds
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Success is a formula. View the{" "}
                      <span className="text-indigo-400 font-bold">
                        Probability Matrix
                      </span>{" "}
                      to see how Combo (+2%/win) and Pity (+5%/fail) affect your
                      rolls.
                    </p>
                  </div>
                </section>

                <section className="flex gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl h-fit">
                    <Flame className="text-orange-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs text-orange-300 mb-1 tracking-widest">
                      Entropy
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Winning has a cost. Every success adds 1 Entropy, reducing
                      your success rate by 0.5% for the rest of the battle.
                    </p>
                  </div>
                </section>

                <section className="flex gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl h-fit">
                    <Shield className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs text-purple-300 mb-1 tracking-widest">
                      Persistence
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Energy, Discards, and Shuffles carry over between floors.
                      Spend them wisely to survive the Pit Boss.
                    </p>
                  </div>
                </section>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-10 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black uppercase italic tracking-tighter transition-colors border border-slate-700"
              >
                Got it, Let's Gamble
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
