import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import type { Relic } from "../types/game";

export function TreasureOverlay() {
  const { phase, treasureOptions, pickTreasure } = useGameStore();

  if (phase !== "TREASURE") return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center max-w-4xl w-full"
      >
        <div className="bg-amber-500/20 p-4 rounded-full mb-6 border border-amber-500/30">
          <Gift size={48} className="text-amber-500" />
        </div>
        
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2 text-white text-center">
          Treasure Found!
        </h2>
        <p className="text-slate-400 mb-12 text-lg">
          Choose a powerful relic to aid your journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {treasureOptions.map((relic: Relic) => (
            <button
              key={relic.id}
              onClick={() => pickTreasure(relic)}
              className="flex flex-col items-center p-8 rounded-3xl border-2 border-slate-800 bg-slate-900/50 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform relative z-10">
                {relic.icon}
              </div>
              
              <h3 className="text-xl font-black uppercase italic mb-2 text-white relative z-10">
                {relic.name}
              </h3>
              
              <p className="text-sm text-slate-400 font-medium text-center leading-relaxed relative z-10">
                {relic.description}
              </p>

              <div className="mt-6 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  {relic.rarity}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
