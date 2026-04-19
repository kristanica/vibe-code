import { motion, AnimatePresence } from "framer-motion";
import { Swords, Heart, Zap, Skull, Sparkles } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MapNode } from "../types/game";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MapOverlay() {
  const { phase, floor, mapNodes, selectMapNode } = useGameStore();

  if (phase !== "MAP") return null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-[120] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center w-full max-w-4xl"
      >
        <div className="text-center mb-16">
          <span className="text-indigo-400 font-black tracking-[0.4em] uppercase text-xs mb-4 block">
            Navigation
          </span>
          <h2 className="text-7xl font-black uppercase italic tracking-tighter text-white mb-2">
            Floor {floor}
          </h2>
          <div className="h-1.5 w-32 bg-indigo-500 rounded-full mx-auto" />
        </div>

        <div className="flex flex-wrap justify-center gap-12 w-full">
          <AnimatePresence mode="wait">
            {mapNodes.map((node: MapNode, i: number) => (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, scale: 0.8, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMapNode(node)}
                className="group relative flex flex-col items-center"
              >
                <div className="absolute top-1/2 left-full w-12 h-0.5 bg-slate-800 -z-10 hidden md:block" />

                <div
                  className={cn(
                    "w-48 h-64 rounded-[2.5rem] border-4 flex flex-col items-center justify-center p-6 transition-all duration-500 shadow-2xl relative overflow-hidden bg-slate-900/40 backdrop-blur-md",
                    node.type === "BOSS"
                      ? "border-red-500 shadow-red-500/20"
                      : node.type === "REST"
                        ? "border-emerald-500 shadow-emerald-500/20"
                        : node.type === "SHOP"
                          ? "border-yellow-500 shadow-yellow-500/20"
                          : "border-slate-700 hover:border-indigo-500 shadow-indigo-500/10",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div
                    className={cn(
                      "p-5 rounded-3xl mb-6 transition-transform duration-500 group-hover:scale-110",
                      node.type === "BOSS"
                        ? "bg-red-500/20 text-red-400"
                        : node.type === "REST"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : node.type === "SHOP"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-indigo-500/20 text-indigo-400",
                    )}
                  >
                    {node.type === "BATTLE" && <Swords size={40} />}
                    {node.type === "REST" && <Heart size={40} />}
                    {node.type === "SHOP" && <Zap size={40} />}
                    {node.type === "BOSS" && <Skull size={40} />}
                    {node.type === "EVENT" && <Sparkles size={40} />}
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                    Destination
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white text-center leading-none">
                    {node.label}
                  </h3>

                  {node.type === "REST" && (
                    <p className="mt-4 text-[10px] font-bold text-emerald-400/70 uppercase">
                      Heal 30% HP
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 flex items-center gap-4 text-slate-500">
          <div className="w-12 h-px bg-slate-800" />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Select your next encounter
          </p>
          <div className="w-12 h-px bg-slate-800" />
        </div>
      </motion.div>
    </div>
  );
}
