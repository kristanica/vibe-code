import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Wallet } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function EventOverlay() {
  const { phase, currentEvent, player, resolveEventOption } = useGameStore();

  if (phase !== "EVENT" || !currentEvent) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[140] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-2xl bg-slate-900 border-2 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Event Banner */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           <Sparkles size={48} className="text-white/20 animate-pulse" />
        </div>

        <div className="p-12 pt-10 flex flex-col items-center text-center">
          <span className="text-indigo-400 font-black tracking-[0.4em] uppercase text-[10px] mb-4">
            Random Encounter
          </span>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
            {currentEvent.title}
          </h2>
          
          <div className="w-16 h-1 bg-indigo-500 rounded-full mb-8" />

          <p className="text-slate-300 text-lg font-medium leading-relaxed mb-12 italic border-l-4 border-slate-800 pl-6 text-left">
            "{currentEvent.description}"
          </p>

          <div className="w-full space-y-4">
            {currentEvent.options.map((option, i) => {
              const canAfford = !option.cost || player.chips >= option.cost;
              
              return (
                <button
                  key={i}
                  disabled={!canAfford}
                  onClick={() => resolveEventOption(option)}
                  className={cn(
                    "w-full p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                    canAfford
                      ? "bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 text-white"
                      : "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                       {option.label}
                       {option.cost && (
                         <span className="flex items-center gap-1 text-xs text-yellow-500 not-italic bg-yellow-500/10 px-2 py-0.5 rounded-full ml-2">
                           <Wallet size={12} /> {option.cost} Chips
                         </span>
                       )}
                    </span>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                      {option.description}
                    </span>
                  </div>
                  <ArrowRight size={20} className={cn(
                    "transition-transform group-hover:translate-x-2",
                    canAfford ? "text-indigo-400" : "text-slate-800"
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        <footer className="bg-slate-950/50 p-6 text-center border-t border-slate-800">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
             Decisions have consequences. Choose wisely.
           </p>
        </footer>
      </motion.div>
    </div>
  );
}
