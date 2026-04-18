import { motion } from 'framer-motion';
import { Zap, Shield, Swords, Sparkles, Info, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  card: GameCard;
  onClick: () => void;
  disabled?: boolean;
  modifiers: ProbabilityModifier[];
  enemyDebuff: number;
  isSelected?: boolean;
}

export function Card({ card, onClick, disabled, modifiers, enemyDebuff, isSelected }: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const finalOdds = Math.max(5, Math.min(100, card.baseOdds + modifiers.reduce((acc, m) => acc + m.value, 0) + enemyDebuff));
  
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

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-40 h-56 perspective-1000 group">
      <motion.div
        layout
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 180 : 0, 
          y: isSelected ? -40 : (isFlipped ? 0 : 0)
        }}
        whileHover={!disabled && !isFlipped && !isSelected ? { y: -20 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative cursor-pointer"
        onClick={onClick}
      >
        {/* FRONT FACE */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border-2 p-3 flex flex-col items-center text-left bg-slate-900 overflow-hidden shadow-2xl transition-colors duration-300",
            disabled ? "opacity-50 grayscale border-slate-800" : (isSelected ? "border-indigo-400 ring-4 ring-indigo-500/30" : "border-slate-700 hover:border-indigo-500"),
            card.rarity === 'VOLATILE' ? 'ring-2 ring-purple-500/50' : ''
          )}
        >
          {/* Flip Button (Front) */}
          <button
            onClick={handleFlip}
            className="absolute top-2 left-2 z-20 p-1 rounded-md bg-slate-800/80 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
            title="Card Intel"
          >
            <Info size={14} />
          </button>

          {/* Probability Gauge Background */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-indigo-500/10 transition-all duration-500" 
            style={{ height: `${finalOdds}%` }} 
          />

          <div className="w-full flex justify-end items-start mb-2 relative z-10">
            <div className="flex items-center gap-0.5 bg-slate-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold text-xs">
              {card.cost} <Zap size={10} className="fill-yellow-400" />
            </div>
          </div>

          <span className="w-full text-[10px] font-black uppercase text-slate-500 tracking-tighter flex items-center gap-1 mb-1 relative z-10">
            {getTypeIcon()} {card.type}
          </span>

          <h3 className="w-full font-black uppercase italic text-sm leading-tight mb-2 tracking-tighter relative z-10">
            {card.name}
          </h3>

          <div className="w-full flex-1 flex flex-col justify-center items-center relative z-10">
            <div className={cn("text-3xl font-black italic tracking-tighter mb-1", getProbabilityColor(finalOdds))}>
              {finalOdds}%
            </div>
            <div className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">Success Rate</div>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{ transform: "rotateY(180deg)" }}
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border-2 border-indigo-500/50 p-4 flex flex-col bg-slate-800 overflow-hidden shadow-2xl"
          )}
        >
          {/* Flip Button (Back) */}
          <button
            onClick={handleFlip}
            className="absolute top-2 left-2 z-20 p-1 rounded-md bg-slate-700 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors shadow-lg"
          >
            <RotateCcw size={14} />
          </button>

          <div className="flex items-center justify-end mb-3 border-b border-slate-700 pb-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Card Intel</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-4 italic">
              "{card.description}"
            </p>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Success
                </span>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex flex-wrap gap-1">
                  {card.successEffect.damage && (
                    <span className="text-[10px] font-bold text-emerald-300">Deal {card.successEffect.damage} Damage</span>
                  )}
                  {card.successEffect.block && (
                    <span className="text-[10px] font-bold text-emerald-300">Block {card.successEffect.block} Damage</span>
                  )}
                  {card.successEffect.oddsModifier && (
                    <span className="text-[10px] font-bold text-indigo-300">+{card.successEffect.oddsModifier}% Success Next Play</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Failure
                </span>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                  {card.failEffect && !card.failEffect.nothing ? (
                    <div className="flex flex-wrap gap-1">
                      {card.failEffect.damage && (
                        <span className="text-[10px] font-bold text-rose-300">Still Deal {card.failEffect.damage} Damage</span>
                      )}
                      {card.failEffect.takeDamage && (
                        <span className="text-[10px] font-bold text-rose-400 underline decoration-rose-500/50">Lose {card.failEffect.takeDamage} HP</span>
                      )}
                      {card.failEffect.loseTurn && (
                        <span className="text-[10px] font-bold text-rose-400">Lose Next Turn</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 italic">No effect</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-2 text-[8px] font-black uppercase text-slate-500 text-center tracking-tighter border-t border-slate-700/50">
             {card.rarity} CARD
          </div>
        </div>
      </motion.div>
    </div>
  );
}
