import { ScrollText } from "lucide-react";

interface BattleLogProps {
  log: string[];
}

export function BattleLog({ log }: BattleLogProps) {
  const renderLogMessage = (message: string) => {
    const parts = message.split(/(\bSUCCESS\b|\bFAILED\b|\bdamage\b|\bblock\b|\benergy\b|(?:\d+))/);
    
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (part === 'SUCCESS') return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
      if (part === 'FAILED') return <span key={i} className="text-rose-500 font-bold">{part}</span>;
      if (lower === 'damage') return <span key={i} className="text-red-400 font-semibold">{part}</span>;
      if (lower === 'block') return <span key={i} className="text-blue-400 font-semibold">{part}</span>;
      if (lower === 'energy') return <span key={i} className="text-yellow-400 font-semibold">{part}</span>;
      if (/^\d+$/.test(part)) return <span key={i} className="text-white font-black">{part}</span>;
      return part;
    });
  };

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 hidden xl:block z-30">
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50 backdrop-blur-md shadow-2xl">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ScrollText size={12} /> Battle Log
        </h3>
        <div className="space-y-2 h-64 overflow-y-auto custom-scrollbar text-xs text-slate-400 font-medium pr-2">
          {log.map((m, i) => (
            <p key={i} className={`transition-colors duration-300 leading-relaxed ${i === 0 ? "text-indigo-300" : "opacity-60 hover:opacity-100"}`}>
              {renderLogMessage(m)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
