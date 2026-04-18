import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle, Dice5 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface EnemyProps {
  enemy: Enemy;
}

interface FloatingDamage {
  id: number;
  value: number;
}

export function Enemy({ enemy }: EnemyProps) {
  const phase = useGameStore((state) => state.phase);
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const controls = useAnimation();
  const [damageNumbers, setDamageNumbers] = useState<FloatingDamage[]>([]);
  const prevHp = useRef(enemy.hp);

  // Take Damage Animation
  useEffect(() => {
    if (enemy.hp < prevHp.current) {
      const damage = prevHp.current - enemy.hp;
      
      // Trigger Hit Animation (Red flash + Shake)
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        filter: ["brightness(1)", "brightness(2) saturate(2) hue-rotate(-20deg)", "brightness(1)"],
        transition: { duration: 0.3 }
      });

      // Add Floating Damage Number
      const id = Date.now();
      setDamageNumbers(prev => [...prev, { id, value: damage }]);
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(num => num.id !== id));
      }, 1000);
    }
    prevHp.current = enemy.hp;
  }, [enemy.hp, controls]);

  // Attack Animation (Lunge)
  useEffect(() => {
    if (phase === 'ENEMY_TURN') {
      controls.start({
        y: [0, 100, 0], // Lunge towards the player (downwards in this layout)
        scale: [1, 1.2, 1],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
  }, [phase, controls]);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Floating Damage Numbers */}
      <AnimatePresence>
        {damageNumbers.map((num) => (
          <motion.div
            key={num.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 text-red-500 font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none"
            style={{ top: '20%' }}
          >
            -{num.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enemy Sprite / Identifier */}
      <motion.div
        animate={controls}
        className="relative group"
      >
        {/* Floating Idle Animation Wrapper */}
        <motion.div
           animate={{ y: [0, -10, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-red-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-slate-900 border-4 border-slate-800 rounded-3xl flex items-center justify-center relative overflow-hidden">
             {enemy.id === 'thug' && <Skull size={48} className="text-slate-700 lg:scale-150" />}
             {enemy.id === 'card_shark' && <Dice5 size={48} className="text-slate-700 lg:scale-150" />}
             {enemy.id === 'slot_machine' && <AlertTriangle size={48} className="text-slate-700 lg:scale-150" />}
             
             {/* Hit overlay flash */}
             <motion.div 
               animate={{ opacity: [0, 0.4, 0] }}
               transition={{ duration: 0.3 }}
               key={enemy.hp} // Re-run when HP changes
               className="absolute inset-0 bg-red-500 pointer-events-none opacity-0" 
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
           className="absolute -top-4 -right-4 bg-red-600 p-2 rounded-xl border-4 border-slate-950 shadow-xl z-20"
        >
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Intent</span>
            <div className="flex items-center gap-1 font-black text-white italic tracking-tighter uppercase">
              {enemy.intent === 'ATTACK' && (
                <>
                  <Skull size={14} className="fill-white" />
                  <span>{enemy.attack} DMG</span>
                </>
              )}
              {enemy.intent === 'DEBUFF' && (
                 <>
                   <AlertTriangle size={14} className="fill-white" />
                   <span>HAZARD</span>
                 </>
              )}
              {enemy.intent === 'RANDOM' && (
                 <>
                   <Dice5 size={14} className="fill-white" />
                   <span>CHANCE</span>
                 </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center w-full max-w-sm">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-3 text-slate-100">{enemy.name}</h2>
        
        {/* HP Bar */}
        <div className="w-full h-4 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mb-2 relative">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercent}%` }}
            className="h-full bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-overlay">
            {enemy.hp} / {enemy.maxHp} HP
          </div>
        </div>

        {enemy.passiveDescription && (
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/50">
            Passive: {enemy.passiveDescription}
          </p>
        )}
      </div>
    </div>
  );
}
