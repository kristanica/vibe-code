import { motion, AnimatePresence } from "framer-motion";
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

interface StatusAurasProps {
  statusEffects: StatusEffect[];
  align?: 'left' | 'center' | 'right';
}

export function StatusAuras({ statusEffects, align = 'left' }: StatusAurasProps) {
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
      case 'VULNERABLE': return 'bg-rose-500/10 border-rose-500/30';
      case 'WEAK': return 'bg-slate-500/10 border-slate-500/30';
      case 'STRENGTH': return 'bg-red-500/10 border-red-500/30';
      case 'SHARP_EYE': return 'bg-indigo-500/10 border-indigo-500/30';
      default: return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${
      align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
    }`}>
      <AnimatePresence>
        {statusEffects.map((effect, i) => (
          <motion.div
            key={`${effect.type}-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm group relative cursor-help transition-all hover:scale-110 ${getColorClass(effect.type)}`}
          >
            {getIcon(effect.type)}
            <span className="text-[10px] font-black text-white tabular-nums">
              {effect.duration}
            </span>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
               <p className="text-[9px] font-black uppercase tracking-tighter text-indigo-400 mb-1">{effect.name}</p>
               <p className="text-[8px] font-bold text-slate-400 leading-tight">
                 {effect.type === 'VULNERABLE' && 'Takes 50% more damage from all sources.'}
                 {effect.type === 'WEAK' && 'Deals 25% less damage.'}
                 {effect.type === 'STRENGTH' && `Deals +${effect.value} extra damage.`}
                 {effect.type === 'SHARP_EYE' && `+${effect.value}% card success rate.`}
                 {effect.type === 'DODGE' && `Gains ${effect.value} block automatically.`}
                 {effect.type === 'REGEN' && `Heals ${effect.value} HP at start of turn.`}
               </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
