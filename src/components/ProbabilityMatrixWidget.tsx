import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { Target, AlertCircle, Flame, Activity, Info, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ProbabilityMatrixWidget() {
  const { player, combo, enemy, act } = useGameStore();
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const comboBonus = Math.min(10, combo * 2);
  const pityBonus = Math.min(25, player.failureStreak * 5);
  const entropyPenalty = Math.floor(-player.entropy / 2);
  
  const successStat = player.stats.successRateBonus;
  const relicBonus = player.relics.reduce((acc, r) => 
    r.effect.type === 'GLOBAL_SUCCESS_CHANCE' ? acc + r.effect.value : acc, 0
  );

  const houseEdge = enemy?.debuffOdds || 0;

  const stats = [
    {
      id: "stat",
      name: "Base Stat",
      value: `+${successStat}%`,
      color: "text-emerald-400",
      icon: <Star size={12} className="text-emerald-400" />,
      description: "Permanent bonus from Level-Up stats. Carries over between battles."
    },
    {
      id: "relic",
      name: "Relic Bonus",
      value: `+${relicBonus}%`,
      color: "text-yellow-400",
      icon: <Trophy size={12} className="text-yellow-400" />,
      description: "Passive bonus from your collected Relics. Carries over between battles."
    },
    {
      id: "house",
      name: "House Edge",
      value: `${houseEdge}%`,
      color: "text-rose-400",
      icon: <Activity size={12} className="text-rose-400" />,
      description: `The House always wins. Includes Act ${act} difficulty penalty.`
    },
    {
      id: "combo",
      name: "Combo",
      value: `+${comboBonus}%`,
      color: "text-purple-400",
      icon: <Target size={12} className="text-purple-400" />,
      description: "Building momentum. +2% Success per active combo (Max +10%). Resets on any failure."
    },
    {
      id: "pity",
      name: "Pity",
      value: `+${pityBonus}%`,
      color: "text-blue-400",
      icon: <AlertCircle size={12} className="text-blue-400" />,
      description: "Bad luck protection. +5% Success per consecutive failure (Max +25%). Resets on any success."
    },
    {
      id: "entropy",
      name: "Entropy",
      value: `${entropyPenalty}%`,
      color: "text-orange-400",
      icon: <Flame size={12} className="text-orange-400" />,
      description: "The cost of winning. +1 Entropy per success. Each point reduces success by 0.5%."
    }
  ];

  const totalGlobalModifier = successStat + relicBonus + houseEdge + comboBonus + pityBonus + entropyPenalty;

  return (
    <div className="relative group/matrix">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:flex flex-col gap-2 p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl w-52 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 mb-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Prob Matrix
            </span>
          </div>
          <Info size={12} className="text-slate-600 animate-pulse" />
        </div>

        {stats.map((stat) => (
          <div 
            key={stat.id}
            onMouseEnter={() => setHoveredStat(stat.id)}
            onMouseLeave={() => setHoveredStat(null)}
            className="flex items-center justify-between cursor-help group/stat py-0.5"
          >
            <div className="flex items-center gap-2">
              {stat.icon}
              <span className="text-[9px] font-bold text-slate-500 uppercase group-hover/stat:text-slate-300 transition-colors">
                {stat.name}
              </span>
            </div>
            <motion.span 
              key={stat.value}
              initial={{ scale: 1.5, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("text-[10px] font-black", stat.color)}
            >
              {stat.value}
            </motion.span>
          </div>
        ))}

        {/* Global Net Modifier */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-500/30">
          <span className="text-[10px] font-black uppercase text-indigo-300 italic tracking-tighter">
            Net Modifier
          </span>
          <motion.span 
            key={totalGlobalModifier}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "text-[11px] font-black italic",
              totalGlobalModifier >= 0 ? "text-indigo-400" : "text-rose-500"
            )}
          >
            {totalGlobalModifier > 0 ? "+" : ""}{totalGlobalModifier}%
          </motion.span>
        </div>

        {/* Dynamic Tooltip */}
        <div className="h-10 mt-1 pt-2 border-t border-slate-800/50 overflow-hidden">
          <p className="text-[8px] leading-tight text-slate-500 font-bold uppercase italic">
            {hoveredStat 
              ? stats.find(s => s.id === hoveredStat)?.description 
              : "Hover for details • Stats tracked real-time."
            }
          </p>
        </div>
      </motion.div>
    </div>
  );
}
