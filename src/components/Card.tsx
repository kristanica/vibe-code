import { motion } from 'framer-motion';
import { Zap, Shield, Swords, Sparkles, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { GameCard, ProbabilityModifier, ProbabilityBreakdown } from '../types/game';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  card: GameCard;
  onClick: () => void;
  onInfoClick?: () => void;
  disabled?: boolean;
  modifiers?: ProbabilityModifier[];
  enemyDebuff?: number;
  playerStatBonus?: number;
  statusModifier?: number;
  relicBonus?: number;
  isSelected?: boolean;
  breakdown?: ProbabilityBreakdown;
}

export function Card({ 
  card, 
  onClick, 
  onInfoClick, 
  disabled, 
  modifiers = [], 
  enemyDebuff = 0, 
  playerStatBonus = 0,
  statusModifier = 0,
  relicBonus = 0,
  isSelected,
  breakdown
}: CardProps) {
  let displayOdds = card.baseOdds;
  let finalOdds = displayOdds;
  let totalBonus = 0;

  if (breakdown) {
    displayOdds = breakdown.baseOdds;
    finalOdds = breakdown.finalOdds;
    totalBonus = breakdown.finalOdds - breakdown.baseOdds;
  } else {
    totalBonus = playerStatBonus + statusModifier + relicBonus;
    displayOdds = Math.max(5, Math.min(100, card.baseOdds + modifiers.reduce((acc, m) => acc + m.value, 0) + enemyDebuff));
    finalOdds = Math.max(5, Math.min(100, displayOdds + totalBonus));
  }
  
  const getProbabilityColor = (odds: number) => {
    if (odds >= 75) return 'text-emerald-400';
    if (odds >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTypeIcon = () => {
    switch (card.type) {
      case 'ATTACK': return <Swords size={14} />;
      case 'DEFENSE': return <Shield size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const isHighRisk = finalOdds < 25;
  const isGuaranteed = finalOdds >= 100;

  return (
    <motion.div 
      layout
      initial={{ y: 200, opacity: 0, scale: 0.5, rotateY: 90 }}
      animate={{ 
        y: isSelected ? -40 : 0, 
        opacity: 1, 
        scale: 1, 
        rotateY: 0,
        x: isHighRisk && !disabled ? [0, -1, 1, -1, 1, 0] : 0
      }}
      transition={isHighRisk && !disabled ? {
        x: { repeat: Infinity, duration: 0.2 },
        type: "spring", stiffness: 260, damping: 20
      } : { type: "spring", stiffness: 260, damping: 20 }}
      exit={{ 
        x: 500, 
        opacity: 0, 
        scale: 0.8, 
        rotate: 15,
        transition: { duration: 0.3 } 
      }}
      whileHover={!disabled && !isSelected ? { y: -20, scale: 1.05 } : {}}
      className="relative w-40 h-56 perspective-1000 group cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl border-2 flex flex-col items-center text-left bg-slate-900 overflow-hidden shadow-2xl transition-all duration-300",
          disabled ? "opacity-50 grayscale border-slate-800" : (isSelected ? "border-indigo-400 ring-4 ring-indigo-500/30" : "border-slate-700 hover:border-indigo-500"),
          isHighRisk && !disabled && !isSelected && "border-red-500/50 shadow-red-500/20 bg-red-950/20",
          isGuaranteed && !disabled && !isSelected && "border-yellow-400 shadow-yellow-400/20 bg-yellow-950/10",
          card.rarity === 'VOLATILE' ? 'ring-2 ring-purple-500/50' : ''
        )}
      >
        {/* Holographic Shine for 100% Cards */}
        {isGuaranteed && !disabled && (
          <motion.div 
            animate={{
              background: [
                "linear-gradient(135deg, transparent 0%, rgba(255,215,0,0.1) 50%, transparent 100%)",
                "linear-gradient(135deg, transparent 100%, rgba(255,215,0,0.1) 150%, transparent 200%)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 z-10 pointer-events-none"
          />
        )}

        {/* Risk Pulsing */}
        {isHighRisk && !disabled && (
          <div className="absolute inset-0 bg-red-600/5 animate-pulse z-0" />
        )}

        {/* Opaque Header Area */}
        <div className="w-full bg-slate-950 border-b border-slate-800 p-2 px-3 flex justify-between items-center relative z-30">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
            {getTypeIcon()} {card.type}
          </span>
          <div className="flex items-center gap-0.5 bg-slate-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold text-[10px]">
            {card.cost} <Zap size={8} className="fill-yellow-400" />
          </div>
        </div>

        {/* Flip Button (Front) */}
        {onInfoClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
            className="absolute bottom-2 left-2 z-40 p-2 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all shadow-lg border border-slate-700 active:scale-90"
            title="Card Intel"
          >
            <Info size={16} />
          </button>
        )}

        {/* Probability Gauge Background */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-indigo-500/10 transition-all duration-700 z-10" 
          style={{ height: `${finalOdds}%` }} 
        />

        <div className="w-full flex-1 flex flex-col justify-center items-center p-3 relative z-20">
          <h3 className="w-full font-black uppercase italic text-center text-sm leading-tight mb-2 tracking-tighter">
            {card.name}
          </h3>
          <div className="flex flex-col items-center">
            <div className={cn("text-4xl font-black italic tracking-tighter leading-none", getProbabilityColor(finalOdds))}>
              {finalOdds}%
            </div>
          </div>
          <div className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mt-2 text-center leading-none">Success Rate</div>
        </div>
      </div>
    </motion.div>
  );
}
