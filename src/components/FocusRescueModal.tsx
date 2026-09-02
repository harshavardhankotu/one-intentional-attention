import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { LifeBuoy, X, Sparkles, ArrowRight } from 'lucide-react';

export const FocusRescueModal: React.FC = () => {
  const { isRescueModalOpen, closeRescueModal, applyFocusRescue } = useFocus();

  const [newGoal, setNewGoal] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRescueModalOpen) {
        closeRescueModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRescueModalOpen, closeRescueModal]);

  if (!isRescueModalOpen) return null;

  const handleRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyFocusRescue(selectedDuration, newGoal);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rescue-title"
      className="fixed inset-0 z-50 bg-obsidian-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-emerald-500/30 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Focus Rescue
            </span>
          </div>
          <button
            onClick={closeRescueModal}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4">
          <h3 id="rescue-title" className="text-2xl font-light text-white tracking-tight mb-2">
            You haven't lost the day.
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Forget what happened this morning. Self-criticism only delays action. What is one small thing that needs your care right now?
          </p>
        </div>

        <form onSubmit={handleRescue} className="space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
              One thing right now
            </label>
            <input
              type="text"
              autoFocus
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g. Write just 1 page, fix one bug..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/80"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Gentle Rescue Block
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedDuration(mins)}
                  className={`py-2.5 rounded-xl text-xs font-mono border transition-all ${
                    selectedDuration === mins
                      ? 'bg-emerald-400 text-obsidian-950 font-bold border-emerald-400 shadow-md'
                      : 'bg-obsidian-900 text-slate-300 border-obsidian-800 hover:bg-obsidian-850'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-obsidian-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Start Clean Reset
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono mt-4">
          No streak punishment • Zero guilt • Clean restart
        </p>
      </div>
    </div>
  );
};
