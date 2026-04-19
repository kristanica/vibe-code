import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";

export function BannerOverlay() {
  const { bannerText } = useGameStore();

  return (
    <AnimatePresence>
      {bannerText && (
        <div className="fixed inset-x-0 top-0 z-[400] flex justify-center pointer-events-none overflow-hidden pt-20">
          {/* Background Wash - subtle gradient from top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 to-transparent backdrop-blur-[1px] h-64"
          />
          
          <motion.div
            initial={{ y: -100, opacity: 0, letterSpacing: "1em" }}
            animate={{ y: 0, opacity: 1, letterSpacing: "0.2em" }}
            exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="relative z-10 flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(79,70,229,0.6)] text-center px-4">
              {bannerText}
            </h2>
            
            {/* Animated Underline */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "80%", opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="h-1 bg-indigo-500 mt-2 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
