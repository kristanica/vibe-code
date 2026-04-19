import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Skull, AlertTriangle, Dice5, Shield, Sparkles, Swords, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { StatusAuras } from "./StatusAuras";
import type { Enemy } from "../types/game";

interface EnemyProps {
  enemy: Enemy;
}

interface FloatingDamage {
  id: number;
  value: number;
}

export function Enemy({ enemy }: EnemyProps) {
  const { phase, bannerText, isGodMode, instaWin } = useGameStore();
  const [isIntentHovered, setIsIntentHovered] = useState(false);
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const controls = useAnimation();
  const [damageNumbers, setDamageNumbers] = useState<FloatingDamage[]>([]);
  const [blockNumbers, setBlockNumbers] = useState<FloatingDamage[]>([]);
  const prevHp = useRef(enemy.hp);
  const prevBlock = useRef(enemy.block);

  // Take Damage Animation (HP)
  useEffect(() => {
    if (enemy.hp < prevHp.current && !isGodMode) {
      const damage = prevHp.current - enemy.hp;

      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        filter: [
          "brightness(1)",
          "brightness(2) saturate(2) hue-rotate(-20deg)",
          "brightness(1)",
        ],
        transition: { duration: 0.3 },
      });

      const id = Date.now();
      setDamageNumbers((prev) => [...prev, { id, value: damage }]);
      setTimeout(() => {
        setDamageNumbers((prev) => prev.filter((num) => num.id !== id));
      }, 1000);
    }
    prevHp.current = enemy.hp;
  }, [enemy.hp, controls, isGodMode]);

  // Block Hit Animation
  useEffect(() => {
    if (enemy.block < prevBlock.current && !isGodMode) {
      const blockLost = prevBlock.current - enemy.block;

      controls.start({
        scale: [1, 0.95, 1.05, 1],
        transition: { duration: 0.2 },
      });

      const id = Date.now() + 1; // Unique ID
      setBlockNumbers((prev) => [...prev, { id, value: blockLost }]);
      setTimeout(() => {
        setBlockNumbers((prev) => prev.filter((num) => num.id !== id));
      }, 1000);
    }
    prevBlock.current = enemy.block;
  }, [enemy.block, controls, isGodMode]);

  // Context-Aware Action Animations
  useEffect(() => {
    // Only animate if it's the enemy's turn AND the banner has finished
    if (phase === "ENEMY_TURN" && !bannerText && enemy.animationState && enemy.animationState !== "idle") {
      if (enemy.animationState === "light") {
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.3 },
        });
      } else if (enemy.animationState === "heavy") {
        controls.start({
          y: [0, -20, 80, 0],
          scale: [1, 1.1, 1.2, 1],
          transition: { duration: 0.6, ease: "backIn" },
        });
      } else if (enemy.animationState === "combo") {
        controls.start({
          x: [0, -15, 15, -15, 15, 0],
          transition: { duration: 0.5 },
        });
      } else if (enemy.animationState === "defend") {
        controls.start({
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.5 },
        });
      } else if (enemy.animationState === "cast") {
        controls.start({
          y: [0, -30, 0],
          filter: ["hue-rotate(0deg)", "hue-rotate(180deg)", "hue-rotate(0deg)"],
          transition: { duration: 0.8 },
        });
      }
    }
  }, [phase, bannerText, enemy.animationState, controls]);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Floating Damage Numbers (HP) */}
      <AnimatePresence>
        {damageNumbers.map((num) => (
          <motion.div
            key={num.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 text-red-500 font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none"
            style={{ top: "20%" }}
          >
            -{num.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating Block Numbers (Armor) */}
      <AnimatePresence>
        {blockNumbers.map((num) => (
          <motion.div
            key={num.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 text-blue-400 font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] pointer-events-none"
            style={{ top: "20%" }}
          >
            -{num.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enemy Sprite / Identifier */}
      <motion.div animate={controls} className="relative group">
        {/* Floating Idle Animation Wrapper */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-red-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-slate-900 border-4 border-slate-800 rounded-3xl flex items-center justify-center relative overflow-hidden">
            {enemy.id === "thug" && (
              <Skull size={48} className="text-slate-700 lg:scale-150" />
            )}
            {enemy.id === "card_shark" && (
              <Dice5 size={48} className="text-slate-700 lg:scale-150" />
            )}
            {enemy.id === "slot_machine" && (
              <AlertTriangle
                size={48}
                className="text-slate-700 lg:scale-150"
              />
            )}
            {enemy.id === "pit_boss" && (
              <Skull size={48} className="text-red-900 lg:scale-150" />
            )}
            {enemy.id === "bouncer" && (
              <Shield size={48} className="text-slate-700 lg:scale-150" />
            )}
            {enemy.id === "enforcer" && (
              <Swords size={48} className="text-slate-700 lg:scale-150" />
            )}
            {enemy.id === "dealer" && (
              <Sparkles size={48} className="text-indigo-900 lg:scale-150" />
            )}

            {/* Hit overlay flash (HP) */}
            <motion.div
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.3 }}
              key={`hp-${enemy.hp}`}
              className="absolute inset-0 bg-red-500 pointer-events-none opacity-0"
            />

            {/* Hit overlay flash (Block) */}
            <motion.div
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.3 }}
              key={`block-${enemy.block}`}
              className="absolute inset-0 bg-blue-500 pointer-events-none opacity-0"
            />

            {/* Animated Pulse */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-4 border-red-500/10 rounded-3xl"
            />
          </div>
        </motion.div>

        {/* Intent Indicator */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={enemy.intent}
          onMouseEnter={() => setIsIntentHovered(true)}
          onMouseLeave={() => setIsIntentHovered(false)}
          className="absolute -top-4 -right-4 bg-red-600 p-2 rounded-xl border-4 border-slate-950 shadow-xl z-20 cursor-help"
        >
          <div className="flex flex-col items-center min-w-[70px]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                Intent
              </span>
              <Info size={10} className="text-white/50" />
            </div>
            
            <div className="flex items-center gap-1 font-black text-white italic tracking-tighter uppercase">
              {enemy.intent === "ATTACK" && (
                <>
                  <Skull size={14} className="fill-white" />
                  <span>
                    {enemy.attack}
                    {enemy.moves[enemy.nextMoveIndex]?.hits && enemy.moves[enemy.nextMoveIndex].hits! > 1 
                      ? `x${enemy.moves[enemy.nextMoveIndex].hits}` 
                      : ''} DMG
                  </span>
                </>
              )}
              {enemy.intent === "BLOCK" && (
                <>
                  <Shield size={14} className="fill-white" />
                  <span>{enemy.moves[enemy.nextMoveIndex]?.value || 0} DEF</span>
                </>
              )}
              {enemy.intent === "DEBUFF" && (
                <>
                  <AlertTriangle size={14} className="fill-white" />
                  <span>DEBUFF</span>
                </>
              )}
              {enemy.intent === "BUFF" && (
                <>
                  <Sparkles size={14} className="fill-white" />
                  <span>BUFF</span>
                </>
              )}
              {enemy.intent === "SPECIAL" && (
                <>
                  <Sparkles size={14} className="fill-white" />
                  <span>SPECIAL</span>
                </>
              )}
            </div>
          </div>

          {/* Intent Tooltip */}
          <AnimatePresence>
            {isIntentHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 20 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-full top-0 ml-4 w-48 p-3 bg-slate-900 border-2 border-red-500/50 rounded-2xl shadow-2xl z-50 pointer-events-none"
              >
                <div className="text-[10px] font-black uppercase text-red-400 mb-1 tracking-widest border-b border-red-500/20 pb-1">
                   {enemy.intent} Move
                </div>
                <p className="text-[11px] font-bold text-slate-200 leading-tight italic">
                   {enemy.moves[enemy.nextMoveIndex]?.description || "Prepares a standard action."}
                </p>
                {enemy.moves[enemy.nextMoveIndex]?.secondaryIntent && (
                  <div className="mt-2 text-[9px] font-black text-white/60 uppercase">
                    Also: {enemy.moves[enemy.nextMoveIndex].secondaryIntent}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Block Indicator */}
        {enemy.block > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-lg border-2 border-slate-950 shadow-lg z-20 flex items-center gap-1"
          >
            <Shield size={12} className="fill-white text-white" />
            <span className="font-bold text-white text-xs">{enemy.block}</span>
          </motion.div>
        )}
      </motion.div>

      <div className="flex flex-col items-center w-full max-w-sm">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-3 text-slate-100">
          {enemy.name}
        </h2>

        {/* HP Bar */}
        <div className="w-full h-5 bg-slate-950 border-2 border-slate-800 rounded-full overflow-hidden mb-2 relative shadow-inner">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${hpPercent}%` }}
            className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-orange-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">
              {enemy.hp} / {enemy.maxHp} HP
            </span>
          </div>
        </div>

        {enemy.passiveDescription && (
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/50 mt-2">
            Passive: {enemy.passiveDescription}
          </p>
        )}

        <StatusAuras statusEffects={enemy.statusEffects} align="center" tooltipDirection="up" />

        {isGodMode && (
          <button
            onClick={instaWin}
            className="mt-6 px-4 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-500 border border-red-900/50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            DEBUG: KILL ENEMY
          </button>
        )}
      </div>
    </div>
  );
}
