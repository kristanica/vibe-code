import { motion } from "framer-motion";
import { Swords, Heart, Sparkles } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

export function LevelUpOverlay() {
  const { phase, player, upgradeStat } = useGameStore();

  if (phase !== "LEVEL_UP") return null;

  const options = [
    {
      id: "attackBonus" as const,
      name: "Slayer's Edge",
      description: "+1 Permanent Damage to all attacks",
      icon: <Swords size={32} className="text-red-500" />,
      color: "border-red-500/30 hover:border-red-500 bg-red-500/5",
    },
    {
      id: "maxHpBonus" as const,
      name: "Fortitude",
      description: "+5 Max HP and heal 5 HP",
      icon: <Heart size={32} className="text-emerald-500" />,
      color: "border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5",
    },
    {
      id: "successRateBonus" as const,
      name: "Precision",
      description: "+2% Base Success Rate to all cards",
      icon: <Sparkles size={32} className="text-indigo-500" />,
      color: "border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5",
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center max-w-4xl w-full"
      >
        <div className="bg-indigo-600 px-6 py-2 rounded-full mb-6">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Level Up!
          </span>
        </div>
        
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 text-white text-center">
          Choose Your Specialty
        </h2>
        <p className="text-slate-400 mb-12 text-lg">
          You reached Level {player.level + 1}. Select a permanent bonus.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => upgradeStat(opt.id)}
              className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all group ${opt.color}`}
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2 text-white">
                {opt.name}
              </h3>
              <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
