import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  Shield, 
  Swords, 
  Zap, 
  Eye, 
  Heart, 
  TrendingUp, 
  Skull, 
  Wind,
  Target
} from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusAurasProps {
  statusEffects: StatusEffect[];
  align?: 'left' | 'center' | 'right';
  tooltipDirection?: 'up' | 'down';
}

export function StatusAuras({ statusEffects, align = 'left', tooltipDirection = 'down' }: StatusAurasProps) {
  if (statusEffects.length === 0) return null;

  const getIcon = (type: StatusEffectType) => {
    switch (type) {
      case 'DODGE': return <Wind size={12} className="text-sky-400" />;
      case 'STRENGTH': return <Swords size={12} className="text-red-500" />;
      case 'SHARP_EYE': return <Eye size={12} className="text-indigo-400" />;
      case 'VULNERABLE': return <Target size={12} className="text-rose-500" />;
      case 'WEAK': return <Skull size={12} className="text-slate-500" />;
      case 'REGEN': return <Heart size={12} className="text-emerald-400" />;
      case 'ARMOR': return <Shield size={12} className="text-blue-400" />;
      case 'DOUBLE_DOWN': return <TrendingUp size={12} className="text-yellow-500" />;
      default: return <Zap size={12} />;
    }
  };

  const getColorClass = (type: StatusEffectType) => {
    switch (type) {
      case 'VULNERABLE': return 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      case 'WEAK': return 'bg-slate-500/20 border-slate-500/40 text-slate-400';
      case 'STRENGTH': return 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'SHARP_EYE': return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
      case 'DODGE': return 'bg-sky-500/20 border-sky-500/40 text-sky-400';
      case 'REGEN': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      case 'ARMOR': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      case 'DOUBLE_DOWN': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse';
      default: return 'bg-slate-800/50 border-slate-700/50 text-slate-300';
    }
  };

  return (
    <div className={cn(
      "flex flex-wrap gap-2 items-center",
      align === 'center' ? "justify-center" : align === 'right' ? "justify-end" : "justify-start"
    )}>
      <AnimatePresence mode="popLayout">
        {statusEffects.map((effect, i) => (
          <motion.div
            key={`${effect.type}-${i}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 shadow-sm group relative cursor-help transition-all hover:scale-110",
              getColorClass(effect.type)
            )}
          >
            <div className="transform group-hover:rotate-12 transition-transform">
              {getIcon(effect.type)}
            </div>
            <span className="text-[11px] font-black tabular-nums">
              {effect.duration}
            </span>

            {/* Tooltip on Hover */}
            <div className={cn(
              "absolute w-44 p-3 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[200] scale-95 group-hover:scale-100",
              tooltipDirection === 'up' ? "bottom-full mb-3" : "top-full mt-3",
              align === 'left' ? "left-0" : align === 'right' ? "right-0" : "left-1/2 -translate-x-1/2"
            )}>
               <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                 <p className="text-xs font-black uppercase tracking-tighter text-white">{effect.name}</p>
                 <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[8px] font-black text-slate-400 uppercase">{effect.duration} Turns</span>
               </div>
               <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                 {effect.type === 'VULNERABLE' && 'Takes 50% more damage from all sources.'}
                 {effect.type === 'WEAK' && 'Deals 25% less damage.'}
                 {effect.type === 'STRENGTH' && `Deals +${effect.value} extra damage per hit.`}
                 {effect.type === 'SHARP_EYE' && `Success rates increased by ${effect.value}%.`}
                 {effect.type === 'DODGE' && `Will block ${effect.value} damage automatically.`}
                 {effect.type === 'REGEN' && `Heals ${effect.value} HP at start of turn.`}
                 {effect.type === 'ARMOR' && `Gains ${effect.value} block every turn start.`}
                 {effect.type === 'DOUBLE_DOWN' && `Your next card play will trigger its effect twice.`}
               </p>
               
               {/* Decorative arrow */}
               <div className={cn(
                 "absolute w-3 h-3 bg-slate-900 border-l-2 border-t-2 border-slate-700 transform rotate-[45deg]",
                 tooltipDirection === 'up' ? "bottom-[-7px] border-l-0 border-t-0 border-r-2 border-b-2" : "top-[-7px]",
                 align === 'left' ? "left-4" : align === 'right' ? "right-4" : "left-1/2 -translate-x-1/2"
               )} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
