import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TurnVisuals() {
  const { bannerText, lastResult } = useGameStore();

  return (
    <>
      {/* TURN BANNER */}
      <AnimatePresence>
        {bannerText && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none"
          >
            <div className="w-full bg-indigo-600/95 backdrop-blur-xl py-3 flex justify-center border-b-4 border-indigo-400/50 shadow-2xl">
              <div className="relative flex items-center">
                {/* Decorative side lines */}
                <div className="absolute right-full mr-8 h-1 w-32 bg-gradient-to-l from-indigo-300 to-transparent" />
                <span className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">
                  {bannerText}
                </span>
                <div className="absolute left-full ml-8 h-1 w-32 bg-gradient-to-r from-indigo-300 to-transparent" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESOLUTION POPUP */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, rotate: -5, scale: 1 }}
            exit={{ x: -100, opacity: 0, transition: { duration: 0.2 } }}
            className="fixed bottom-12 left-12 z-[110] pointer-events-none"
          >
            <div
              className={cn(
                "px-8 py-4 rounded-2xl border-4 transform skew-x-[-12deg] shadow-2xl",
                lastResult === "SUCCESS"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/40"
                  : "bg-red-600 border-red-400 text-white shadow-red-500/40",
              )}
            >
              <span className="text-4xl font-black uppercase italic tracking-tighter drop-shadow-lg">
                {lastResult}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
