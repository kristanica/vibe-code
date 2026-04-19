import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { BookOpen, ArrowRight, Zap, Target, Flame, AlertCircle } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Probability Deck",
    content: "This is a roguelike deckbuilder where transparency is everything. Every card shows your exact chance of success.",
    icon: <BookOpen className="text-indigo-400" size={40} />,
  },
  {
    title: "The Core Mechanic",
    content: "When you play a card, the game rolls a 100-sided die. If the roll is less than or equal to the Success Rate, the card succeeds.",
    icon: <Zap className="text-yellow-400" size={40} />,
  },
  {
    title: "The Combo System",
    content: "Success builds momentum. Every successful card increases your Combo, giving you +2% Success Chance for your next play!",
    icon: <Target className="text-purple-400" size={40} />,
  },
  {
    title: "The Pity System",
    content: "Don't fear failure. Every consecutive failed card gives you a cumulative +5% Pity Bonus to ensure your next big play lands.",
    icon: <AlertCircle className="text-blue-400" size={40} />,
  },
  {
    title: "Entropy",
    content: "The universe becomes unstable with every success. Each successful play adds 1 Entropy, reducing your success rate by 0.5% for the rest of the battle.",
    icon: <Flame className="text-orange-400" size={40} />,
  },
  {
    title: "Persistent Resources",
    content: "HP, Energy, Discards, and Shuffles carry over between floors. Manage them wisely to survive the Pit Boss!",
    icon: <ArrowRight className="text-emerald-400" size={40} />,
  }
];

export function TutorialOverlay() {
  const { tutorialStep, nextTutorialStep, finishTutorial, isTutorialOpen } = useGameStore();
  const step = TUTORIAL_STEPS[tutorialStep];

  if (!isTutorialOpen || !step) return null;

  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
             Step {tutorialStep + 1} / {TUTORIAL_STEPS.length}
           </span>
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="p-4 bg-slate-800 rounded-2xl shadow-inner border border-slate-700/50">
            {step.icon}
          </div>
          
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-3">
              {step.title}
            </h2>
            <p className="text-slate-400 font-bold leading-relaxed">
              {step.content}
            </p>
          </div>

          <button
            onClick={isLastStep ? finishTutorial : nextTutorialStep}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            {isLastStep ? "Start Your Run" : "Next Detail"}
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
