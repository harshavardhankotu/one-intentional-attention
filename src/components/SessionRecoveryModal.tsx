import React from 'react';
import { PersistedSessionState } from '../types';
import { Compass, RotateCcw, CheckCircle2, Trash2 } from 'lucide-react';

interface SessionRecoveryModalProps {
  recoveredState: PersistedSessionState;
  onResume: () => void;
  onEndAndRecord: () => void;
  onDiscard: () => void;
}

export const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  recoveredState,
  onResume,
  onEndAndRecord,
  onDiscard
}) => {
  const elapsedMinutes = Math.floor(recoveredState.session.elapsedSeconds / 60);
  const targetMinutes = Math.round(recoveredState.targetDurationSeconds / 60);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-title"
      className="fixed inset-0 z-50 bg-obsidian-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-amber-500/40 shadow-2xl relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Session Recovery
          </span>
        </div>

        <h3 id="recovery-title" className="text-2xl font-light text-white tracking-tight mb-2">
          You had a focus session in progress.
        </h3>

        <p className="text-xs text-slate-400 mb-4">
          The browser was refreshed or closed during an active focus block. Your progress was safely preserved.
        </p>

        <div className="p-4 rounded-2xl bg-obsidian-900 border border-obsidian-700/80 mb-6">
          <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
            Goal in progress
          </span>
          <p className="text-base text-white font-medium mb-2">
            "{recoveredState.intention.title}"
          </p>
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>Progress:</span>
            <span className="text-amber-400">
              {elapsedMinutes}m completed of {targetMinutes}m
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-obsidian-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Resume Focus Session
          </button>

          <button
            onClick={onEndAndRecord}
            className="w-full py-3 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-obsidian-700 text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Finish & Record Accomplishment
          </button>

          <button
            onClick={onDiscard}
            className="w-full py-2.5 rounded-2xl text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Discard & Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
