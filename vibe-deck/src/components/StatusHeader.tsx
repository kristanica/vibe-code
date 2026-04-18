import { motion, useAnimation } from "framer-motion";
import { Heart, Zap, Shield } from "lucide-react";
import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusAuras } from "./StatusAuras";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function StatusHeader() {
  const { player, floor, isGodMode, toggleGodMode } = useGameStore();
  const playerControls = useAnimation();
  const prevHp = useRef(player.hp);

  useEffect(() => {
    if (player.hp < prevHp.current && !isGodMode) {
      playerControls.start({
        x: [0, -10, 10, -10, 10, 0],
        backgroundColor: [
          "rgba(15, 23, 42, 0.5)",
          "rgba(239, 68, 68, 0.4)",
          "rgba(15, 23, 42, 0.5)",
        ],
        transition: { duration: 0.4 },
      });
    }
    prevHp.current = player.hp;
  }, [player.hp, playerControls, isGodMode]);

  return (
    <header className="flex flex-col mb-6">
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">
              Status
            </span>
            <motion.div
              animate={playerControls}
              className="flex items-center gap-3 bg-slate-900/50 p-2 px-3 rounded-lg border border-slate-800"
            >
              <div className="flex items-center gap-1.5">
                <Heart className="text-red-500 fill-red-500" size={16} />
                <span className="font-bold text-lg">
                  {player.hp}/{player.maxHp}
                </span>
              </div>
              {player.block > 0 && (
                <>
                  <div className="w-px h-4 bg-slate-800" />
                  <div className="flex items-center gap-1.5">
                    <Shield className="text-blue-400 fill-blue-400" size={16} />
                    <span className="font-bold text-lg text-blue-400">
                      {player.block}
                    </span>
                  </div>
                </>
              )}
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="font-bold text-lg">
                  {player.energy}/{player.maxEnergy}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">
              Position
            </span>
            <div className="p-2 px-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="font-bold text-lg">FLOOR {floor}/10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleGodMode}
            className={cn(
              "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all duration-500 flex items-center gap-2",
              isGodMode 
                ? "bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
                : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              isGodMode ? "bg-slate-950 animate-pulse" : "bg-slate-700"
            )} />
            {isGodMode ? "God Mode On" : "Player Mode"}
          </button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">
              Currency
            </span>
            <span className="font-bold text-xl text-yellow-500 italic uppercase">
              ♦ {player.chips} CHIPS
            </span>
          </div>
        </div>
      </div>

      {/* Active Buffs & Debuffs */}
      <StatusAuras statusEffects={player.statusEffects} align="left" />
    </header>
  );
}
