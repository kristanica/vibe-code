import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import { calculateSuccessOdds } from "../utils/gameEngine";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ResolutionVisual() {
  const { phase, resolvingCard, rollValue, player, enemy, combo, isGodMode } = useGameStore();
  const [displayValue, setDisplayValue] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Anticipation-based ticker effect
  useEffect(() => {
    if (phase === "RESOLUTION" && resolvingCard) {
      setIsFinished(false);
      let ticks = 0;
      const totalTicks = 30; // Increased from 20 for more tension
      
      const interval = setInterval(() => {
        // High-speed random numbers
        setDisplayValue(Math.floor(Math.random() * 100) + 1);
        ticks++;

        if (ticks >= totalTicks) {
          clearInterval(interval);
          setDisplayValue(Math.floor(rollValue || 0));
          setIsFinished(true);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [phase, resolvingCard, rollValue]);

  if (phase !== "RESOLUTION" || !resolvingCard) return null;

  const targetOdds = calculateSuccessOdds(resolvingCard, player, enemy, combo, isGodMode);
  const isSuccess = (rollValue || 0) <= targetOdds;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-12"
      >
        {/* The Rolling Card */}
        <motion.div
          animate={isFinished ? { 
            scale: isSuccess ? [1, 1.05, 1] : [1, 0.9, 0],
            rotate: isSuccess ? [0, -2, 2, 0] : [0, 5, -5, 0],
            opacity: isSuccess ? 1 : 0
          } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className={cn(
            "bg-slate-900 border-4 rounded-3xl p-10 shadow-2xl w-72 h-96 flex flex-col items-center justify-center text-center gap-6 transition-colors duration-500",
            isFinished 
              ? (isSuccess ? "border-emerald-500/50 shadow-emerald-500/20" : "border-rose-500/50 shadow-rose-500/20")
              : "border-indigo-500/50"
          )}>
             <span className="text-[12px] font-black uppercase text-indigo-400 tracking-[0.4em] mb-2">
               Vibe Check
             </span>
             <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
               {resolvingCard.name}
             </h2>
             
             {/* The Ticker Area */}
             <div className="relative flex flex-col items-center justify-center my-6">
                <motion.div 
                  key={displayValue}
                  initial={isFinished ? { scale: 1.2, y: 0 } : { y: 10, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className={cn(
                    "text-8xl font-black italic tracking-tighter tabular-nums leading-none",
                    isFinished 
                      ? (isSuccess ? "text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]" : "text-rose-500")
                      : "text-white opacity-80"
                  )}
                >
                  {displayValue}
                </motion.div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">
                   {isFinished ? "Final Roll" : "Scanning Universe..."}
                </div>
             </div>

             {/* The Target Bar */}
             <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</span>
                  <span className="text-sm font-black text-indigo-400 italic">≤ {targetOdds}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${targetOdds}%` }}
                    className={cn(
                      "h-full transition-colors duration-500",
                      isFinished && !isSuccess ? "bg-rose-900" : "bg-indigo-500"
                    )}
                  />
                </div>
             </div>
          </div>
        </motion.div>

        {/* Result Splash */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className={cn(
                  "text-7xl font-black uppercase italic tracking-tighter drop-shadow-2xl",
                  isSuccess ? "text-emerald-400" : "text-rose-500"
                )}
              >
                {isSuccess ? "SUCCESS" : "FAILED"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
