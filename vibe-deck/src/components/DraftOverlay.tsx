import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card as CardUI } from "./Card";
import { useGameStore } from "../store/useGameStore";

export function DraftOverlay() {
  const { phase, draftOptions, draftCard, setFocusedCard } = useGameStore();

  if (phase !== "DRAFT") return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <Trophy size={60} className="text-yellow-500 mb-4" />
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-white">
          Victory!
        </h2>
        <p className="text-slate-400 mb-12">
          Choose a card to add to your deck
        </p>

        <div className="flex gap-6">
          {draftOptions.map((card) => (
            <CardUI
              key={card.instanceId}
              card={card}
              onClick={() => draftCard(card)}
              onInfoClick={() => setFocusedCard(card)}
              modifiers={[]}
              enemyDebuff={0}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
