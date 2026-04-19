import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Heart, Zap, Shield } from "lucide-react";
import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusAuras } from "./StatusAuras";
import { StatsModal } from "./StatsModal";
import { useState } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function StatusHeader() {
  const { player, floor, act, isGodMode, toggleGodMode, score, combo } =
    useGameStore();
  const playerControls = useAnimation();
  const energyControls = useAnimation();
  const playControls = useAnimation();
  
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number }[]>([]);
  const [blockNumbers, setBlockNumbers] = useState<{ id: number; value: number }[]>([]);
  const [resourceNumbers, setResourceNumbers] = useState<{ id: number; value: string; color: string }[]>([]);
  
  const prevHp = useRef(player.hp);
  const prevBlock = useRef(player.block);
  const prevEnergy = useRef(player.energy);
  const prevPlays = useRef(player.playsRemaining);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // HP/Damage Tracking
  useEffect(() => {
    if (player.hp < prevHp.current && !isGodMode) {
      const damage = prevHp.current - player.hp;
      playerControls.start({
        x: [0, -10, 10, -10, 10, 0],
        backgroundColor: ["rgba(15, 23, 42, 0.5)", "rgba(239, 68, 68, 0.4)", "rgba(15, 23, 42, 0.5)"],
        transition: { duration: 0.4 },
      });
      const id = Date.now();
      setDamageNumbers((prev) => [...prev, { id, value: damage }]);
      setTimeout(() => setDamageNumbers((prev) => prev.filter((num) => num.id !== id)), 1000);
    }
    prevHp.current = player.hp;
  }, [player.hp, playerControls, isGodMode]);

  // Block/Armor Tracking
  useEffect(() => {
    if (player.block < prevBlock.current && !isGodMode) {
      const blockLost = prevBlock.current - player.block;
      playerControls.start({ scale: [1, 0.95, 1.05, 1], transition: { duration: 0.2 } });
      const id = Date.now() + 1;
      setBlockNumbers((prev) => [...prev, { id, value: blockLost }]);
      setTimeout(() => setBlockNumbers((prev) => prev.filter((num) => num.id !== id)), 1000);
    }
    prevBlock.current = player.block;
  }, [player.block, playerControls, isGodMode]);

  // Energy Gain Tracking
  useEffect(() => {
    if (player.energy > prevEnergy.current) {
      const gained = player.energy - prevEnergy.current;
      energyControls.start({ scale: [1, 1.5, 1], transition: { duration: 0.3 } });
      
      const id = Date.now() + 2;
      setResourceNumbers(prev => [...prev, { id, value: `+${gained} Energy`, color: "text-yellow-400" }]);
      setTimeout(() => setResourceNumbers(prev => prev.filter(n => n.id !== id)), 1000);
    }
    prevEnergy.current = player.energy;
  }, [player.energy, energyControls]);

  // Play Gain Tracking
  useEffect(() => {
    if (player.playsRemaining > prevPlays.current) {
      const gained = player.playsRemaining - prevPlays.current;
      playControls.start({ scale: [1, 1.5, 1], transition: { duration: 0.3 } });
      
      const id = Date.now() + 3;
      setResourceNumbers(prev => [...prev, { id, value: `+${gained} Plays`, color: "text-emerald-400" }]);
      setTimeout(() => setResourceNumbers(prev => prev.filter(n => n.id !== id)), 1000);
    }
    prevPlays.current = player.playsRemaining;
  }, [player.playsRemaining, playControls]);

  return (
    <header className="flex flex-col mb-4 relative">
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />

      {/* Floating Indicators Container */}
      <div className="absolute left-20 top-20 pointer-events-none z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {damageNumbers.map((num) => (
            <motion.div
              key={num.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: 50, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="text-red-500 font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            >
              -{num.value}
            </motion.div>
          ))}
          {blockNumbers.map((num) => (
            <motion.div
              key={num.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: 50, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="text-blue-400 font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
            >
              -{num.value}
            </motion.div>
          ))}
          {resourceNumbers.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 20, y: -40 }}
              exit={{ opacity: 0 }}
              className={cn("font-black text-2xl italic tracking-tighter drop-shadow-lg", res.color)}
            >
              {res.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center w-full mb-3">
        <div className="flex items-center gap-4">
          {/* Player Core Box */}
          <div className="relative">
            <motion.div
              animate={playerControls}
              className="flex items-center gap-4 bg-slate-900 border-2 border-slate-800 p-2 px-4 rounded-2xl shadow-xl relative z-10"
            >
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black uppercase text-rose-500 mb-0.5">
                  Vitality
                </span>
                <div className="flex items-center gap-1.5">
                  <Heart className="text-red-500 fill-red-500" size={14} />
                  <span className="font-black text-xl italic tracking-tighter">
                    {player.hp}
                    <span className="text-slate-500 text-xs not-italic font-bold">
                      /{player.maxHp}
                    </span>
                  </span>
                </div>
              </div>

              <div className="w-px h-8 bg-slate-800" />

              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-[8px] font-black uppercase mb-0.5 transition-colors",
                  player.energy === 0 ? "text-red-500 animate-pulse" : "text-yellow-500"
                )}>
                  {player.energy === 0 ? "Depleted" : "Energy"}
                </span>
                <motion.div animate={energyControls} className="flex items-center gap-1.5">
                  <Zap className={cn(
                    "transition-colors",
                    player.energy === 0 ? "text-red-500 fill-red-500" : "text-yellow-400 fill-yellow-400"
                  )} size={14} />
                  <span className={cn(
                    "font-black text-xl italic tracking-tighter transition-colors",
                    player.energy === 0 ? "text-red-500" : "text-yellow-400"
                  )}>
                    {player.energy}
                    <span className="text-slate-500 text-xs not-italic font-bold">
                      /{player.maxEnergy}
                    </span>
                  </span>
                </motion.div>
              </div>

              <div className="w-px h-8 bg-slate-800" />

              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-[8px] font-black uppercase mb-0.5 transition-colors",
                  player.playsRemaining === 0 ? "text-red-500 animate-pulse" : "text-emerald-400"
                )}>
                  {player.playsRemaining === 0 ? "No Plays" : "Plays"}
                </span>
                <motion.div animate={playControls} className="flex items-center gap-1.5">
                  <span className={cn(
                    "font-black text-xl italic tracking-tighter transition-colors",
                    player.playsRemaining === 0 ? "text-red-500" : "text-emerald-400"
                  )}>
                    {player.playsRemaining}
                    <span className="text-slate-500 text-xs not-italic font-bold">
                      /{player.maxPlays}
                    </span>
                  </span>
                </motion.div>
              </div>

              {player.block > 0 && (
                <>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="flex flex-col items-center animate-bounce-slow">
                    <span className="text-[8px] font-black uppercase text-blue-400 mb-0.5">
                      Armor
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Shield
                        className="text-blue-400 fill-blue-400"
                        size={14}
                      />
                      <span className="font-black text-xl italic tracking-tighter text-blue-400">
                        {player.block}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Position & Level (Condensed) */}
          <div className="flex gap-2">
            <div className="bg-slate-900/50 border border-slate-800 p-2 px-3 rounded-xl flex flex-col justify-center">
              <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-0.5">
                Act {act}
              </span>
              <span className="font-black text-sm italic italic tracking-tight">
                FL {floor}/10
              </span>
            </div>

            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="bg-slate-900/50 border border-slate-800 p-2 px-3 rounded-xl flex flex-col justify-center group hover:border-indigo-500/50 transition-all active:scale-95"
            >
              <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest group-hover:text-indigo-300 transition-colors">
                Level {player.level}
              </span>
              <div className="w-16 h-1.5 bg-slate-950 rounded-full mt-1 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(player.exp / player.nextLevelExp) * 100}%`,
                  }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Combo */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-purple-900/80 border-2 border-purple-500/50 p-2 px-4 rounded-2xl flex items-center gap-3 animate-pulse"
              >
                <div className="text-purple-400 text-xl font-black italic tracking-tighter">
                  x{combo}
                </div>
                <span className="text-[8px] font-black uppercase text-purple-400/60 tracking-[0.2em]">
                  Combo
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score */}
          <div className="bg-slate-900/80 border-2 border-pink-500/30 p-2 px-4 rounded-2xl flex items-center gap-3">
            <div className="text-pink-400 text-xl font-black italic tracking-tighter">
              ★ {score}
            </div>
            <span className="text-[8px] font-black uppercase text-pink-400/60 tracking-[0.2em]">
              Score
            </span>
          </div>

          {/* Chips */}
          <div className="bg-slate-900/80 border-2 border-yellow-600/30 p-2 px-4 rounded-2xl flex items-center gap-3">
            <div className="text-yellow-500 text-xl font-black italic tracking-tighter">
              ♦ {player.chips}
            </div>
            <span className="text-[8px] font-black uppercase text-yellow-600/50 tracking-[0.2em]">
              Credits
            </span>
          </div>

          {/* Mode Toggle */}
          <button
            onClick={toggleGodMode}
            className={cn(
              "px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all flex items-center gap-2",
              isGodMode
                ? "bg-amber-500 border-amber-400 text-slate-950"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300",
            )}
          >
            {isGodMode ? "GOD" : "RUN"}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Effects & Relics */}
      <div className="flex items-center gap-4">
        {/* Buff Tray */}
        <div className="flex-1 h-10 flex items-center px-0 transition-all">
          <StatusAuras statusEffects={player.statusEffects} align="left" />
        </div>

        {/* Relic Tray */}
        {player.relics.length > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/10 p-1 px-2 rounded-xl h-10">
            {player.relics.map((relic) => (
              <div
                key={relic.id}
                className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sm cursor-help group relative hover:border-amber-500/50 transition-colors"
              >
                {relic.icon}

                {/* Relic Tooltip */}
                <div className="absolute top-full right-0 mt-3 w-44 p-3 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[200] scale-95 group-hover:scale-100">
                  <div className="flex justify-between items-center mb-1 border-b border-slate-800 pb-1">
                    <p className="text-[10px] font-black uppercase text-amber-400 tracking-tighter">
                      {relic.name}
                    </p>
                    <span className="text-[7px] font-bold text-slate-500 uppercase">
                      Relic
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight italic">
                    {relic.description}
                  </p>

                  {/* Decor arrow */}
                  <div className="absolute top-[-7px] right-2 w-3 h-3 bg-slate-900 border-l-2 border-t-2 border-slate-700 transform rotate-[45deg]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
