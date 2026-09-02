import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { FocusRating } from '../types';
import { CheckCircle2, Sparkles, Award } from 'lucide-react';

interface SessionCompleteModalProps {
  onShowDashboard: () => void;
}

export const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({ onShowDashboard }) => {
  const {
    status,
    activeIntention,
    activeSession,
    elapsedSeconds,
    submitCompletedOutcome
  } = useFocus();

  const [outcome, setOutcome] = useState('');
  const [rating, setRating] = useState<FocusRating>('deep');

  if (status !== 'completing') return null;

  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCompletedOutcome(outcome, rating);
    onShowDashboard();
  };

  const ratings: { value: FocusRating; label: string; desc: string }[] = [
    { value: 'deep', label: 'Deep Focus', desc: 'Flow state, minimal friction' },
    { value: 'moderate', label: 'Moderate', desc: 'A few drifts, but kept returning' },
    { value: 'fragmented', label: 'Fragmented', desc: 'Heavy mental friction or interruptions' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-lg w-full glass-panel rounded-3xl p-8 border border-emerald-500/40 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            Session Complete • {durationMinutes} Minutes
          </span>
          <h2 className="text-3xl font-light text-white tracking-tight">
            What did you accomplish?
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Goal was: <span className="text-white italic">"{activeIntention?.title}"</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
              Tangible Outcome / Deliverable
            </label>
            <input
              type="text"
              autoFocus
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Wrote 3 unit tests, finished schema, understood graphs..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/80"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Focus Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ratings.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRating(r.value)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    rating === r.value
                      ? 'bg-emerald-400/15 border-emerald-400/60 text-white shadow-inner'
                      : 'bg-obsidian-900 border-obsidian-800 text-slate-400 hover:bg-obsidian-850'
                  }`}
                >
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {activeSession && activeSession.driftCount > 0 && (
            <div className="p-3 rounded-xl bg-obsidian-900/80 border border-obsidian-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Drifts successfully intercepted:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {activeSession.driftCount} recovered
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-white hover:bg-slate-200 text-obsidian-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Outcome & View Report
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>
        </form>
      </div>
    </div>
  );
};
