import { motion, AnimatePresence } from "framer-motion";
import { Swords, Heart, Sparkles, X, Activity } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const { player } = useGameStore();

  if (!isOpen) return null;

  const statItems = [
    {
      label: "Attack Bonus",
      value: `+${player.stats.attackBonus}`,
      icon: <Swords size={20} className="text-red-500" />,
      description: "Added to all attack damage"
    },
    {
      label: "HP Bonus",
      value: `+${player.stats.maxHpBonus}`,
      icon: <Heart size={20} className="text-emerald-500" />,
      description: "Increased maximum vitality"
    },
    {
      label: "Luck / Precision",
      value: `+${player.stats.successRateBonus}%`,
      icon: <Sparkles size={20} className="text-indigo-500" />,
      description: "Added to all card success rates"
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Activity className="text-indigo-400" size={24} />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Character Stats</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Current Level</p>
                <p className="text-3xl font-black italic text-white">LEVEL {player.level}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total EXP</p>
                <p className="font-bold text-white tabular-nums">{player.exp} / {player.nextLevelExp}</p>
              </div>
            </div>

            <div className="space-y-3">
              {statItems.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-800/50">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-100 uppercase text-xs tracking-wider">{item.label}</span>
                      <span className="font-black text-lg text-white tabular-nums">{item.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {player.relics.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-3 flex items-center gap-2">
                  <div className="h-px w-4 bg-amber-500/30" /> Collected Relics
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {player.relics.map((relic) => (
                    <div key={relic.id} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                      <span className="text-xl">{relic.icon}</span>
                      <div>
                        <p className="text-[10px] font-black uppercase text-amber-200 leading-none mb-1">{relic.name}</p>
                        <p className="text-[9px] text-amber-500/70 font-medium leading-tight">{relic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-900/50 border-t border-slate-800">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
            >
              Back to Game
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
