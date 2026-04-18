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
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
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
            <div
              className={cn(
                "px-12 py-6 rounded-3xl border-8 transform skew-x-[-12deg] shadow-2xl",
                lastResult === "SUCCESS"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/40"
                  : "bg-red-600 border-red-400 text-white shadow-red-500/40",
              )}
            >
              <span className="text-6xl font-black uppercase italic tracking-tighter drop-shadow-lg">
                {lastResult}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
