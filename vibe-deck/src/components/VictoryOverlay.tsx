import { motion } from "framer-motion";
import { Trophy, Home, ArrowRight } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

export function VictoryOverlay() {
  const { phase, player, floor } = useGameStore();

  // Show victory only if game ended and player is ALIVE (meaning they beat the boss)
  if (phase !== "ACT_CLEAR") return null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-[300] flex flex-col items-center justify-center p-8 overflow-hidden text-center">
      {/* Background Radiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
        <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 blur-[100px] rounded-full" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-2xl"
      >
        <motion.div
          animate={{ rotateY: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: 1 }}
          className="mb-8 p-8 rounded-full bg-yellow-500/10 border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
        >
          <Trophy size={80} className="text-yellow-500" />
        </motion.div>

        <span className="text-yellow-500 font-black tracking-[0.5em] uppercase text-sm mb-4 block">
          Act Concluded
        </span>
        <h2 className="text-7xl font-black uppercase italic tracking-tighter text-white mb-6">
          The House is Broken
        </h2>
        
        <p className="text-slate-400 text-xl font-medium leading-relaxed mb-12 max-w-lg">
          You've cleaned out the floor boss. But the basement goes deeper, and the stakes only get higher.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Current Chips</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">♦ {player.chips}</span>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Floors Cleared</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">{floor}</span>
           </div>
        </div>

        <div className="flex gap-6 mt-16">
          {/* We'll use a hack to just let them pick a rare card then move on */}
          <button
            onClick={() => {
              // Set phase back to draft to let them pick a card then move to next level
              useGameStore.setState({ phase: 'DRAFT' });
            }}
            className="flex items-center gap-3 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-tighter transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <ArrowRight size={20} />
            Next Level
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-black uppercase italic tracking-tighter transition-all active:scale-95"
          >
            <Home size={20} />
            Exit Run
          </button>
        </div>
      </motion.div>
    </div>
  );
}
